<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * F2: conversations with the PCT team next to questions between researchers.
 * F10: read state, archive and attachments in Messages.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('channels', function (Blueprint $table) {
            // question: a researcher asks a protocol's author; team: the PCT team and a
            // researcher (protocol_owner_id); feedback: the thread on one feedback point.
            $table->string('kind')->default('question')->after('id');
            $table->string('subject')->nullable()->after('kind');
            $table->foreignId('feedback_point_id')->nullable()->after('protocol_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('protocol_id')->nullable()->change();
            $table->unsignedBigInteger('questioner_id')->nullable()->change();
        });

        Schema::create('channel_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('channel_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('last_read_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->unique(['channel_id', 'user_id']);
        });

        // Conversations from before read state existed start as read.
        $now = now();
        foreach (DB::table('channels')->get(['id', 'protocol_owner_id', 'questioner_id']) as $channel) {
            foreach (array_unique(array_filter([$channel->protocol_owner_id, $channel->questioner_id])) as $userId) {
                DB::table('channel_user')->insertOrIgnore(['channel_id' => $channel->id, 'user_id' => $userId, 'last_read_at' => $now]);
            }
        }

        Schema::table('messages', function (Blueprint $table) {
            $table->string('attachment_path')->nullable()->after('text');
            $table->string('attachment_name')->nullable()->after('attachment_path');
        });
    }

    public function down(): void
    {
        Schema::table('messages', fn (Blueprint $table) => $table->dropColumn(['attachment_path', 'attachment_name']));
        Schema::dropIfExists('channel_user');
        Schema::table('channels', function (Blueprint $table) {
            $table->dropConstrainedForeignId('feedback_point_id');
            $table->dropColumn(['kind', 'subject']);
        });
    }
};

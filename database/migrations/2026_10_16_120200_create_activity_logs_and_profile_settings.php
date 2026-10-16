<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // F6: what happened to a researcher's protocols, for the dashboard's audit trail.
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('protocol_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->json('data')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['owner_id', 'created_at']);
        });

        // F11: new protocols start with "publish my name" on or off.
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('publish_name_default')->default(false)->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('publish_name_default'));
        Schema::dropIfExists('activity_logs');
    }
};

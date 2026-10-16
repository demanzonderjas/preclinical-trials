<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * F1: per-field reviewer feedback. A protocol gets a review round per submission; the PCT
 * team attaches feedback points to fields. Each point's thread is a channel of kind
 * "feedback", so it shows in Messages with the other conversations.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('review_rounds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('protocol_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('number');
            $table->timestamp('submitted_at')->nullable();
            $table->string('decision')->nullable(); // approved | returned
            $table->timestamp('decided_at')->nullable();
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('message')->nullable(); // to the researcher
            $table->text('internal_note')->nullable(); // PCT team only
            $table->text('researcher_note')->nullable(); // sent with a resubmission
            $table->timestamps();
            $table->unique(['protocol_id', 'number']);
        });

        Schema::create('feedback_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_round_id')->constrained()->cascadeOnDelete();
            $table->foreignId('protocol_id')->constrained()->cascadeOnDelete();
            $table->string('field_key');
            $table->text('body');
            $table->string('status')->default('open'); // open | addressed | resolved
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('addressed_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->index(['protocol_id', 'status']);
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('feedback_points');
        Schema::dropIfExists('review_rounds');
    }
};

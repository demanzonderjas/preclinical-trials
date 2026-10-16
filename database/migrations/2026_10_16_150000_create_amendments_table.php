<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Changes to a published protocol wait here until the PCT team approves them; until then
 * readers keep seeing the published version.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('amendments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('protocol_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->text('values'); // encrypted JSON of the changed answers
            $table->text('reason')->nullable();
            $table->string('status')->default('pending'); // pending | returned | approved | withdrawn
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('message')->nullable(); // from the PCT team when returned
            $table->timestamps();
            $table->index(['protocol_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('amendments');
    }
};

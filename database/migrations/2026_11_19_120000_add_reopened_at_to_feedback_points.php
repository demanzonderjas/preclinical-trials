<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * F1: a change to a field marks its open feedback points addressed. When the researcher
 * undoes that ("keep it open"), later changes to the field leave the point open.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('feedback_points', function (Blueprint $table) {
            $table->timestamp('reopened_at')->nullable()->after('addressed_at');
        });
    }

    public function down(): void
    {
        Schema::table('feedback_points', function (Blueprint $table) {
            $table->dropColumn('reopened_at');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** The PCT team sorts questions within a category (A2 admin content). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('faq_items', function (Blueprint $table) {
            $table->integer('order')->default(0)->after('faq_category_id');
        });
    }

    public function down(): void
    {
        Schema::table('faq_items', fn (Blueprint $table) => $table->dropColumn('order'));
    }
};

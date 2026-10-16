<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('faq_items', function (Blueprint $table) {
            // Who a question is for (researcher, ethics, editor, funder, public); null = researchers.
            $table->json('audiences')->nullable()->after('status');
            $table->unsignedInteger('helpful_count')->default(0)->after('audiences');
            $table->unsignedInteger('not_helpful_count')->default(0)->after('helpful_count');
        });
    }

    public function down(): void
    {
        Schema::table('faq_items', function (Blueprint $table) {
            $table->dropColumn(['audiences', 'helpful_count', 'not_helpful_count']);
        });
    }
};

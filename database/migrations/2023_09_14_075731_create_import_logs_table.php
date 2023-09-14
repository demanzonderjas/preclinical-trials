<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateImportLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('import_logs', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('protocol_id')->unsigned()->nullable();
            $table->foreign('protocol_id')->references('id')->on('protocols')->onDelete('set null');
            $table->string('type')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('import_logs');
    }
}

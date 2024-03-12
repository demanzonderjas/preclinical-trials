<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLinkedProtocolsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('linked_protocols', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('protocol_id')->unsigned();
            $table->foreign('protocol_id')->references('id')->on('protocols')->onDelete('cascade');
            $table->bigInteger('linked_protocol_id')->unsigned();
            $table->foreign('linked_protocol_id')->references('id')->on('protocols')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('linked_protocols');
    }
}

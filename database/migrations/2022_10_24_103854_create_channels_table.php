<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChannelsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('channels', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('protocol_id')->unsigned();
            $table->foreign('protocol_id')->references('id')->on('protocols')->onDelete('cascade');
            $table->bigInteger('protocol_owner_id')->unsigned();
            $table->foreign('protocol_owner_id')->references('id')->on('users')->onDelete('cascade');
            $table->bigInteger('questioner_id')->unsigned();
            $table->foreign('questioner_id')->references('id')->on('users')->onDelete('cascade');
            $table->boolean('blocked')->default(FALSE);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('channels');
    }
}

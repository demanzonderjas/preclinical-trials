<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEmbargoExtensionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('embargo_extensions', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('protocol_id')->unsigned();
            $table->foreign('protocol_id')->references('id')->on('protocols')->onDelete('cascade');
            $table->text('reason')->nullable();
            $table->string('status')->default('awaiting_approval');
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
        Schema::dropIfExists('embargo_extensions');
    }
}

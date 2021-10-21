<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTripRoutesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('trip_routes', function (Blueprint $table) {
            $table->uuid('trip_uuid');
            $table->unsignedInteger('line_num');
            $table->date('date');
            $table->string('type');
            $table->string('from');
            $table->string('to');

            $table->primary(['trip_uuid', 'line_num']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('trip_routes');
    }
}

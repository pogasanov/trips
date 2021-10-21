<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePerDiemRatesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('per_diem_rates', function (Blueprint $table) {
            $table->uuid('uuid');
            $table->string('name');
            $table->unsignedDouble('rate');
            $table->uuid('organization_uuid');
            $table->boolean('default');

            $table->primary('uuid');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('per_diem_rates');
    }
}

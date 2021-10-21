<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTripsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->uuid('uuid');
            $table->string('number');
            $table->date('date');
            $table->string('name');
            $table->string('status');
            $table->string('condition');
            $table->string('type');
            $table->uuid('basis_uuid')->default('');
            $table->string('basis_update_reason')->default('');
            $table->uuid('organization_uuid');
            $table->uuid('employee_uuid');
            $table->string('destination_organization');
            $table->string('destination_city');
            $table->string('errand');
            $table->date('date_start');
            $table->date('date_end');
            $table->double('price_tickets')->nullable();
            $table->double('price_living')->nullable();
            $table->uuid('per_diem_rate_uuid');
            $table->unsignedInteger('smartway_codes_count')->nullable();
            $table->boolean('is_draft');
            $table->boolean('is_editable');

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
        Schema::dropIfExists('trips');
    }
}

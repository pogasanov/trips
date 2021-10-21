<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAdvancesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('advances', function (Blueprint $table) {
            $table->uuid('uuid');
            $table->string('number');
            $table->date('date');
            $table->string('name');
            $table->string('status');
            $table->string('condition');
            $table->unsignedDouble('total_price');
            $table->boolean('is_draft');
            $table->boolean('is_editable');

            $table->uuid('basis_uuid')->default('');
            $table->uuid('organization_uuid');
            $table->uuid('employee_uuid');
            $table->uuid('purpose_uuid');

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
        Schema::dropIfExists('advances');
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateExpenditureOrganizationTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('expenditure_organization', function (Blueprint $table) {
            $table->uuid('expenditure_uuid');
            $table->uuid('organization_uuid');

            $table->primary(['expenditure_uuid', 'organization_uuid'], 'expenditure_organization_uuids_primary');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('expenditure_organization');
    }
}

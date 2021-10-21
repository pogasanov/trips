<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAdvanceItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('advance_items', function (Blueprint $table) {
            $table->uuid('advance_uuid');
            $table->unsignedInteger('line_num');
            $table->string('incoming_doc_type');
            $table->string('incoming_doc_number');
            $table->date('incoming_doc_date')->nullable();
            $table->string('invoice_number');
            $table->date('invoice_date')->nullable();
            $table->uuid('partner_uuid');
            $table->string('content');
            $table->unsignedInteger('quantity');
            $table->unsignedDouble('price');
            $table->unsignedDouble('total');
            $table->string('vat_rate');
            $table->unsignedDouble('vat_total')->nullable();

            $table->primary(['advance_uuid', 'line_num']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('advance_items');
    }
}

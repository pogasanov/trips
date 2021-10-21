<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FeatureTestsSeeder extends Seeder
{
    /**
     * Run the database seeders.
     *
     * @return void
     */
    public function run()
    {
        DB::table('users')->insert([
            'uuid' => '1',
            'name' => 'test',
            'organization_uuid' => '1'
        ]);

        DB::table('per_diem_rates')->insert([
            [
                'uuid' => '1',
                'name' => 'First perdiem',
                'rate' => 1,
                'organization_uuid' => '1',
                'default' => true,
            ],
            [
                'uuid' => '2',
                'name' => 'Second perdiem',
                'rate' => 2,
                'organization_uuid' => '1',
                'default' => false,
            ],
            [
                'uuid' => '3',
                'name' => 'Third perdiem',
                'rate' => 3,
                'organization_uuid' => '2',
                'default' => true,
            ],
        ]);

        DB::table('organizations')->insert([
            [
                'uuid' => '1',
                'name' => 'Microsoft',
            ],
            [
                'uuid' => '2',
                'name' => 'Apple',
            ],
        ]);

        DB::table('partners')->insert([
            [
                'uuid' => '31',
                'name' => 'Partner A',
            ],
            [
                'uuid' => '32',
                'name' => 'Partner B',
            ],
        ]);

        DB::table('organization_partner')->insert([
            [
                'organization_uuid' => '1',
                'partner_uuid' => '31',
            ],
            [
                'organization_uuid' => '2',
                'partner_uuid' => '32',
            ],
        ]);

        DB::table('expenditures')->insert([
            [
                'uuid' => '1',
                'name' => 'Покупка',
                'require_basis' => '0',
            ],
            [
                'uuid' => '2',
                'name' => 'Неизвестно',
                'require_basis' => '1',
            ],
        ]);

        DB::table('expenditure_organization')->insert([
            [
                'expenditure_uuid' => '1',
                'organization_uuid' => '1',
            ],
            [
                'expenditure_uuid' => '1',
                'organization_uuid' => '2',
            ],
        ]);

        DB::table('trips')->insert([
            [
                'uuid' => '1',
                'number' => '1',
                'date' => '2020-10-20',
                'name' => 'Тестовая поездка',
                'status' => 'Согласовано',
                'condition' => 'Согласовано',
                'basis_uuid' => '',
                'organization_uuid' => '1',
                'employee_uuid' => '1',
                'type' => 'Заявка на командировку',
                'destination_organization' => '7',
                'destination_city' => '8',
                'errand' => 'Задача',
                'date_start' => '2020-05-20',
                'date_end' => '2020-05-20',
                'price_tickets' => '10',
                'price_living' => '11',
                'per_diem_rate_uuid' => '2',
                'smartway_codes_count' => '13',
                'is_draft' => '0',
                'is_editable' => '0',
            ],
        ]);

        DB::table('trip_routes')->insert([
            [
                'trip_uuid' => '1',
                'line_num' => '1',
                'date' => '2020-10-11',
                'type' => 'Авиа',
                'from' => 'Краснодар',
                'to' => 'Красноярск',
            ],
            [
                'trip_uuid' => '1',
                'line_num' => '2',
                'date' => '2020-10-12',
                'type' => 'ЖД',
                'from' => 'Москва',
                'to' => 'Санкт-Петербург',
            ],
        ]);

        DB::table('trip_files')->insert([
            [
                'uuid' => '1',
                'name' => 'cute_cat.jpg',
                'trip_uuid' => '1',
            ],
            [
                'uuid' => '2',
                'name' => 'cute_dog.jpg',
                'trip_uuid' => '1',
            ],
        ]);
    }
}

<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Expenditure;
use App\Models\Organization;
use App\Models\Partner;
use App\Models\Trip;
use App\Models\TripFile;
use App\Models\TripRoute;
use App\Models\User;

class UpdateTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config([
            'services.onec.username' => 'user',
            'services.onec.password' => 'pass',
        ]);
        $this->encoded_password = base64_encode('user:pass');
    }

    private function performUpdateTestOnTable($table, $makeModel, $hiddenAttributes)
    {
        $should_not_exists = $makeModel()->create()->toArray();
        $payload = $makeModel()->count(2)
            ->make()
            ->makeVisible($hiddenAttributes)
            ->toArray();

        $response = $this->json('POST', '/update', [$table => $payload], [
            'Authorization' => "Basic $this->encoded_password"
        ]);
        $response->assertStatus(200);

        $this->assertDatabaseHas($table, $payload[0]);
        $this->assertDatabaseHas($table, $payload[1]);
        $this->assertDatabaseMissing($table, $should_not_exists);
    }

    public function testUpdateExpenditures()
    {
        $this->performUpdateTestOnTable('expenditures', function () {
            return Expenditure::factory();
        }, []);
    }

    public function testReturnErrorIfIncorrectTableName()
    {
        $this->json('POST', '/update', ['notexists' => [['test' => 'something']]], [
            'Authorization' => "Basic $this->encoded_password"
        ])
            ->assertSeeText(["Your payload has non-used table names: notexists"])
            ->assertStatus(400);
    }

    public function testUpdateOrganizations()
    {
        $this->performUpdateTestOnTable('organizations', function () {
            return Organization::factory();
        }, []);
    }

    public function testUpdatePartners()
    {
        $this->performUpdateTestOnTable('partners', function () {
            return Partner::factory();
        }, []);
    }

    public function testUpdateTrips()
    {
        $this->performUpdateTestOnTable('trips', function () {
            return Trip::factory()
                ->for($this->user->organization)
                ->for($this->user, 'employee');
        }, [
            'basis_uuid',
            'organization_uuid',
            'employee_uuid',
            'destination_organization',
            'destination_city',
            'errand',
            'date_start',
            'date_end',
            'price_tickets',
            'price_living',
            'per_diem_rate_uuid',
            'smartway_codes_count',
            'is_draft',
        ]);
    }

    public function testUpdateTripRoutes()
    {
        $trip = Trip::factory()
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->create();
        $this->performUpdateTestOnTable('trip_routes', function () use ($trip) {
            return TripRoute::factory()->for($trip);
        }, ['trip_uuid']);
    }

    public function testUpdateTripFiles()
    {
        $trip = Trip::factory()
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->create();
        $this->performUpdateTestOnTable('trip_files', function () use ($trip) {
            return TripFile::factory()->for($trip);
        }, ['trip_uuid']);
    }

    public function testUpdateUsers()
    {
        // This should not exist
        User::factory()->forOrganization()->create(['uuid' => '123456']);
        // This should exist AND keep it's api token
        User::factory()->forOrganization()->create([
            'uuid' => '67890',
            'name' => 'should exist',
            'api_token' => '123456'
        ]);
        $encoded_password = base64_encode('user:pass');

        $payload = array_merge(
            User::factory()->forOrganization()->count(2)->make()->toArray(),
            [
                [
                    'uuid' => '67890',
                    'name' => 'should exist'
                ]
            ]
        );

        $this->json('POST', '/update', [
            'users' => $payload
        ], [
            'Authorization' => "Basic $encoded_password"
        ])->assertStatus(200);

        $this->assertDatabaseHas('users', $payload[0]);
        $this->assertDatabaseHas('users', $payload[1]);
        $this->assertDatabaseHas('users', [
            'uuid' => '67890',
            'name' => 'should exist',
            'api_token' => '123456'
        ]);
        $this->assertDatabaseMissing('users', ['uuid' => '123456']);
    }

    public function testDoNotDeleteTableIfHeaderPresent()
    {
        Organization::factory()
            ->create(['name' => 'should exists']);
        $encoded_password = base64_encode('user:pass');

        $payload = Organization::factory()->count(2)->make();

        $this->json('POST', '/update', [
            'organizations' => $payload
        ], [
            'Authorization' => "Basic $encoded_password",
            "DO-NOT-DELETE" => "1"
        ])->assertStatus(200);

        $this->assertDatabaseHas('organizations', $payload[0]->toArray());
        $this->assertDatabaseHas('organizations', $payload[1]->toArray());
        $this->assertDatabaseHas('organizations', ['name' => 'should exists']);
    }

    public function testFailIncorrectCredentials()
    {
        $encoded_password = base64_encode('bad:wrong');

        $this->json('POST', '/update', [
            'projects' => [
                [
                    'uuid' => '1',
                    'name' => 'a'
                ]
            ]
        ], [
            'Authorization' => "Basic $encoded_password"
        ])->assertStatus(401);

        $this->assertDatabaseMissing('trips',
            [
                'uuid' => '1',
                'name' => 'a'
            ]);
    }

    public function testFailNoCredentials()
    {
        $this->json('POST', '/update', [
            'organizations' => [Organization::factory()->make(['uuid' => '1'])]
        ])->assertStatus(401);

        $this->assertDatabaseMissing('organizations', ['uuid' => '1']);
    }
}

<?php

namespace Tests\Feature;

use Illuminate\Http\Client\Request;
use Tests\TestCase;
use App\Models\Trip;
use App\Models\TripFile;
use App\Models\TripRoute;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

class TripTest extends TestCase
{
    public function testListsTrips()
    {
        $this->createMultipleTrips();

        $this->actingAs($this->user)
            ->json('GET', '/trip')
            ->assertJsonFragment(['number' => '111'])
            ->assertJsonFragment(['number' => '222'])
            ->assertJsonMissing(['number' => '333'])
            ->assertJsonMissing(['organization' => $this->user->organization->uuid])
            ->assertStatus(200);
    }

    public function testDraftsTrips()
    {
        $this->createMultipleTrips();

        $this->actingAs($this->user)
            ->json('GET', '/trip?is_draft=1')
            ->assertJsonMissing(['number' => '111'])
            ->assertJsonMissing(['number' => '222'])
            ->assertJsonFragment(['number' => '333'])
            ->assertJsonMissing(['organization' => $this->user->organization->uuid])
            ->assertStatus(200);
    }

    public function testDoesntSeeAnotherEmployeeTrips()
    {
        Trip::factory()
            ->for($this->user->organization)
            ->for(User::factory()->for($this->user->organization), 'employee')
            ->create();

        $this->actingAs($this->user)
            ->json('GET', '/trip')
            ->assertJsonCount(0);
    }

    public function testShowTrip()
    {
        $trip = Trip::factory()
            ->has(TripRoute::factory()
                ->state(new Sequence(
                    ['type' => 'Авто'],
                    ['type' => 'Самолёт'],
                ))
                ->count(2))
            ->has(TripFile::factory()
                ->state(new Sequence(
                    ['name' => 'cute_dog.jpg'],
                    ['name' => 'cute_cat.jpg'],
                ))
                ->count(2))
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->create([
                'number' => '111',
            ]);

        $this->actingAs($this->user)
            ->json('GET', "/trip/$trip->uuid")
            ->assertJsonFragment(['number' => '111'])
            ->assertJsonFragment(['organization_uuid' => $this->user->organization->uuid])
            ->assertJsonFragment(['type' => 'Авто'])
            ->assertJsonFragment(['type' => 'Самолёт'])
            ->assertJsonFragment(['name' => 'cute_dog.jpg'])
            ->assertJsonFragment(['name' => 'cute_cat.jpg'])
            ->assertStatus(200);
    }

    public function testCreateTrip()
    {
        $headers = [
            'type' => 'Заявка на командировку',
            'destination_organization' => '7',
            'destination_city' => '8',
            'errand' => '9',
            'date_start' => '2020-05-20',
            'date_end' => '2020-05-20',
            'price_tickets' => '10',
            'price_living' => '11',
            'per_diem_rate_uuid' => '1',
            'smartway_codes_count' => '13',
            'is_draft' => '0',
        ];
        $routes = [
            [
                'date' => '2020-10-11',
                'type' => 'Авто',
                'from' => 'Краснодар',
                'to' => 'Красноярск',
            ],
            [
                'date' => '2020-10-12',
                'type' => 'Самолёт',
                'from' => 'Москва',
                'to' => 'Санкт-Петербург',
            ],
        ];
        $files = [
            [
                'name' => 'cute_dog.jpg',
                'content' => 'picture_of_cute_doggy',
            ],
            [
                'name' => 'cute_cat.jpg',
                'content' => 'picture_of_cute_catty',
            ],
        ];
        $payload = array_merge($headers, ['routes' => $routes, 'files' => $files]);
        Config::set('services.onec.endpoint.trips.create', 'test');
        Http::fake([
            '*/test' => Http::response([
                'uuid' => '1',
                'number' => '2',
                'date' => '2020-10-20',
                'name' => 'Test',
                'status' => 'working',
                'condition' => 'working',
                'organization_uuid' => '11',
                'is_editable' => 0,
                'type' => 'Заявка на командировку',
                'destination_organization' => '7',
                'destination_city' => '8',
                'errand' => '9',
                'date_start' => '2020-05-20',
                'date_end' => '2020-05-20',
                'price_tickets' => '10',
                'price_living' => '11',
                'per_diem_rate_uuid' => '1',
                'smartway_codes_count' => '13',
                'is_draft' => 0,
                'routes' => [
                    [
                        'line_num' => 1,
                        'date' => '2020-10-11',
                        'type' => 'Авто',
                        'from' => 'Краснодар',
                        'to' => 'Красноярск',
                    ],
                    [
                        'line_num' => 2,
                        'date' => '2020-10-12',
                        'type' => 'Самолёт',
                        'from' => 'Москва',
                        'to' => 'Санкт-Петербург',
                    ],
                ],
                'files' => [
                    [
                        'uuid' => '1',
                        'name' => 'cute_dog.jpg',
                        'content' => 'picture_of_cute_doggy',
                    ],
                    [
                        'uuid' => '2',
                        'name' => 'cute_cat.jpg',
                        'content' => 'picture_of_cute_catty',
                    ],
                ]
            ])
        ]);

        $this->actingAs($this->user)
            ->json('POST', '/trip', $payload)
            ->assertStatus(201);

        Http::assertSentCount(1);
        Http::assertSent(function (Request $request) {
            return count($request->data()) == 3;
        });
        $this->assertDatabaseHas('trips', $headers);
        $this->assertDatabaseHas('trip_routes', $routes[0]);
        $this->assertDatabaseHas('trip_routes', $routes[1]);
        $this->assertDatabaseHas('trip_files', [
            'name' => 'cute_dog.jpg'
        ]);
        $this->assertDatabaseHas('trip_files', [
            'name' => 'cute_cat.jpg'
        ]);
    }

    public function testUpdateTrip()
    {
        // We use data from OneC, but still send frontend payload to pass validation
        // So note that those payloads DOES NOT MATCH
        $payload = [
            'type' => 'Заявка на командировку',
            'destination_organization' => '7',
            'destination_city' => '8',
            'errand' => '9',
            'date_start' => '2020-05-20',
            'date_end' => '2020-05-20',
            'price_tickets' => '10',
            'price_living' => '11',
            'per_diem_rate_uuid' => '1',
            'smartway_codes_count' => '13',
            'is_draft' => '0',
        ];
        $routes = [
            [
                'date' => '2020-10-11',
                'type' => 'Авто',
                'from' => 'Краснодар',
                'to' => 'Красноярск',
            ],
            [
                'date' => '2020-10-12',
                'type' => 'Самолёт',
                'from' => 'Москва',
                'to' => 'Санкт-Петербург',
            ],
        ];
        $files = [
            [
                'uuid' => '1',
                'name' => 'cute_dog.jpg',
            ],
            [
                'uuid' => '2',
                'name' => 'cute_cat.jpg',
            ],
        ];

        $trip = Trip::factory()
            ->has(TripRoute::factory()
                ->state(new Sequence(
                    $routes[0],
                    $routes[1],
                ))
                ->count(2))
            ->has(TripFile::factory()
                ->state(new Sequence(
                    $files[0],
                    $files[1],
                ))
                ->count(2))
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->create(array_merge($payload, ['is_editable' => true]));

        $payload['errand'] = '222';
        $payload['price_tickets'] = '333';
        $routes[1]['to'] = 'Казань';
        $files[1]['name'] = 'mad_cat.jpg';
        $files[1]['content'] = 'picture_of_cute_catty';

        Config::set('services.onec.endpoint.trips.create', 'test');
        Http::fake([
            '*/test' => Http::response([
                'uuid' => $trip->uuid,
                'number' => '2',
                'date' => '2020-10-20',
                'name' => 'Test',
                'status' => 'working',
                'condition' => 'working',
                'organization_uuid' => '11',
                'is_editable' => 0,
                'type' => 'Заявка на командировку',
                'destination_organization' => '7',
                'destination_city' => '8',
                'errand' => '222',
                'date_start' => '2021-05-20',
                'date_end' => '2021-05-20',
                'price_tickets' => '333',
                'price_living' => '11',
                'per_diem_rate_uuid' => '1',
                'smartway_codes_count' => '13',
                'is_draft' => 0,
                'routes' => [
                    [
                        'line_num' => 1,
                        'date' => '2020-10-11',
                        'type' => 'Авто',
                        'from' => 'Краснодар',
                        'to' => 'Красноярск',
                    ],
                    [
                        'line_num' => 2,
                        'date' => '2020-10-12',
                        'type' => 'Самолёт',
                        'from' => 'Москва',
                        'to' => 'Казань',
                    ],
                ],
                'files' => [
                    [
                        'uuid' => '1',
                        'name' => 'cute_dog.jpg',
                    ],
                    [
                        'uuid' => '2',
                        'name' => 'mad_cat.jpg',
                    ],
                ]
            ])
        ]);

        $this->actingAs($this->user)
            ->json('PUT', "/trip/$trip->uuid", array_merge($payload, [
                'routes' => $routes,
                'files' => $files,
            ]))
            ->assertStatus(200);

        Http::assertSentCount(1);
        $this->assertDatabaseHas('trips', [
            'errand' => '222',
            'price_tickets' => '333',
            'date_start' => '2021-05-20',
            'date_end' => '2021-05-20',
        ]);
        $this->assertDatabaseMissing('trips', [
            'errand' => '9',
        ]);
        $this->assertDatabaseMissing('trips', [
            'price_tickets' => '10',
        ]);

        $this->assertDatabaseHas('trip_routes', $routes[0]);
        $this->assertDatabaseHas('trip_routes', $routes[1]);
        $this->assertDatabaseMissing('trip_routes', [
            'to' => 'Санкт-Петербург'
        ]);

        $this->assertDatabaseHas('trip_files', [
            'name' => 'mad_cat.jpg'
        ]);
        $this->assertDatabaseHas('trip_files', [
            'name' => 'cute_dog.jpg'
        ]);
        $this->assertDatabaseMissing('trip_files', [
            'name' => 'cute_cat.jpg'
        ]);
    }

    public function testCannotUpdateTripIfNotEditable()
    {
        $payload = [
            'type' => 'Заявка на командировку',
            'destination_organization' => '7',
            'destination_city' => '8',
            'errand' => '9',
            'date_start' => '2020-05-20',
            'date_end' => '2020-05-20',
            'price_tickets' => '10',
            'price_living' => '11',
            'per_diem_rate_uuid' => '1',
            'smartway_codes_count' => '13',
            'is_draft' => '0',
        ];

        $trip = Trip::factory()
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->create($payload);

        $payload['errand'] = '222';

        $this->actingAs($this->user)
            ->json('PUT', "/trip/$trip->uuid", $payload)
            ->assertStatus(403);

        $this->assertDatabaseMissing('trips', [
            'errand' => '222'
        ]);
        $this->assertDatabaseHas('trips', [
            'errand' => '9',
        ]);
    }

    public function testDeleteTrip()
    {
        $trip = Trip::factory()
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->create();

        Config::set('services.onec.endpoint.trips.create', 'test');
        Http::fake([
            '*/test' => Http::response()
        ]);

        $this->actingAs($this->user)
            ->json('DELETE', "/trip/$trip->uuid")
            ->assertStatus(200);

        Http::assertSentCount(1);
        $this->assertDatabaseMissing('trips', $trip->toArray());
    }

    public function testAddFile()
    {
        $trip = Trip::factory()
            ->has(TripFile::factory()
                ->state([
                    'name' => 'cute_dog.jpg'
                ]))
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->create();

        $payload = [
            'name' => 'cute_cat.jpg',
            'content' => 'picture_of_cute_catty',
        ];

        Config::set('services.onec.endpoint.trips.file', 'test');
        Http::fake([
            '*/test' => Http::response([
                [
                    'uuid' => '1',
                    'name' => 'cute_dog.jpg'
                ],
                [
                    'uuid' => '2',
                    'name' => 'cute_cat.jpg',
                ]
            ])
        ]);

        $this->actingAs($this->user)
            ->json('POST', "/trip/$trip->uuid/file", $payload)
            ->assertStatus(200);

        Http::assertSentCount(1);
        Http::assertSent(function (Request $request) use ($trip) {
            if (count($request->data()) != 2) {
                return false;
            }

            if (json_decode($request->data()[0]['contents'], true)['uuid'] != $trip->uuid) {
                return false;
            }

            return true;
        });
        $this->assertDatabaseHas('trip_files', [
            'name' => 'cute_cat.jpg'
        ]);
        $this->assertDatabaseHas('trip_files', [
            'name' => 'cute_dog.jpg'
        ]);
    }

    public function testPossibleBasisDocs()
    {
        $another_user = User::factory()
            ->forOrganization()
            ->create();

        // Should see
        Trip::factory()
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->create([
                'name' => 'Приключения'
            ]);
        Trip::factory()
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->create([
                'name' => 'Отпуск'
            ]);

        // Should not see
        Trip::factory()
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->typeEdit()
            ->create([
                'name' => 'Поездка'
            ]);
        Trip::factory()
            ->for($this->user->organization)
            ->for($another_user, 'employee')
            ->create([
                'name' => 'Работа'
            ]);

        $this->actingAs($this->user)
            ->json('GET', "/trip/basis")
            ->assertJsonFragment([
                'name' => 'Приключения'
            ])
            ->assertJsonFragment([
                'name' => 'Отпуск'
            ])
            ->assertJsonMissing([
                'name' => 'Поездка'
            ])
            ->assertJsonMissing([
                'name' => 'Работа'
            ])
            ->assertStatus(200);
    }

    public function createMultipleTrips(): void
    {
        Trip::factory()
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->create([
                'number' => '111',
            ]);
        Trip::factory()
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->create([
                'number' => '222',
            ]);
        Trip::factory()
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->create([
                'number' => '333',
                'is_draft' => true
            ]);
    }
}

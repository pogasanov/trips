<?php

namespace Tests\Feature;

use App\Models\Advance;
use App\Models\AdvanceFile;
use App\Models\AdvanceItem;
use App\Models\Expenditure;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AdvanceTest extends TestCase
{
    public function testListsAdvances()
    {
        $this->createMultipleAdvances();

        $response = $this->actingAs($this->user)
            ->json('GET', '/advance');

        $response->assertStatus(200)
            ->assertJsonFragment(['number' => '111'])
            ->assertJsonFragment(['number' => '222'])
            ->assertJsonMissing(['number' => '333'])
            ->assertJsonMissing(['organization' => $this->user->organization->uuid]);
    }

    public function testDraftsAdvances()
    {
        $this->createMultipleAdvances();

        $this->actingAs($this->user)
            ->json('GET', '/advance?is_draft=1')
            ->assertJsonMissing(['number' => '111'])
            ->assertJsonMissing(['number' => '222'])
            ->assertJsonFragment(['number' => '333'])
            ->assertJsonMissing(['organization' => $this->user->organization->uuid])
            ->assertStatus(200);
    }

    public function testDoesntSeeAnotherEmployeeAdvances()
    {
        Advance::factory()
            ->for(Expenditure::factory(), 'purpose')
            ->for($this->user->organization)
            ->for(User::factory()->for($this->user->organization), 'employee')
            ->create();

        $this->actingAs($this->user)
            ->json('GET', '/advance')
            ->assertJsonCount(0);
    }

    public function testShowAdvance()
    {
        $advance = Advance::factory()
            ->has(AdvanceItem::factory()
                ->state(new Sequence(
                    ['content' => 'Авто'],
                    ['content' => 'Самолёт'],
                ))
                ->count(2))
            ->has(AdvanceFile::factory()
                ->state(new Sequence(
                    ['name' => 'cute_dog.jpg'],
                    ['name' => 'cute_cat.jpg'],
                ))
                ->count(2))
            ->for(Expenditure::factory(), 'purpose')
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->create([
                'number' => '111',
            ]);

        $this->actingAs($this->user)
            ->json('GET', "/advance/$advance->uuid")
            ->assertJsonFragment(['number' => '111'])
            ->assertJsonFragment(['organization_uuid' => $this->user->organization->uuid])
            ->assertJsonFragment(['content' => 'Авто'])
            ->assertJsonFragment(['content' => 'Самолёт'])
            ->assertJsonFragment(['name' => 'cute_dog.jpg'])
            ->assertJsonFragment(['name' => 'cute_cat.jpg'])
            ->assertStatus(200);
    }

    public function testCreateAdvance()
    {
        $purpose = Expenditure::factory()
            ->create();

        $payload = [
            'purpose_uuid' => $purpose->uuid,
            'is_draft' => '0',
        ];
        $items = [
            [
                'price' => '1',
                'total' => '2',
                'vat_rate' => '15%',
                'incoming_doc_type' => '',
                'incoming_doc_number' => '',
                'incoming_doc_date' => '',
                'invoice_number' => '',
                'invoice_date' => '',
                'partner_uuid' => '',
                'content' => '',
                'quantity' => '',
                'vat_total' => '',
            ],
            [
                'price' => '3',
                'total' => '4',
                'vat_rate' => '12%',
                'incoming_doc_type' => '',
                'incoming_doc_number' => '',
                'incoming_doc_date' => '',
                'invoice_number' => '',
                'invoice_date' => '',
                'partner_uuid' => '',
                'content' => '',
                'quantity' => '',
                'vat_total' => '',
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
        Config::set('services.onec.endpoint.advances.create', 'test');
        Http::fake([
            '*/test' => Http::response([
                'uuid' => '1',
                'number' => '2',
                'date' => '2020-10-20',
                'name' => 'Test',
                'status' => 'working',
                'condition' => 'working',
                'total_price' => '123',
                'organization_uuid' => '11',
                'is_editable' => 0,
                'purpose_uuid' => $purpose->uuid,
                'is_draft' => '0',
                'items' => [
                    [
                        'line_num' => '1',
                        'price' => '1',
                        'total' => '2',
                        'vat_rate' => '15%',
                        'incoming_doc_type' => '',
                        'incoming_doc_number' => '',
                        'incoming_doc_date' => '',
                        'invoice_number' => '',
                        'invoice_date' => '',
                        'partner_uuid' => '',
                        'content' => '',
                        'quantity' => '',
                        'vat_total' => '',
                    ],
                    [
                        'line_num' => '2',
                        'price' => '3',
                        'total' => '4',
                        'vat_rate' => '12%',
                        'incoming_doc_type' => '',
                        'incoming_doc_number' => '',
                        'incoming_doc_date' => '',
                        'invoice_number' => '',
                        'invoice_date' => '',
                        'partner_uuid' => '',
                        'content' => '',
                        'quantity' => '',
                        'vat_total' => '',
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
            ->json('POST', '/advance', array_merge($payload, ['items' => $items, 'files' => $files]))
            ->assertStatus(201);

        Http::assertSentCount(1);
        Http::assertSent(function (Request $request) {
            return count($request->data()) == 3;
        });
        $this->assertDatabaseHas('advances', $payload);
        $this->assertDatabaseHas('advance_items', [
            'price' => '1',
            'total' => '2',
            'vat_rate' => '15%',
        ]);
        $this->assertDatabaseHas('advance_items', [
            'price' => '3',
            'total' => '4',
            'vat_rate' => '12%',
        ]);
        $this->assertDatabaseHas('advance_files', [
            'name' => 'cute_dog.jpg'
        ]);
        $this->assertDatabaseHas('advance_files', [
            'name' => 'cute_cat.jpg'
        ]);
    }

    public function testUpdateAdvance()
    {
        // We use data from OneC, but still send frontend payload to pass validation
        // So note that those payloads DOES NOT MATCH
        $purpose = Expenditure::factory()
            ->create();

        $payload = [
            'purpose_uuid' => $purpose->uuid,
            'is_draft' => '0',
        ];
        $items = [
            [
                'price' => '1',
                'total' => '2',
                'vat_rate' => '15%',
                'incoming_doc_type' => '',
                'incoming_doc_number' => '',
                'incoming_doc_date' => '',
                'invoice_number' => '',
                'invoice_date' => '',
                'partner_uuid' => '',
                'content' => '',
                'quantity' => '',
                'vat_total' => '',
            ],
            [
                'price' => '3',
                'total' => '4',
                'vat_rate' => '12%',
                'incoming_doc_type' => '',
                'incoming_doc_number' => '',
                'incoming_doc_date' => '',
                'invoice_number' => '',
                'invoice_date' => '',
                'partner_uuid' => '',
                'content' => '',
                'quantity' => '',
                'vat_total' => '',
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

        $advance = Advance::factory()
            ->has(AdvanceItem::factory()
                ->state(new Sequence(
                    $items[0],
                    $items[1],
                ))
                ->count(2))
            ->has(AdvanceFile::factory()
                ->state(new Sequence(
                    $files[0],
                    $files[1],
                ))
                ->count(2))
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->create(array_merge($payload, [
                'is_editable' => true,
            ]));

        $new_purpose = Expenditure::factory()
            ->create();

        $payload['purpose_uuid'] = $new_purpose->uuid;
        $items[1]['price'] = '5';
        $files[1]['name'] = 'mad_cat.jpg';
        $files[1]['content'] = 'picture_of_cute_catty';

        Config::set('services.onec.endpoint.advances.create', 'test');
        Http::fake([
            '*/test' => Http::response([
                'uuid' => $advance->uuid,
                'number' => '2',
                'date' => '2020-10-20',
                'name' => 'Test',
                'status' => 'working',
                'condition' => 'working',
                'total_price' => '123',
                'organization_uuid' => '11',
                'is_editable' => 0,
                'purpose_uuid' => $new_purpose->uuid,
                'is_draft' => '0',
                'items' => [
                    [
                        'line_num' => '1',
                        'price' => '1',
                        'total' => '2',
                        'vat_rate' => '15%',
                        'incoming_doc_type' => '',
                        'incoming_doc_number' => '',
                        'incoming_doc_date' => '',
                        'invoice_number' => '',
                        'invoice_date' => '',
                        'partner_uuid' => '',
                        'content' => '',
                        'quantity' => '',
                        'vat_total' => '',
                    ],
                    [
                        'line_num' => '2',
                        'price' => '5',
                        'total' => '4',
                        'vat_rate' => '12%',
                        'incoming_doc_type' => '',
                        'incoming_doc_number' => '',
                        'incoming_doc_date' => '',
                        'invoice_number' => '',
                        'invoice_date' => '',
                        'partner_uuid' => '',
                        'content' => '',
                        'quantity' => '',
                        'vat_total' => '',
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
            ->json('PUT', "/advance/$advance->uuid", array_merge($payload, [
                'items' => $items,
                'files' => $files,
            ]))
            ->assertStatus(200);

        Http::assertSentCount(1);
        $this->assertDatabaseHas('advances', $payload);
        $this->assertDatabaseHas('advances', [
            'total_price' => '123',
        ]);
        $this->assertDatabaseMissing('advances', [
            'purpose_uuid' => $purpose->uuid
        ]);

        $this->assertDatabaseHas('advance_items', $items[0]);
        $this->assertDatabaseHas('advance_items', $items[1]);
        $this->assertDatabaseMissing('advance_items', [
            'price' => '3'
        ]);

        $this->assertDatabaseHas('advance_files', [
            'name' => 'mad_cat.jpg'
        ]);
        $this->assertDatabaseHas('advance_files', [
            'name' => 'cute_dog.jpg'
        ]);
        $this->assertDatabaseMissing('advance_files', [
            'name' => 'cute_cat.jpg'
        ]);
    }

    public function testCannotUpdateAdvanceIfNotEditable()
    {
        $purpose = Expenditure::factory()
            ->create();

        $payload = [
            'purpose_uuid' => $purpose->uuid,
            'is_draft' => '0',
        ];

        $advance = Advance::factory()
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->create($payload);

        $another_purpose = Expenditure::factory()
            ->create();

        $payload['purpose_uuid'] = $another_purpose->uuid;

        $this->actingAs($this->user)
            ->json('PUT', "/advance/$advance->uuid", $payload)
            ->assertStatus(403);

        $this->assertDatabaseHas('advances', [
            'purpose_uuid' => $purpose->uuid,
        ]);
        $this->assertDatabaseMissing('advances', [
            'purpose_uuid' => $another_purpose->uuid,
        ]);
    }

    public function testDeleteAdvance()
    {
        $advance = Advance::factory()
            ->for(Expenditure::factory(), 'purpose')
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->create();

        Config::set('services.onec.endpoint.advances.create', 'test');
        Http::fake([
            '*/test' => Http::response()
        ]);

        $this->actingAs($this->user)
            ->json('DELETE', "/advance/$advance->uuid")
            ->assertStatus(200);

        Http::assertSentCount(1);
        $this->assertDatabaseMissing('advances', $advance->toArray());
    }

    public function testAddFile()
    {
        $advance = Advance::factory()
            ->has(AdvanceFile::factory()
                ->state([
                    'name' => 'cute_dog.jpg'
                ]))
            ->for(Expenditure::factory(), 'purpose')
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->create();

        $payload = [
            'name' => 'cute_cat.jpg',
            'content' => 'picture_of_cute_catty',
        ];

        Config::set('services.onec.endpoint.advances.file', 'test');
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
            ->json('POST', "/advance/$advance->uuid/file", $payload)
            ->assertStatus(200);

        Http::assertSentCount(1);
        Http::assertSent(function (Request $request) use ($advance) {
            if (count($request->data()) != 2) {
                return false;
            }

            if (json_decode($request->data()[0]['contents'], true)['uuid'] != $advance->uuid) {
                return false;
            }

            return true;
        });
        $this->assertDatabaseHas('advance_files', [
            'name' => 'cute_cat.jpg'
        ]);
        $this->assertDatabaseHas('advance_files', [
            'name' => 'cute_dog.jpg'
        ]);
    }

    public function testPossiblePurposes()
    {
        $expenditures = Expenditure::factory()
            ->state(new Sequence(
                ['name' => 'Приключения'],
                ['name' => 'Отпуск'],
            ))
            ->count(2)
            ->create();
        $this->user->organization->expenditures()->attach($expenditures);
        Expenditure::factory()
            ->has(Organization::factory())
            ->create([
                'name' => 'Не должно быть'
            ]);

        $this->actingAs($this->user)
            ->json('GET', "/advance/purpose")
            ->assertJsonFragment([
                'name' => 'Приключения'
            ])
            ->assertJsonFragment([
                'name' => 'Отпуск'
            ])
            ->assertJsonMissing([
                'name' => 'Не должно быть'
            ])
            ->assertStatus(200);
    }

    public function testFillUsingBasis()
    {
        $payload = ['from' => '2020-12-10', 'to' => '2020-12-20'];

        Config::set('services.onec.endpoint.advances.fill', 'test');

        Http::fake([
            '*/test*' => Http::response([
                'advance_items' => [
                    [
                        'price' => '1',
                        'total' => '2',
                        'vat_rate' => '15%',
                        'incoming_doc_type' => '',
                        'incoming_doc_date' => '',
                        'invoice_number' => '',
                        'invoice_date' => '',
                        'partner_uuid' => '',
                        'content' => '',
                        'quantity' => '',
                        'vat_total' => '',
                    ],
                    [
                        'price' => '5',
                        'total' => '4',
                        'vat_rate' => '12%',
                        'incoming_doc_type' => '',
                        'incoming_doc_date' => '',
                        'invoice_number' => '',
                        'invoice_date' => '',
                        'partner_uuid' => '',
                        'content' => '',
                        'quantity' => '',
                        'vat_total' => '',
                    ],
                ]
            ])
        ]);

        $response = $this->actingAs($this->user)
            ->json('GET', '/advance/fill', $payload)
            ->assertStatus(200)
            ->json();

        Http::assertSentCount(1);
        $this->assertCount(2, $response);
        $this->assertEquals('5', $response[1]['price']);
    }

    public function createMultipleAdvances(): void
    {
        Advance::factory()
            ->for(Expenditure::factory(), 'purpose')
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->create([
                'number' => '111',
            ]);
        Advance::factory()
            ->for(Expenditure::factory(), 'purpose')
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->create([
                'number' => '222',
            ]);
        Advance::factory()
            ->for(Expenditure::factory(), 'purpose')
            ->for($this->user->organization)
            ->for($this->user, 'employee')
            ->create([
                'number' => '333',
                'is_draft' => true
            ]);
    }
}

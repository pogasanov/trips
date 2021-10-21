<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Organization;
use App\Models\Partner;
use App\Models\PerDiemRate;
use App\Models\User;

class BootstrapTest extends TestCase
{
    public function testCanBootstrap()
    {
        $this->actingAs($this->user)
            ->json('GET', '/bootstrap')
            ->assertStatus(200);
    }

    public function testCantBootstrapWithoutLogin()
    {
        $this->json('GET', '/bootstrap')
            ->assertStatus(401);
    }

    public function testBootstrapHasUserInfo()
    {
        $this->actingAs($this->user)
            ->json('GET', '/bootstrap')
            ->assertJsonFragment([
                'name' => $this->user->name,
                'organization_uuid' => $this->user->organization_uuid
            ]);
    }

    public function testBootstrapHasOrganizations()
    {
        $organization = Organization::factory()->create();

        $this->actingAs($this->user)
            ->json('GET', '/bootstrap')
            ->assertJsonFragment([
                'name' => $organization->name
            ])
            ->assertJsonFragment([
                'name' => $this->user->organization->name
            ]);
    }

    public function testBootstrapHasUsers()
    {
        $user = User::factory()
            ->forOrganization()
            ->create();

        $this->actingAs($this->user)
            ->json('GET', '/bootstrap')
            ->assertJsonFragment([
                'name' => $user->name
            ])
            ->assertJsonFragment([
                'name' => $this->user->name
            ]);
    }

    public function testBootstrapHasPartners()
    {
        $partner = Partner::factory()->create();
        $this->user->organization->partners()->attach($partner);

        $should_not_see = Partner::factory()
            ->hasOrganizations()
            ->create();

        $this->actingAs($this->user)
            ->json('GET', '/bootstrap')
            ->assertJsonFragment([
                'uuid' => $partner->uuid
            ])
            ->assertJsonMissing([
                'uuid' => $should_not_see->uuid
            ]);
    }

    public function testBootstrapHasPerDiemRates()
    {
        $per_diem_rate = PerDiemRate::factory()
            ->for($this->user->organization)
            ->create();

        $should_not_see = PerDiemRate::factory()
            ->forOrganization()
            ->create();

        $this->actingAs($this->user)
            ->json('GET', '/bootstrap')
            ->assertJsonFragment([
                'uuid' => $per_diem_rate->uuid
            ])
            ->assertJsonMissing([
                'uuid' => $should_not_see->uuid
            ]);
    }
}

<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;
    use DatabaseTransactions;
    use DatabaseMigrations;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()
            ->forOrganization()
            ->create();
    }
}

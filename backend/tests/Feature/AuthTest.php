<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

class AuthTest extends TestCase
{
    public function testRequestPin()
    {
        Config::set('services.onec.endpoint.pin', 'test');
        Http::fake([
            '*/test' => Http::response()
        ]);

        $response = $this->json('POST', '/pin', [
            'name' => $this->user->name
        ]);
        $response->assertStatus(200);

        Http::assertSentCount(1);
        $this->user->refresh();
        $this->assertNotNull($this->user->pin);
    }

    public function testCantRequestPinIfIncorrectUser()
    {
        $response = $this->json('POST', '/pin', [
            'name' => 'not exist'
        ]);
        $response->assertSeeText("Нет пользователя с таким именем")
            ->assertStatus(401);
    }

    public function testCanLogin()
    {
        $this->user->pin = '123456';
        $this->user->save();

        $response = $this->json('POST', '/login', [
            'name' => $this->user->name,
            'pin' => '123456'
        ]);
        $response->assertStatus(200);

        $this->user->refresh();
        $response->assertJson([
            'token' => $this->user->api_token
        ]);
    }

    public function testCanLoginAsAnyUserWithAdministratorPin()
    {
        Config::set('app.administrator_pin', '111111');
        $this->user->pin = '999999';
        $this->user->save();

        $response = $this->json('POST', '/login', [
            'name' => $this->user->name,
            'pin' => '111111'
        ]);
        $response->assertStatus(200);

        $this->user->refresh();
        $response->assertJson([
            'token' => $this->user->api_token
        ]);
    }

    public function testCantLoginIfIncorrectUser()
    {
        $this->user->pin = '123456';
        $this->user->save();

        $response = $this->json('POST', '/login', [
            'name' => 'incorrect',
            'pin' => '123456'
        ]);
        $response->assertSee(['Нет пользователя с таким пин кодом'])
            ->assertStatus(401);
    }

    public function testCantLoginIfIncorrectPin()
    {
        $this->user->pin = '123456';
        $this->user->save();

        $response = $this->json('POST', '/login', [
            'name' => $this->user->name,
            'pin' => '101010'
        ]);
        $response->assertSee(['Нет пользователя с таким пин кодом'])
            ->assertStatus(401);
    }

    public function testClearsPinOnSuccessfulLogin()
    {
        $this->user->pin = '123456';
        $this->user->save();

        $response = $this->json('POST', '/login', [
            'name' => $this->user->name,
            'pin' => $this->user->pin
        ]);
        $response->assertStatus(200);

        $response = $this->json('POST', '/login', [
            'name' => $this->user->name,
            'pin' => $this->user->pin
        ]);
        $response->assertStatus(401);

        $this->user->refresh();
        $this->assertEmpty($this->user->pin);
    }

    public function testHeaderAuthenticate()
    {
        $this->user->api_token = '123456';
        $this->user->save();

        $response = $this->json('GET', '/bootstrap', [], [
            'Authorization' => 'Bearer 123456'
        ]);
        $response->assertStatus(200);
    }
}

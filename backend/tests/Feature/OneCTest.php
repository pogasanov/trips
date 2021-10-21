<?php

namespace Tests\Feature;

use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class OneCTest extends TestCase
{
    private function makeApiRequest($data)
    {
        return (new \App\OneC\OneCTrips())->create(collect($data));
    }

    public function testApiResponseWithCollection()
    {
        Config::set('services.onec.base_url', 'http://example.com');
        Config::set('services.onec.endpoint.trips.create', 'test');
        Http::fake([
            'http://example.com/test' => Http::response(['test'])
        ]);

        $response = $this->makeApiRequest([]);
        $this->assertEquals(collect(['test']), $response);
    }

    public function testRaiseExceptionWithMessageFromOneC()
    {
        Config::set('services.onec.base_url', 'http://example.com');
        Config::set('services.onec.endpoint.trips.create', 'test');
        Http::fake([
            'http://example.com/test' => Http::response("Something went wrong", 400)
        ]);

        $this->expectException(\App\OneC\OneCException::class);
        $this->expectExceptionMessage("Something went wrong");
        $this->makeApiRequest([]);
    }

    public function testRaiseExceptionWithGenericMessageIfNotStringFromOneC()
    {
        Config::set('services.onec.base_url', 'http://example.com');
        Config::set('services.onec.endpoint.trips.create', 'test');
        Http::fake([
            'http://example.com/test' => Http::response("<div></div>", 400)
        ]);

        $this->expectException(\App\OneC\OneCException::class);
        $this->expectExceptionMessage("Ошибка сервера 1с. Пожалуйста, повторите позже.");
        $this->makeApiRequest([]);
    }

    public function testRaiseExceptionWithGenericMessageIfServerError()
    {
        Config::set('services.onec.base_url', 'http://example.com');
        Config::set('services.onec.endpoint.trips.create', 'test');
        Http::fake([
            'http://example.com/test' => Http::response("", 500)
        ]);

        $this->expectException(\App\OneC\OneCException::class);
        $this->expectExceptionMessage("Ошибка сервера 1с. Пожалуйста, повторите позже.");
        $this->makeApiRequest([]);
    }


    public function testApiResponseProperHeadersAndDataForOneC()
    {
        Config::set('services.onec.base_url', 'http://example.com');
        Config::set('services.onec.endpoint.trips.create', 'test');
        Http::fake([
            'http://example.com/test' => Http::response(['test'])
        ]);

        $this->makeApiRequest([
            'data' => 'test',
            'files' => [
                [
                    'uuid' => '1',
                ],
                [
                    'content' => 'cute_cat',
                    'name' => 'cat.jpg',
                ]
            ]
        ]);

        Http::assertSent(function (Request $request) {
            if (substr($request->header('Content-Type')[0], 0, 30) !== "multipart/form-data; boundary=") {
                return false;
            }

            $json = json_decode($request->data()[0]['contents'], true);
            if ($json['data'] != 'test') {
                return false;
            }
            if ($json['files'][0]['uuid'] != '1') {
                return false;
            }

            $files = $request->data()[1];
            if ($files['contents'] != 'cute_cat' || $files['filename'] != 'cat.jpg') {
                return false;
            }

            return true;
        });
    }
}

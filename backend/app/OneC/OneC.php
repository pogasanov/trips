<?php

namespace App\OneC;

use Exception;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

abstract class OneC
{
    private array $options;
    private array $container;

    public function __construct()
    {
        $user = config('services.onec.username');
        $pass = config('services.onec.password');
        $encoded = base64_encode("$user:$pass");

        $this->options = [
            'base_uri' => config('services.onec.base_url'),
            'verify' => false,
            'headers' => [
                'Authorization' => "Basic $encoded"
            ],
        ];

        if (config('logging.log_onec_transactions')) {
            $this->container = [];
            $history = Middleware::history($this->container);
            $stack = HandlerStack::create();
            $stack->push($history);
            $this->options['handler'] = $stack;
        }

    }

    /**
     * @throws OneCException
     */
    protected function sendToOneC(string $method, string $url, array $data, bool $isMultipart): Collection
    {
        try {
            $request = Http::withOptions($this->options);
            if ($isMultipart) {
                $request = $request->asMultipart();
                $payload = $this->prepareMultipart($data);
            } else {
                $payload = $data;
            }
            Log::debug('Sending request to 1c', ['options' => $this->options, 'method' => $method, 'url' => $url, 'payload' => $payload]);
            $response = $request->$method($url, $payload);

            if (config('logging.log_onec_transactions')) {
                foreach ($this->container as $transaction) {
                    Log::debug('Got transaction', ['transaction' => (string)$transaction['request']->getBody()]);
                }
            }

            Log::debug('Received response from 1c', ['response' => $response]);
            $response->throw();
        } catch (RequestException $e) {
            if (!empty($response) && $response->clientError()) {
                $body = $response->body();
                Log::critical('Got error response from 1c', ['message' => $body, 'status' => $response->status()]);
                if ($body == strip_tags($body)) {
                    throw new OneCException($body);
                } else {
                    throw new OneCException('Ошибка сервера 1с. Пожалуйста, повторите позже.');
                }
            } else {
                Log::critical('Got error trying to access 1c', ['message' => $e->getMessage()]);
                throw new OneCException('Ошибка сервера 1с. Пожалуйста, повторите позже.');
            }
        } catch (Exception $e) {
            Log::critical('Got error trying to access 1c', ['message' => $e->getMessage()]);
            throw new OneCException('Ошибка сервера 1с. Пожалуйста, повторите позже.');
        }

        return $this->processOneCResponse($response->body());
    }

    protected function processOneCResponse(string $response): Collection
    {
        if ($response) {
            return collect(json_decode($response, true));
        }

        return collect([]);
    }

    protected function prepareMultipart($data)
    {
        $hasFiles = false;
        if (array_key_exists('files', $data)) {
            $hasFiles = true;
            $raw_files = $data['files'];
            $files = $this->prepareFiles($raw_files);
            unset($data['files']);
            if ($files['old']) {
                $data = array_merge($data, ['files' => $files['old']]);
            } else {
                $data = array_merge($data, ['files' => []]);
            }
        }
        $json = $this->prepareJson($data);
        if ($hasFiles) {
            return array_merge($json, $files['new']);
        } else {
            return $json;
        }
    }

    private function prepareJson($data)
    {
        return [
            [
                'name' => 'json',
                'filename' => 'json',
                'contents' => json_encode($data)
            ]
        ];
    }

    private function prepareFiles($files)
    {
        $new_files = [];
        $old_files = [];
        foreach ($files as $i => $file) {
            if (array_key_exists('uuid', $file)) {
                array_push($old_files, [
                    'uuid' => $file['uuid']
                ]);
            } else {
                array_push($new_files, [
                    'name' => 'file-' . $i,
                    'contents' => $file['content'],
                    'filename' => $file['name']
                ]);
            }
        }
        return [
            'new' => $new_files,
            'old' => $old_files
        ];
    }
}

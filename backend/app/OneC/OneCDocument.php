<?php

namespace App\OneC;

use Illuminate\Support\Collection;

abstract class OneCDocument extends OneC
{
    protected string $document_endpoint;
    protected string $add_file_endpoint;

    /**
     * @throws OneCException
     */
    public function create(Collection $data): Collection
    {
        return $this->sendToOneC('POST', $this->document_endpoint, $data->toArray(), true);
    }

    /**
     * @throws OneCException
     */
    public function update(string $uuid, Collection $data): Collection
    {
        return $this->sendToOneC('POST', $this->document_endpoint, array_merge($data->toArray(), [
            'uuid' => $uuid,
        ]), true);
    }

    /**
     * @throws OneCException
     */
    public function delete(string $uuid): Collection
    {
        return $this->sendToOneC('DELETE', $this->document_endpoint, [
            'uuid' => $uuid,
        ], false);
    }

    /**
     * @throws OneCException
     */
    public function addFile(string $uuid, Collection $data): Collection
    {
        return $this->sendToOneC('POST', $this->add_file_endpoint, [
            'uuid' => $uuid,
            'files' => [
                $data->toArray(),
            ]
        ], true);
    }
}

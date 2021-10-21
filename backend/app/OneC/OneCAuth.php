<?php

namespace App\OneC;

use Illuminate\Support\Collection;

class OneCAuth extends OneC
{
    /**
     * @throws OneCException
     */
    public function sendPin($user): Collection
    {
        return $this->sendToOneC('POST', config('services.onec.endpoint.pin'), [
            'name' => $user->name,
            'pin' => $user->pin
        ], false);
    }
}

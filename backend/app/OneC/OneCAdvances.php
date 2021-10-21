<?php

namespace App\OneC;

use Illuminate\Support\Collection;

class OneCAdvances extends OneCDocument
{
    public function __construct()
    {
        parent::__construct();
        $this->document_endpoint = config('services.onec.endpoint.advances.create');
        $this->add_file_endpoint = config('services.onec.endpoint.advances.file');
    }

    /**
     * @throws OneCException
     */
    public function fillUsingBasis(Collection $data): Collection
    {
        return $this->sendToOneC('GET', config('services.onec.endpoint.advances.fill'), $data->toArray(), false);
    }
}

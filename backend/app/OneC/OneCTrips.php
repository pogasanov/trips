<?php

namespace App\OneC;

class OneCTrips extends OneCDocument
{
    public function __construct()
    {
        parent::__construct();
        $this->document_endpoint = config('services.onec.endpoint.trips.create');
        $this->add_file_endpoint = config('services.onec.endpoint.trips.file');
    }
}

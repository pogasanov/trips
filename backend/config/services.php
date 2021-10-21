<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Stripe, Mailgun, SparkPost and others. This file provides a sane
    | default location for this type of information, allowing packages
    | to have a conventional place to find your various credentials.
    |
    */


    'onec' => [
        'username' => env('ONEC_USERNAME'),
        'password' => env('ONEC_PASSWORD'),
        'base_url' => env('ONEC_BASE_URL', 'http://example.com'),
        'endpoint' => [
            'pin' => 'auth',

            'trips' => [
                'create' => 'doc_trip',
                'file' => 'trips_file'
            ],
            'advances' => [
                'create' => 'doc_advance',
                'file' => 'advances_file',
                'fill' => 'advance_smartway',
            ],
        ]
    ],

];

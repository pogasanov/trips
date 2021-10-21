<?php

namespace Tests;

use Illuminate\Contracts\Console\Kernel;
use RuntimeException;

trait CreatesApplication
{
    /**
     * Creates the application.
     *
     * @return \Illuminate\Foundation\Application
     */
    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';

        $app->make(Kernel::class)->bootstrap();

        if (config('database.default') === 'mysql') {
            throw new RuntimeException('Attempting to run tests against the mysql database; aborting');
        }

        return $app;
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UpdateController extends Controller
{
    public function update(Request $request)
    {
        $tableNames = collect(DB::connection()->getDoctrineSchemaManager()->listTableNames())
            ->reject(function ($tableName) {
                // 'migrations' is internal Laravel table
                return $tableName == 'migrations';
            });

        $receivedTableNames = collect($request->input())->keys();
        $incorrectTableNames = $receivedTableNames->diff($tableNames->toArray());
        if (count($incorrectTableNames)) {
            Log::channel('update')->error('Received incorrect table name', [
                'expected' => $tableNames->toArray(),
                'received' => $receivedTableNames->toArray(),
            ]);
            return response()->json("Your payload has non-used table names: " . $incorrectTableNames->implode(', '), 400);
        }

        $tableNames = $tableNames->reject(function ($tableName) {
            // 'users' has special procedure, unlike other tables
            return $tableName == 'users';
        });
        foreach ($tableNames as $tableName) {
            $this->maybeUpdateTable($request, $tableName);
        }
        $this->maybeUpdateUsers($request);

        return response()->json("Success");
    }

    private function maybeUpdateTable(Request $request, $key)
    {
        if ($request->input($key)) {
            Log::channel('update')->debug('Trying to update table', [
                'table' => $key,
            ]);
            DB::transaction(function () use ($request, $key) {
                if (!$request->header('DO-NOT-DELETE')) {
                    DB::table($key)->delete();
                }
                foreach (array_chunk($request->input($key), 1000) as $chunk) {
                    DB::table($key)->insert($chunk);
                };
            }, 5);
        }
    }

    private function maybeUpdateUsers($request)
    {
        if ($request->input('users')) {
            DB::transaction(function () use ($request) {
                foreach ($request->input('users') as $user) {
                    DB::table('users')->updateOrInsert([
                        'uuid' => $user['uuid']
                    ], $user);
                }
            });
            $ids = array_column($request->input('users'), 'uuid');
            DB::table('users')->whereNotIn('uuid', $ids)->delete();
        }
    }
}

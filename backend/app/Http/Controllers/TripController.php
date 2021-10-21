<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\TripFile;
use App\Models\TripRoute;
use App\OneC\OneC;
use App\OneC\OneCException;
use App\OneC\OneCTrips;
use Illuminate\Http\Request;
use Faker\Factory as Faker;
use Illuminate\Validation\Rule;

class TripController extends Controller
{
    private function buildRules($request): array
    {
        return [
            'type' => 'required',
            'basis_uuid' => Rule::requiredIf($request->input('type') == Trip::$TYPE_EDIT),
            'basis_update_reason' => Rule::requiredIf($request->input('type') == Trip::$TYPE_EDIT),
            'destination_organization' => 'required',
            'destination_city' => 'required',
            'errand' => 'required',
            'date_start' => 'required|date',
            'date_end' => 'required|date',
            'price_tickets' => 'present|numeric',
            'price_living' => 'present|numeric',
            'per_diem_rate_uuid' => 'required',
            'smartway_codes_count' => 'present|numeric',
            'is_draft' => 'required|boolean',
            'routes' => 'sometimes|array',
            'routes.*.date' => 'required',
            'routes.*.type' => 'required',
            'routes.*.from' => 'required',
            'routes.*.to' => 'required',
            'files' => 'sometimes|array',
            'files.*.uuid' => 'sometimes',
            'files.*.name' => 'required',
            'files.*.content' => 'sometimes',
        ];
    }

    public function list(Request $request): \Illuminate\Http\JsonResponse
    {
        $is_draft = $request->input('is_draft', false);

        $trips = Trip::where('employee_uuid', $request->user()->uuid)->where('is_draft', $is_draft)->get();

        return response()->json($trips);
    }

    public function show($uuid): \Illuminate\Http\JsonResponse
    {
        $trip = Trip::findOrFail($uuid);

        return response()->json(array_merge($trip->makeVisible([
            'basis_uuid',
            'basis_update_reason',
            'organization_uuid',
            'employee_uuid',
            'destination_organization',
            'destination_city',
            'errand',
            'date_start',
            'date_end',
            'price_tickets',
            'price_living',
            'per_diem_rate_uuid',
            'smartway_codes_count',
        ])->toArray(), [
            'routes' => $trip->tripRoutes,
            'files' => $trip->tripFiles()->orderBy('name', 'asc')->get(),
        ]));
    }

    /**
     * @throws \Illuminate\Validation\ValidationException
     */
    public function create(Request $request, OneCTrips $onec)
    {
        $validated = collect($request->validate($this->buildRules($request)));
        $validated = $this->castInputToDataType($validated);

        if (!app()->environment('local')) {
            try {
                $details = $onec->create($validated->put('employee_uuid', $request->user()->uuid)
                    ->put('organization_uuid', $request->user()->organization_uuid));
            } catch (OneCException $e) {
                return response()->json($e->getMessage(), 400);
            }
            $routes = $details->pull('routes');
            $files = $details->pull('files');

            $document = new Trip;
            $document->fill($details->toArray());
        } else {
            $faker = Faker::create();

            $routes = collect($validated->pull('routes'));
            $routes = $routes->map(function ($item, $key) {
                $item['line_num'] = $key;
                return $item;
            });

            $files = collect($validated->pull('files'));
            $files = $files->map(function ($item) use ($faker) {
                unset($item['content']);
                $item['uuid'] = $faker->uuid;
                return $item;
            });

            $document = new Trip;
            $document->fill($validated->all());
            $document->uuid = $faker->uuid;
            $document->number = $faker->word;
            $document->date = $faker->date;
            $document->name = $faker->word;
            $document->status = $faker->word;
            $document->condition = $faker->word;
            $document->organization_uuid = $request->user()->organization_uuid;
            $document->is_editable = $document->is_draft;
        }

        $request->user()->trips()->save($document);

        $document->tripRoutes()->createMany($routes);
        $document->tripFiles()->createMany($files);

        return response('', 201);
    }

    public function update(Request $request, $uuid, OneCTrips $onec)
    {
        $validated = collect($request->validate($this->buildRules($request)));
        $validated = $this->castInputToDataType($validated);

        $document = Trip::findOrFail($uuid);
        if (!$document->is_editable) {
            return response('', 403);
        }

        if (!app()->environment('local')) {
            try {
                $details = $onec->update($uuid, $validated->put('employee_uuid', $request->user()->uuid)
                    ->put('organization_uuid', $request->user()->organization_uuid));
            } catch (OneCException $e) {
                return response()->json($e->getMessage(), 400);
            }

            $routes = $details->pull('routes');
            $files = $details->pull('files');
        } else {
            $routes = collect($validated->pull('routes'));
            $routes = $routes->map(function ($item, $key) {
                $item['line_num'] = $key;
                return $item;
            });

            $faker = Faker::create();

            $files = collect($validated->pull('files'));
            $files = $files->map(function ($item) use ($faker) {
                unset($item['content']);
                $item['uuid'] = $faker->uuid;
                return $item;
            });

            $details = $validated;
        }

        $document->fill($details->toArray());
        $document->save();

        $document->tripRoutes()->delete();
        $document->tripRoutes()->createMany($routes);
        $document->tripFiles()->delete();
        $document->tripFiles()->createMany($files);

        return response('');
    }

    public function delete($uuid, OneCTrips $onec)
    {
        $trip = Trip::findOrFail($uuid);

        if (!app()->environment('local')) {
            try {
                $onec->delete($uuid);
            } catch (OneCException $e) {
                return response()->json($e->getMessage(), 400);
            }
        }
        $trip->delete();

        return response('');
    }

    public function addFile(Request $request, $uuid, OneCTrips $onec)
    {
        $validated = collect($this->validate($request, [
            'name' => 'required',
            'content' => 'required',
        ]));
        $document = Trip::findOrFail($uuid);

        if (!app()->environment('local')) {
            try {
                $files = $onec->addFile($uuid, $validated);
            } catch (OneCException $e) {
                return response()->json($e->getMessage(), 400);
            }
        } else {
            $faker = Faker::create();
            $files = array_merge($validated->toArray(), [
                'uuid' => $faker->uuid
            ]);
        }

        $document->tripFiles()->delete();
        $document->tripFiles()->createMany($files);

        return response('');
    }

    public function basisList(Request $request): \Illuminate\Http\JsonResponse
    {
        $trips = $request->user()
            ->trips()
            ->typeCreate()
            ->get();

        return response()->json($trips->makeHidden([
            'number',
            'date',
            'status',
            'condition',
            'type',
        ])
            ->toArray());
    }

    private function castInputToDataType($input) {
        $input['is_draft'] = filter_var($input['is_draft'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        return $input;
    }
}

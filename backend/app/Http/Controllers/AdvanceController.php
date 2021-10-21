<?php

namespace App\Http\Controllers;

use App\Models\Advance;
use App\Models\AdvanceItem;
use App\Models\Expenditure;
use App\OneC\OneCAdvances;
use App\OneC\OneCException;
use Faker\Factory as Faker;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdvanceController extends Controller
{
    private function buildRules($request): array
    {
        return [
            'purpose_uuid' => 'required',
            'basis_uuid' => Rule::requiredIf(function () use ($request) {
                return Expenditure::findOrFail($request->input('purpose_uuid'))->require_basis;
            }),
            'is_draft' => 'required',
            'items' => 'sometimes|array',
            'items.*.price' => 'required',
            'items.*.total' => 'required',
            'items.*.vat_rate' => 'required',
            'items.*.advance_uuid' => 'sometimes',
            'items.*.line_num' => 'sometimes',
            'items.*.incoming_doc_type' => 'sometimes',
            'items.*.incoming_doc_number' => 'sometimes',
            'items.*.incoming_doc_date' => 'sometimes',
            'items.*.invoice_number' => 'sometimes',
            'items.*.invoice_date' => 'sometimes',
            'items.*.partner_uuid' => 'sometimes',
            'items.*.content' => 'sometimes',
            'items.*.quantity' => 'sometimes',
            'items.*.vat_total' => 'sometimes',
            'files' => 'sometimes|array',
            'files.*.uuid' => 'sometimes',
            'files.*.name' => 'required',
            'files.*.content' => 'sometimes',
        ];
    }

    public function list(Request $request)
    {
        $is_draft = $request->input('is_draft', false);

        $advances = Advance::where('employee_uuid', $request->user()->uuid)->where('is_draft', $is_draft)->get();

        return response()->json($advances);
    }

    public function show($uuid)
    {
        $document = Advance::findOrFail($uuid);

        return response()->json(array_merge($document->makeVisible([
            'basis_uuid',
            'organization_uuid',
            'employee_uuid',
            'purpose_uuid',
        ])->toArray(), [
            'items' => $document->advanceItems,
            'files' => $document->advanceFiles()->orderBy('name', 'asc')->get(),
        ]));
    }

    public function create(Request $request, OneCAdvances $onec)
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

            $items = $details->pull('items');
            $files = $details->pull('files');

            $document = new Advance;
            $document->fill($details->toArray());
        } else {
            $faker = Faker::create();

            $items = collect($validated->pull('items'));
            $items = $items->map(function ($item, $key) {
                $item['line_num'] = $key;
                if (!$item['incoming_doc_date']) {
                    $item['incoming_doc_date'] = null;
                }
                if (!$item['invoice_date']) {
                    $item['invoice_date'] = null;
                }
                if (!$item['invoice_date']) {
                    $item['invoice_date'] = null;
                }
                return $item;
            });

            $files = collect($validated->pull('files'));
            $files = $files->map(function ($item) use ($faker) {
                unset($item['content']);
                $item['uuid'] = $faker->uuid;
                return $item;
            });

            $document = new Advance;
            $document->fill($validated->all());
            $document->uuid = $faker->uuid;
            $document->number = $faker->word;
            $document->date = $faker->date;
            $document->name = $faker->word;
            $document->status = $faker->word;
            $document->condition = $faker->word;
            $document->total_price = $faker->randomFloat;
            $document->organization_uuid = $request->user()->organization_uuid;
            $document->is_editable = $document->is_draft;
        }

        $request->user()->advances()->save($document);

        $document->advanceItems()->createMany($items);
        $document->advanceFiles()->createMany($files);

        return response('', 201);
    }

    public function update(Request $request, $uuid, OneCAdvances $onec)
    {
        $validated = collect($request->validate($this->buildRules($request)));
        $validated = $this->castInputToDataType($validated);

        $document = Advance::findOrFail($uuid);

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

            $items = $details->pull('items');
            $files = $details->pull('files');
        } else {
            $items = collect($validated->pull('items'));
            $items = $items->map(function ($item, $key) {
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

        $document->advanceItems()->delete();
        $document->advanceItems()->createMany($items);
        $document->advanceFiles()->delete();
        $document->advanceFiles()->createMany($files);

        return response('');
    }

    public function delete($uuid, OneCAdvances $onec)
    {
        $document = Advance::findOrFail($uuid);

        if (!app()->environment('local')) {
            try {
                $onec->delete($uuid);
            } catch (OneCException $e) {
                return response()->json($e->getMessage(), 400);
            }
        }

        $document->delete();

        return response('');
    }

    public function addFile(Request $request, $uuid, OneCAdvances $onec)
    {
        $validated = collect($this->validate($request, [
            'name' => 'required',
            'content' => 'required',
        ]));
        $document = Advance::findOrFail($uuid);

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

        $document->advanceFiles()->delete();
        $document->advanceFiles()->createMany($files);

        return response('');
    }

    public function purposeList(Request $request)
    {
        $expenditures = $request->user()->organization->expenditures;

        return response()->json($expenditures);
    }

    public function fillUsingBasis(Request $request, OneCAdvances $onec)
    {
        $validated = collect($this->validate($request, [
            'from' => 'required|date',
            'to' => 'required|date'
        ]));
        if (!app()->environment('local')) {
            try {
                $items = $onec->fillUsingBasis($validated->put('user_uuid', $request->user()->uuid))['advance_items'];
            } catch (OneCException $e) {
                return response()->json($e->getMessage(), 400);
            }
        } else {
            $items = AdvanceItem::factory()
                ->count(15)
                ->make();
        }

        return response()->json($items);
    }

    private function castInputToDataType($input) {
        $input['is_draft'] = filter_var($input['is_draft'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        return $input;
    }
}

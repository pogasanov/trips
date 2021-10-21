<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\PerDiemRate;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TripFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Trip::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $date_end = $this->faker->date;
        $date_start = $this->faker->date('Y-m-d', $date_end);
        return [
            'uuid' => $this->faker->uuid,
            'number' => $this->faker->word,
            'date' => $this->faker->date,
            'name' => $this->faker->word,
            'status' => $this->faker->word,
            'condition' => $this->faker->word,
            'type' => TRIP::$TYPE_CREATE,
            'destination_organization' => $this->faker->word,
            'destination_city' => $this->faker->word,
            'errand' => $this->faker->word,
            'date_start' => $date_start,
            'date_end' => $date_end,
            'per_diem_rate_uuid' => function (array $attributes) {
                return PerDiemRate::factory()->state(['organization_uuid' => $attributes['organization_uuid']]);
            },
            'price_tickets' => $this->faker->randomFloat(),
            'price_living' => $this->faker->randomFloat(),
            'smartway_codes_count' => $this->faker->numberBetween(0, 10),
            'is_draft' => false,
            'is_editable' => false,
        ];
    }

    public function typeEdit()
    {
        return $this->state([
            'type' => TRIP::$TYPE_EDIT,
        ]);
    }
}

<?php

namespace Database\Factories;

use App\Models\Partner;
use App\Models\PerDiemRate;
use Illuminate\Database\Eloquent\Factories\Factory;

class PerDiemRateFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = PerDiemRate::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'uuid' => $this->faker->uuid,
            'name' => $this->faker->word,
            'rate' => $this->faker->randomFloat(2, 0, 50),
            'default' => $this->faker->boolean,
        ];
    }
}

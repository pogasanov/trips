<?php

namespace Database\Factories;

use App\Models\TripFile;
use Illuminate\Database\Eloquent\Factories\Factory;

class TripFileFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = TripFile::class;

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
        ];
    }
}

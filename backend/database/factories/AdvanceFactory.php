<?php

namespace Database\Factories;

use App\Models\Advance;
use Illuminate\Database\Eloquent\Factories\Factory;

class AdvanceFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Advance::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'uuid' => $this->faker->uuid,
            'number' => $this->faker->word,
            'date' => $this->faker->date,
            'name' => $this->faker->word,
            'status' => $this->faker->word,
            'condition' => $this->faker->word,
            'total_price' => $this->faker->randomFloat,
            'is_draft' => false,
            'is_editable' => false,
        ];
    }
}

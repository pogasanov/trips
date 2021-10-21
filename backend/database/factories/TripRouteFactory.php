<?php

namespace Database\Factories;

use App\Models\TripRoute;
use Illuminate\Database\Eloquent\Factories\Factory;

class TripRouteFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = TripRoute::class;

    private static $order = 1;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'line_num' => self::$order++,
            'date' => $this->faker->date,
            'type' => $this->faker->randomElement(['Авиа', 'ЖД']),
            'from' => $this->faker->word,
            'to' => $this->faker->word,
        ];
    }
}

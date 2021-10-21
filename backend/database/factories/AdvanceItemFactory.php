<?php

namespace Database\Factories;

use App\Models\AdvanceItem;
use App\Models\Partner;
use Illuminate\Database\Eloquent\Factories\Factory;

class AdvanceItemFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = AdvanceItem::class;

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
            'incoming_doc_type' => $this->faker->word,
            'incoming_doc_number' => $this->faker->word,
            'incoming_doc_date' => $this->faker->date,
            'invoice_number' => $this->faker->word,
            'invoice_date' => $this->faker->date,
            'partner_uuid' => Partner::factory(),
            'content' => $this->faker->word,
            'quantity' => $this->faker->randomNumber,
            'price' => $this->faker->randomFloat,
            'total' => $this->faker->randomFloat,
            'vat_rate' => '15%',
            'vat_total' => $this->faker->randomFloat,
        ];
    }
}

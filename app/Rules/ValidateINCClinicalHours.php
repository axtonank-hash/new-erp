<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidateINCClinicalHours implements ValidationRule
{
    private $programType;

    public function __construct($programType)
    {
        $this->programType = $programType;
    }

    /**
     * Run the validation rule.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $incMinimums = [
            'ANM' => 480,
            'GNM' => 600,
            'BSc' => 800,
            'Post Basic' => 600,
            'M.Sc' => 500,
        ];

        if (!isset($incMinimums[$this->programType])) {
            $fail("Unknown nursing program type: {$this->programType}");
            return;
        }

        $minimum = $incMinimums[$this->programType];
        if ($value < $minimum) {
            $fail("INC requires minimum {$minimum} clinical hours for {$this->programType}. Provided: {$value}");
        }
    }
}

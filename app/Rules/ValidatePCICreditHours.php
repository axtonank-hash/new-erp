<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidatePCICreditHours implements ValidationRule
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
        $pciCredits = [
            'D.Pharm' => ['min' => 64, 'max' => 66],
            'B.Pharm' => ['min' => 150, 'max' => 152],
            'M.Pharm' => ['min' => 80, 'max' => 82],
            'Pharm.D' => ['min' => 280, 'max' => 282],
        ];

        if (!isset($pciCredits[$this->programType])) {
            $fail("Unknown pharmacy program type: {$this->programType}");
            return;
        }

        $range = $pciCredits[$this->programType];
        if ($value < $range['min'] || $value > $range['max']) {
            $fail("PCI requires {$range['min']}-{$range['max']} credits for {$this->programType}. Provided: {$value}");
        }
    }
}

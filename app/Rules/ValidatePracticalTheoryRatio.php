<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidatePracticalTheoryRatio implements ValidationRule
{
    private $regulatoryBody;
    private $maxRatio;

    public function __construct($regulatoryBody = 'UNIVERSITY', $maxRatio = 0.50)
    {
        $this->regulatoryBody = $regulatoryBody;
        $this->maxRatio = $maxRatio;

        // Set defaults based on regulatory body
        if ($regulatoryBody === 'INC') {
            $this->maxRatio = 0.40; // INC: max 40% practical
        } elseif ($regulatoryBody === 'PCI') {
            $this->maxRatio = 0.50; // PCI: max 50% practical
        }
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
        // This will be called with practical_hours
        // We need to validate against theory_hours from the request
        // This is a simplified version - in actual use, you'd validate in a FormRequest
        
        // Example usage in FormRequest:
        // 'practical_hours' => [new ValidatePracticalTheoryRatio('INC')]
        
        $fail("Practical hours validation requires FormRequest context");
    }
}

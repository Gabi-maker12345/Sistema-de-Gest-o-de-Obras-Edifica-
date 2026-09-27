<?php

namespace App\Enums;

enum EstadoDecisao: string
{
    case Pendente = 'pendente';
    case Implementada = 'implementada';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::Pendente => 'Pendente',
            self::Implementada => 'Implementada',
        };
    }
}

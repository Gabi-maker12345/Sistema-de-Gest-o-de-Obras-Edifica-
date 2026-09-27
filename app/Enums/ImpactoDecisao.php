<?php

namespace App\Enums;

enum ImpactoDecisao: string
{
    case Custo = 'custo';
    case Prazo = 'prazo';
    case Ambito = 'ambito';

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
            self::Custo => 'Custo',
            self::Prazo => 'Prazo',
            self::Ambito => 'Âmbito',
        };
    }
}

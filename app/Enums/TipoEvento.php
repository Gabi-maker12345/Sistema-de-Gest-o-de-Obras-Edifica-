<?php

namespace App\Enums;

enum TipoEvento: string
{
    case Pessoal = 'pessoal';
    case Profissional = 'profissional';
    case Obra = 'obra';

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
            self::Pessoal => 'Pessoal',
            self::Profissional => 'Profissional',
            self::Obra => 'Obra',
        };
    }
}

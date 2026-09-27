<?php

namespace App\Enums;

enum PrioridadeTarefa: string
{
    case Baixa = 'baixa';
    case Media = 'media';
    case Alta = 'alta';

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
            self::Baixa => 'Baixa',
            self::Media => 'Média',
            self::Alta => 'Alta',
        };
    }
}

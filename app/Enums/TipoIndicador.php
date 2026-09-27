<?php

namespace App\Enums;

enum TipoIndicador: string
{
    case Custo = 'custo';
    case Prazo = 'prazo';
    case Qualidade = 'qualidade';
    case Seguranca = 'seguranca';

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
            self::Qualidade => 'Qualidade',
            self::Seguranca => 'Segurança',
        };
    }
}

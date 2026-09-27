<?php

namespace App\Enums;

enum TipoDocumento: string
{
    case Contrato = 'contrato';
    case Licenca = 'licenca';
    case Planta = 'planta';
    case Especificacao = 'especificacao';
    case Factura = 'factura';
    case Outro = 'outro';

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
            self::Contrato => 'Contrato',
            self::Licenca => 'Licença',
            self::Planta => 'Planta',
            self::Especificacao => 'Especificação',
            self::Factura => 'Factura',
            self::Outro => 'Outro',
        };
    }
}

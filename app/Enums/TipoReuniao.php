<?php

namespace App\Enums;

enum TipoReuniao: string
{
    case Obra = 'obra';
    case Cliente = 'cliente';
    case Interna = 'interna';
    case Fornecedor = 'fornecedor';

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
            self::Obra => 'Obra',
            self::Cliente => 'Cliente',
            self::Interna => 'Interna',
            self::Fornecedor => 'Fornecedor',
        };
    }
}

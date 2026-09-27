<?php

namespace App\Enums;

enum CategoriaDespesa: string
{
    case MaoDeObra = 'mao_de_obra';
    case Material = 'material';
    case Equipamento = 'equipamento';
    case Subcontratacao = 'subcontratacao';
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
            self::MaoDeObra => 'Mão de obra',
            self::Material => 'Material',
            self::Equipamento => 'Equipamento',
            self::Subcontratacao => 'Subcontratação',
            self::Outro => 'Outro',
        };
    }
}

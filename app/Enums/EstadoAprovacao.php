<?php

namespace App\Enums;

enum EstadoAprovacao: string
{
    case Pendente = 'pendente';
    case Aprovada = 'aprovada';
    case Rejeitada = 'rejeitada';

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
            self::Aprovada => 'Aprovada',
            self::Rejeitada => 'Rejeitada',
        };
    }
}

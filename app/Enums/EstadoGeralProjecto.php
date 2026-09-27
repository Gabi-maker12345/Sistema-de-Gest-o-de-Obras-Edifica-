<?php

namespace App\Enums;

enum EstadoGeralProjecto: string
{
    case Planeamento = 'planeamento';
    case EmExecucao = 'em_execucao';
    case Suspenso = 'suspenso';
    case Cancelado = 'cancelado';

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
            self::Planeamento => 'Planeamento',
            self::EmExecucao => 'Em execução',
            self::Suspenso => 'Suspenso',
            self::Cancelado => 'Cancelado',
        };
    }
}

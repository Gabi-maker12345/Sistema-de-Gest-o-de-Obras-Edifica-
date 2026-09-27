<?php

namespace App\Enums;

enum PapelProjecto: string
{
    case Gestor = 'gestor';
    case Colaborador = 'colaborador';
    case Fiscal = 'fiscal';
    case Consulta = 'consulta';

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
            self::Gestor => 'Gestor',
            self::Colaborador => 'Colaborador',
            self::Fiscal => 'Fiscal',
            self::Consulta => 'Consulta',
        };
    }

    /**
     * Papéis que permitem alterar o estado de registos do projecto.
     */
    public function podeEscrever(): bool
    {
        return match ($this) {
            self::Gestor, self::Colaborador => true,
            self::Fiscal, self::Consulta => false,
        };
    }

    /**
     * Papéis que podem ver e descrever custos do projecto.
     */
    public function podeVerFinanceiro(): bool
    {
        return match ($this) {
            self::Gestor, self::Fiscal, self::Colaborador => true,
            self::Consulta => false,
        };
    }
}

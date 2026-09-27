<?php

namespace App\Enums;

enum EstadoPagamento: string
{
    case Pendente = 'pendente';
    case Pago = 'pago';
    case Atrasado = 'atrasado';

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
            self::Pago => 'Pago',
            self::Atrasado => 'Atrasado',
        };
    }
}

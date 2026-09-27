<?php

namespace App\Enums;

enum EstadoTarefa: string
{
    case Pendente = 'pendente';
    case EmCurso = 'em_curso';
    case Concluida = 'concluida';
    case Atrasada = 'atrasada';

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
            self::EmCurso => 'Em Curso',
            self::Concluida => 'Concluída',
            self::Atrasada => 'Atrasada',
        };
    }
}

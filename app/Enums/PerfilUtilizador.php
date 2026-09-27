<?php

namespace App\Enums;

enum PerfilUtilizador: string
{
    case Admin = 'admin';
    case Proprietario = 'proprietario';
    case Gestor = 'gestor';
    case Encarregado = 'encarregado';
    case Tecnico = 'tecnico';
    case Fiscal = 'fiscal';

    /**
     * Perfis com acesso total, que bypassam o papel atribuído por projecto.
     */
    public function temAcessoTotal(): bool
    {
        return $this === self::Admin || $this === self::Proprietario;
    }

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
            self::Admin => 'Administrador',
            self::Proprietario => 'Proprietário',
            self::Gestor => 'Gestor',
            self::Encarregado => 'Encarregado',
            self::Tecnico => 'Técnico',
            self::Fiscal => 'Fiscal',
        };
    }
}

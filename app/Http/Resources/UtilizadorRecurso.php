<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Utilizador no formato que o front conhece: `nome` (a tabela chama-lhe
 * `name`), id em string, perfil como valor do enum.
 */
class UtilizadorRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'nome' => $this->name,
            'email' => $this->email,
            'telefone' => $this->telefone ?? '',
            'perfil' => $this->perfil?->value,
            'activo' => (bool) $this->ativo,
        ];
    }
}

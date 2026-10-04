<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Linha da aba Acessos: a pivot projecto_user exposta com utilizador embutido.
 */
class AcessoRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'projectoId' => (string) $this->projecto_id,
            'utilizadorId' => (string) $this->user_id,
            'papel' => $this->papel?->value,
            'utilizador' => new UtilizadorRecurso($this->whenLoaded('user')),
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MembroEquipaRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'equipaId' => (string) $this->equipa_id,
            'utilizadorId' => (string) $this->user_id,
            'funcao' => $this->funcao ?? '',
            'dataEntrada' => $this->data_entrada?->format('Y-m-d'),
            'dataSaida' => $this->data_saida?->format('Y-m-d'),
            'utilizador' => new UtilizadorRecurso($this->whenLoaded('user')),
        ];
    }
}

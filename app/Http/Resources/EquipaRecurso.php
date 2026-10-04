<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EquipaRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'projectoId' => $this->projecto_id === null ? null : (string) $this->projecto_id,
            'nome' => $this->nome,
            'especialidade' => $this->especialidade ?? '',
            'encarregadoId' => $this->encarregado_id === null ? null : (string) $this->encarregado_id,
            'membrosCount' => (int) $this->whenCounted('membros'),
            'membros' => MembroEquipaRecurso::collection($this->whenLoaded('membros')),
        ];
    }
}

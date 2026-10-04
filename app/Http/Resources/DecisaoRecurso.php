<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DecisaoRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'reuniaoId' => $this->reuniao_id === null ? null : (string) $this->reuniao_id,
            'projectoId' => (string) $this->projecto_id,
            'descricao' => $this->descricao,
            'responsavelId' => $this->responsavel_id === null ? null : (string) $this->responsavel_id,
            'estado' => $this->estado?->value,
            'impacto' => $this->impacto?->value,
            'prazoImplementacao' => $this->prazo_implementacao?->format('Y-m-d'),
        ];
    }
}

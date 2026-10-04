<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AreaRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'nome' => $this->nome,
            'descricao' => $this->descricao ?? '',
            'responsavelId' => $this->responsavel_id === null ? null : (string) $this->responsavel_id,
            'projectosCount' => (int) $this->whenCounted('projectos'),
        ];
    }
}

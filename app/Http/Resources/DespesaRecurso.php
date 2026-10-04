<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DespesaRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'projectoId' => $this->projecto_id === null ? null : (string) $this->projecto_id,
            'categoria' => $this->categoria?->value,
            'descricao' => $this->descricao ?? '',
            'valor' => (float) $this->valor,
            'data' => $this->data?->format('Y-m-d'),
            'fornecedorId' => $this->fornecedor_id === null ? null : (string) $this->fornecedor_id,
            'estadoAprovacao' => $this->estado_aprovacao?->value,
            'registadoPor' => $this->registado_por === null ? null : (string) $this->registado_por,
            'sincronizado' => (bool) $this->sincronizado,
            'pagamentos' => PagamentoRecurso::collection($this->whenLoaded('pagamentos')),
        ];
    }
}

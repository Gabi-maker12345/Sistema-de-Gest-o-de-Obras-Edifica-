<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PagamentoRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'despesaId' => (string) $this->despesa_id,
            'valor' => (float) $this->valor,
            'dataPagamento' => $this->data_pagamento?->format('Y-m-d'),
            'metodoPagamento' => $this->metodo_pagamento,
            'referencia' => $this->referencia ?? '',
            'estado' => $this->estado?->value,
            'aprovadoPor' => $this->aprovado_por === null ? null : (string) $this->aprovado_por,
        ];
    }
}

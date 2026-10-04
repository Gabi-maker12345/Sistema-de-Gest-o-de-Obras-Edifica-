<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IndicadorRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'projectoId' => (string) $this->projecto_id,
            'nomeIndicador' => $this->nome_indicador,
            'valor' => (float) $this->valor,
            'unidade' => $this->unidade ?? '',
            'meta' => $this->meta === null ? null : (float) $this->meta,
            'tipo' => $this->tipo?->value,
            'dataReferencia' => $this->data_referencia?->format('Y-m-d'),
        ];
    }
}

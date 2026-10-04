<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DiarioObraRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'projectoId' => (string) $this->projecto_id,
            'data' => $this->data?->format('Y-m-d'),
            'condicoesMeteorologicas' => $this->condicoes_meteorologicas,
            'efectivoPresente' => (int) ($this->efectivo_presente ?? 0),
            'actividadesRealizadas' => is_string($this->actividades_realizadas)
                ? (json_decode($this->actividades_realizadas, true) ?: [])
                : ($this->actividades_realizadas ?? []),
            'ocorrencias' => $this->ocorrencias ?? '',
            'registadoPor' => $this->registado_por === null ? null : (string) $this->registado_por,
            'sincronizado' => (bool) $this->sincronizado,
        ];
    }
}

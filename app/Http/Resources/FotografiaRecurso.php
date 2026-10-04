<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FotografiaRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'projectoId' => (string) $this->projecto_id,
            'diarioId' => $this->diario_id === null ? null : (string) $this->diario_id,
            'tarefaId' => $this->tarefa_id === null ? null : (string) $this->tarefa_id,
            'url' => $this->url ?? '',
            'descricao' => $this->descricao ?? '',
            'dataCaptura' => $this->data_captura?->format('Y-m-d\TH:i:00'),
            'localizacao' => $this->localizacao ?? '',
            'latitude' => $this->latitude === null ? null : (float) $this->latitude,
            'longitude' => $this->longitude === null ? null : (float) $this->longitude,
            'tiradaPor' => $this->tirada_por === null ? null : (string) $this->tirada_por,
            'sincronizado' => (bool) $this->sincronizado,
        ];
    }
}

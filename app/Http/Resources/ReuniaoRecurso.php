<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReuniaoRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'projectoId' => (string) $this->projecto_id,
            'titulo' => $this->titulo,
            'tipo' => $this->tipo?->value,
            'dataHora' => $this->data_hora?->format('Y-m-d\TH:i:00'),
            'local' => $this->local ?? '',
            'convocadoPor' => $this->convocado_por === null ? null : (string) $this->convocado_por,
            'acta' => $this->acta ?? '',
        ];
    }
}

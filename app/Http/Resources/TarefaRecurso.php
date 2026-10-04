<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TarefaRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'projectoId' => $this->actividade?->projecto_id === null ? null : (string) $this->actividade->projecto_id,
            'actividadeId' => $this->actividade_id === null ? null : (string) $this->actividade_id,
            'equipaId' => $this->equipa_id === null ? null : (string) $this->equipa_id,
            'titulo' => $this->titulo,
            'descricao' => $this->descricao ?? '',
            'responsavelId' => $this->responsavel_id === null ? null : (string) $this->responsavel_id,
            'prioridade' => $this->prioridade?->value,
            'estado' => $this->estado?->value,
            'prazo' => $this->prazo?->format('Y-m-d'),
            'dataInicio' => $this->data_inicio?->format('Y-m-d'),
            'dataConclusao' => $this->data_conclusao?->format('Y-m-d'),
            'horasEstimadas' => $this->horas_estimadas === null ? null : (float) $this->horas_estimadas,
            'horasReais' => $this->horas_reais === null ? null : (float) $this->horas_reais,
            'percentagemConclusao' => (int) $this->percentagem_conclusao,
            'responsavel' => new UtilizadorRecurso($this->whenLoaded('responsavel')),
            'actividade' => new ActividadeRecurso($this->whenLoaded('actividade')),
        ];
    }
}

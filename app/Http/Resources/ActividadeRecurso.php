<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActividadeRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'projectoId' => (string) $this->projecto_id,
            'actividadePaiId' => $this->actividade_pai_id === null ? null : (string) $this->actividade_pai_id,
            'nome' => $this->nome,
            'descricao' => $this->descricao ?? '',
            'dataInicioPrevista' => $this->data_inicio_prevista?->format('Y-m-d'),
            'dataFimPrevista' => $this->data_fim_prevista?->format('Y-m-d'),
            'dataInicioReal' => $this->data_inicio_real?->format('Y-m-d'),
            'dataFimReal' => $this->data_fim_real?->format('Y-m-d'),
            'percentagemConclusao' => (int) $this->percentagem_conclusao,
            'estado' => $this->estado?->value,
            'tarefasCount' => (int) $this->whenCounted('tarefas'),
        ];
    }
}

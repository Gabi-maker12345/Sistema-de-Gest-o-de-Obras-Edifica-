<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventoAgendaRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'utilizadorId' => (string) $this->user_id,
            'projectoId' => $this->projecto_id === null ? null : (string) $this->projecto_id,
            'tarefaId' => $this->tarefa_id === null ? null : (string) $this->tarefa_id,
            'titulo' => $this->titulo,
            'descricao' => $this->descricao ?? '',
            'tipo' => $this->tipo?->value,
            'dataHoraInicio' => $this->data_hora_inicio?->format('Y-m-d\TH:i:00'),
            'dataHoraFim' => $this->data_hora_fim?->format('Y-m-d\TH:i:00'),
            'local' => $this->local ?? '',
            'lembreteMinutosAntes' => $this->lembrete_minutos_antes === null ? null : (int) $this->lembrete_minutos_antes,
        ];
    }
}

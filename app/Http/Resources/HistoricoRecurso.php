<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Entrada do activity log no formato da aba Histórico do front.
 */
class HistoricoRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $propriedades = $this->properties ?? [];
        $mudancas = $propriedades['attributes'] ?? [];
        $primeiro = array_key_first($mudancas);

        $entidade = match (true) {
            str_contains((string) $this->subject_type, 'Projecto') => 'Projecto',
            str_contains((string) $this->subject_type, 'Actividade') => 'Actividade',
            str_contains((string) $this->subject_type, 'Tarefa') => 'Tarefa',
            str_contains((string) $this->subject_type, 'Despesa') => 'Despesa',
            str_contains((string) $this->subject_type, 'DiarioObra') => 'Diário de obra',
            str_contains((string) $this->subject_type, 'Documento') => 'Documento',
            str_contains((string) $this->subject_type, 'Decisao') => 'Decisão',
            default => class_basename((string) $this->subject_type),
        };

        return [
            'id' => (string) $this->id,
            'entidade' => $entidade,
            'registoId' => $this->subject_id === null ? '' : (string) $this->subject_id,
            'utilizadorId' => $this->causer_id === null ? '' : (string) $this->causer_id,
            'criadoEm' => $this->created_at?->format('Y-m-d\TH:i:00'),
            'campo' => $this->event === 'created' ? null : (string) $primeiro,
            'de' => $this->event === 'created' ? null : json_encode($mudancas[$primeiro] ?? null, JSON_UNESCAPED_UNICODE),
            'para' => $this->event === 'created' ? null : json_encode($mudancas[$primeiro] ?? null, JSON_UNESCAPED_UNICODE),
            'evento' => $this->event,
            'descricao' => $this->description,
        ];
    }
}

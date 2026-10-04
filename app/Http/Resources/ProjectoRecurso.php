<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectoRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $verValores = $request->user()?->can('verValores', $this->resource) ?? false;

        return [
            'id' => (string) $this->id,
            'nome' => $this->nome,
            'cliente' => $this->cliente ?? '',
            'morada' => $this->morada ?? '',
            'areaId' => $this->area_id === null ? null : (string) $this->area_id,
            'gestorId' => $this->gestor_id === null ? null : (string) $this->gestor_id,
            'dataInicio' => $this->data_inicio?->format('Y-m-d'),
            'dataFimPrevista' => $this->data_fim_prevista?->format('Y-m-d'),
            'dataFimReal' => $this->data_fim_real?->format('Y-m-d'),
            'orcamentoPrevisto' => $verValores && $this->orcamento_previsto !== null ? (float) $this->orcamento_previsto : null,
            'orcamentoActual' => $verValores && $this->orcamento_actual !== null ? (float) $this->orcamento_actual : null,
            'valorContratual' => $verValores && $this->valor_contratual !== null ? (float) $this->valor_contratual : 0,
            'estadoGeral' => $this->estado_geral?->value,
            'execucaoFisica' => (float) ($this->execucao_fisica_percentagem ?? 0),
            'execucaoFinanceira' => $verValores ? (float) ($this->execucao_financeira_percentagem ?? 0) : null,
            'encerramentoAdministrativo' => (bool) $this->encerramento_administrativo,
            'actividadesCount' => (int) $this->whenCounted('actividades'),
            'despesasCount' => (int) $this->whenCounted('despesas'),
            'equipasCount' => (int) $this->whenCounted('equipas'),
            'area' => new AreaRecurso($this->whenLoaded('area')),
            'gestor' => new UtilizadorRecurso($this->whenLoaded('gestor')),
            'acessos' => AcessoRecurso::collection($this->whenLoaded('utilizadoresAcessos')),
        ];
    }
}

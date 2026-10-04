<?php

namespace App\Http\Controllers\Admin;

use App\Enums\EstadoActividade;
use App\Enums\EstadoAprovacao;
use App\Enums\EstadoTarefa;
use App\Http\Controllers\Controller;
use App\Http\Resources\ActividadeRecurso;
use App\Http\Resources\DespesaRecurso;
use App\Http\Resources\ProjectoRecurso;
use App\Http\Resources\TarefaRecurso;
use App\Models\Actividade;
use App\Models\Despesa;
use App\Models\Projecto;
use App\Models\Tarefa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * O pulso da obra (spec §7): projectos visíveis, execução, alertas e a
     * despesa aprovada — tudo lido do banco, nada em memória.
     */
    public function index(Request $request): Response
    {
        $utilizador = $request->user();

        $projectos = Projecto::query()
            ->visiveisA($utilizador)
            ->with('area')
            ->latest()
            ->get();

        $ids = $projectos->pluck('id');

        $actividadesAtrasadas = Actividade::query()
            ->whereIn('projecto_id', $ids)
            ->where(fn ($q) => $q
                ->where('estado', EstadoActividade::Atrasada)
                ->orWhere(fn ($q2) => $q2
                    ->where('estado', EstadoActividade::EmCurso)
                    ->whereDate('data_fim_prevista', '<', now())))
            ->with('projecto:id,nome')
            ->orderBy('data_fim_prevista')
            ->limit(10)
            ->get();

        $tarefasPendentes = Tarefa::query()
            ->whereIn('projecto_id', $ids)
            ->whereIn('estado', [EstadoTarefa::Pendente, EstadoTarefa::EmCurso, EstadoTarefa::Atrasada])
            ->with('projecto:id,nome')
            ->orderBy('prazo')
            ->limit(10)
            ->get();

        $despesasProximas = Despesa::query()
            ->whereIn('projecto_id', $ids)
            ->where('estado_aprovacao', EstadoAprovacao::Pendente)
            ->with('projecto:id,nome')
            ->orderBy('data')
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'projectos' => ProjectoRecurso::collection($projectos),
            'totais' => [
                'projectosActivos' => $projectos->where('estado_geral', \App\Enums\EstadoGeralProjecto::EmExecucao)->count(),
                'projectosTotais' => $projectos->count(),
                'mediaExecucaoFisica' => round((float) $projectos->avg('execucao_fisica_percentagem'), 1),
                'despesaAprovadaTotal' => (float) Despesa::query()
                    ->whereIn('projecto_id', $ids)
                    ->where('estado_aprovacao', EstadoAprovacao::Aprovada)
                    ->sum('valor'),
            ],
            'alertas' => [
                'actividadesAtrasadas' => ActividadeRecurso::collection($actividadesAtrasadas),
                'tarefasPendentes' => TarefaRecurso::collection($tarefasPendentes),
                'despesasPorAprovar' => DespesaRecurso::collection($despesasProximas),
            ],
        ]);
    }
}

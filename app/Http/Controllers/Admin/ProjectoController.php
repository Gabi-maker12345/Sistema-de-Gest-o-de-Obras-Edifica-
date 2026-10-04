<?php

namespace App\Http\Controllers\Admin;

use App\Enums\EstadoGeralProjecto;
use App\Http\Controllers\Admin\Concerns\GuardaRecursosSgo;
use App\Http\Controllers\Controller;
use App\Http\Resources\ActividadeRecurso;
use App\Http\Resources\DecisaoRecurso;
use App\Http\Resources\DespesaRecurso;
use App\Http\Resources\DiarioObraRecurso;
use App\Http\Resources\DocumentoRecurso;
use App\Http\Resources\EquipaRecurso;
use App\Http\Resources\EventoAgendaRecurso;
use App\Http\Resources\FotografiaRecurso;
use App\Http\Resources\HistoricoRecurso;
use App\Http\Resources\IndicadorRecurso;
use App\Http\Resources\MaterialRecurso;
use App\Http\Resources\ProjectoRecurso;
use App\Http\Resources\ReuniaoRecurso;
use App\Http\Resources\TarefaRecurso;
use App\Http\Resources\UtilizadorRecurso;
use App\Models\Area;
use App\Models\EventoAgenda;
use App\Models\Projecto;
use App\Models\Tarefa;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;

class ProjectoController extends Controller
{
    use GuardaRecursosSgo;

    /** Corpo camelCase do front -> colunas do modelo. */
    private const CAMPOS = [
        'areaId' => 'area_id',
        'gestorId' => 'gestor_id',
        'dataInicio' => 'data_inicio',
        'dataFimPrevista' => 'data_fim_prevista',
        'dataFimReal' => 'data_fim_real',
        'valorContratual' => 'valor_contratual',
        'orcamentoPrevisto' => 'orcamento_previsto',
        'estadoGeral' => 'estado_geral',
        'encerramentoAdministrativo' => 'encerramento_administrativo',
    ];

    public function index(Request $request): Response
    {
        $pesquisa = $request->string('pesquisa')->trim()->value();
        $estado = $request->string('estado')->trim()->value();

        $projectos = Projecto::query()
            ->visiveisA($request->user())
            ->with('area')
            ->when($pesquisa !== '', function ($q) use ($pesquisa) {
                $q->where(fn ($w) => $w
                    ->where('nome', 'like', "%{$pesquisa}%")
                    ->orWhere('cliente', 'like', "%{$pesquisa}%"));
            })
            ->when($estado !== '', fn ($q) => $q->where('estado_geral', $estado))
            ->latest()
            ->get();

        return Inertia::render('Admin/Projectos', [
            'projectos' => ProjectoRecurso::collection($projectos),
            'areas' => Area::query()->orderBy('nome')->get(['id', 'nome']),
            'filtroPesquisa' => $pesquisa,
            'filtroEstado' => $estado,
        ]);
    }

    /**
     * A ficha da obra (spec §8): todas as gavetas de uma vez, lidas do banco.
     */
    public function show(Request $request, Projecto $projecto): Response
    {
        $this->authorize('view', $projecto);

        $projecto->load('area', 'gestor');

        $actividades = $projecto->actividades()->orderBy('data_inicio_prevista')->get();
        $equipas = $projecto->equipas()->get();
        $despesas = $projecto->despesas()->latest('data')->get();

        return Inertia::render('Admin/ProjectoDetalhe', [
            'projecto' => new ProjectoRecurso($projecto),
            'actividades' => ActividadeRecurso::collection($actividades),
            'tarefas' => TarefaRecurso::collection(
                Tarefa::whereIn('actividade_id', $actividades->pluck('id'))->get()
            ),
            'diarios' => DiarioObraRecurso::collection(
                $projecto->diariosObra()->latest('data')->get()
            ),
            'fotografias' => FotografiaRecurso::collection(
                $projecto->fotografias()->latest('data_captura')->get()
            ),
            'documentos' => DocumentoRecurso::collection(
                $projecto->documentos()->latest()->get()
            ),
            'despesas' => DespesaRecurso::collection($despesas),
            'pagamentos' => \App\Http\Resources\PagamentoRecurso::collection(
                \App\Models\Pagamento::whereIn('despesa_id', $despesas->pluck('id'))->get()
            ),
            'equipas' => EquipaRecurso::collection($equipas),
            'reunioes' => ReuniaoRecurso::collection(
                $projecto->reunioes()->latest('data_hora')->get()
            ),
            'decisoes' => DecisaoRecurso::collection(
                $projecto->decisoes()->latest('prazo_implementacao')->get()
            ),
            'indicadores' => IndicadorRecurso::collection($projecto->indicadores()->get()),
            // Catálogo global de materiais: a obra consome via requisições.
            'materiais' => MaterialRecurso::collection(
                \App\Models\Material::orderBy('nome')->get()
            ),
            'eventos' => EventoAgendaRecurso::collection(
                EventoAgenda::where('projecto_id', $projecto->getKey())->get()
            ),
            'acessos' => $this->linhasDeAcesso($projecto),
            'historico' => HistoricoRecurso::collection(
                \Spatie\Activitylog\Models\Activity::query()
                    ->where(function ($q) use ($projecto) {
                        $q->where(fn ($a) => $a
                            ->where('subject_type', Projecto::class)
                            ->where('subject_id', $projecto->getKey()))
                          ->orWhere('properties->projecto_id', (string) $projecto->getKey());
                    })
                    ->latest()
                    ->limit(100)
                    ->get()
            ),
            'utilizadores' => User::query()->orderBy('name')->get(['id', 'name', 'perfil']),
            'areas' => Area::query()->orderBy('nome')->get(['id', 'nome']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Projecto::class);

        return $this->guardar(
            $request,
            Projecto::class,
            null,
            $this->regras(),
            function (array $dados, Request $r) {
                $traduzidos = $this->traduzir($dados);
                $traduzidos['gestor_id'] ??= $r->user()->getKey();

                return $traduzidos;
            },
        );
    }

    public function update(Request $request, Projecto $projecto): JsonResponse
    {
        $this->authorize('update', $projecto);

        return $this->guardar($request, Projecto::class, $projecto, $this->regras(), fn (array $dados) => $this->traduzir($dados));
    }

    public function destroy(Projecto $projecto): JsonResponse
    {
        $this->authorize('delete', $projecto);

        return $this->eliminarRegisto($projecto);
    }

    protected function recursoPara(Model $registo): ProjectoRecurso
    {
        /** @var Projecto $registo */
        return new ProjectoRecurso($registo->loadMissing('area', 'gestor'));
    }

    /**
     * Aba Acessos: linhas {id, projectoId, utilizadorId, papel, utilizador}
     * directamente do pivot `projecto_user` (ponto 4 da análise: o papel é
     * único por linha; escrita/financeiro derivam dele no servidor).
     *
     * @return array<int, array<string, mixed>>
     */
    private function linhasDeAcesso(Projecto $projecto): array
    {
        return Projecto::find($projecto->getKey())
            ->utilizadores()
            ->withPivot('id', 'papel')
            ->get()
            ->map(fn (User $u) => [
                'id' => (string) $u->pivot->id,
                'projectoId' => (string) $projecto->getKey(),
                'utilizadorId' => (string) $u->getKey(),
                'papel' => $u->pivot->papel,
                'utilizador' => (new UtilizadorRecurso($u))->resolve(),
            ])
            ->all();
    }

    /**
     * @param  array<string, mixed>  $dados
     * @return array<string, mixed>
     */
    private function traduzir(array $dados): array
    {
        $traduzidos = [];

        foreach ($dados as $chave => $valor) {
            $traduzidos[self::CAMPOS[$chave] ?? $chave] = $valor;
        }

        return $traduzidos;
    }

    /**
     * @return array<string, mixed>
     */
    private function regras(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'cliente' => ['nullable', 'string', 'max:255'],
            'morada' => ['nullable', 'string', 'max:255'],
            'areaId' => ['nullable', 'integer', 'exists:areas,id'],
            'gestorId' => ['nullable', 'integer', 'exists:users,id'],
            'dataInicio' => ['nullable', 'date'],
            'dataFimPrevista' => ['nullable', 'date', 'after_or_equal:dataInicio'],
            'dataFimReal' => ['nullable', 'date'],
            'valorContratual' => ['nullable', 'numeric', 'min:0'],
            'orcamentoPrevisto' => ['nullable', 'numeric', 'min:0'],
            'estadoGeral' => ['nullable', Enum::for(EstadoGeralProjecto::class)],
            'encerramentoAdministrativo' => ['sometimes', 'boolean'],
        ];
    }
}

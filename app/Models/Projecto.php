<?php

namespace App\Models;

use App\Enums\EstadoAprovacao;
use App\Enums\EstadoGeralProjecto;
use App\Enums\PapelProjecto;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Fillable([
    'area_id',
    'gestor_id',
    'nome',
    'cliente',
    'morada',
    'data_inicio',
    'data_fim_prevista',
    'data_fim_real',
    'valor_contratual',
    'orcamento_previsto',
    'orcamento_actual',
    'estado_geral',
    'execucao_fisica_percentagem',
    'execucao_financeira_percentagem',
    'encerramento_administrativo',
])]
class Projecto extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'estado_geral' => EstadoGeralProjecto::Planeamento,
        'execucao_fisica_percentagem' => 0,
        'execucao_financeira_percentagem' => 0,
        'encerramento_administrativo' => false,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'data_inicio' => 'date',
            'data_fim_prevista' => 'date',
            'data_fim_real' => 'date',
            'valor_contratual' => 'decimal:2',
            'orcamento_previsto' => 'decimal:2',
            'orcamento_actual' => 'decimal:2',
            'estado_geral' => EstadoGeralProjecto::class,
            'execucao_fisica_percentagem' => 'decimal:2',
            'execucao_financeira_percentagem' => 'decimal:2',
            'encerramento_administrativo' => 'boolean',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('projecto')
            ->logOnlyDirty()
            ->logAll();
    }

    /**
     * Projectos visíveis para o utilizador: todos os que lhe estão atribuídos,
     * ou todos se for administrador.
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    #[Scope]
    protected function visiveisA(Builder $query, User $user): Builder
    {
        if ($user->temAcessoTotal()) {
            return $query;
        }

        return $query->whereHas('utilizadores', function (Builder $q) use ($user) {
            $q->where('users.id', $user->getKey());
        });
    }

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    #[Scope]
    protected function emExecucao(Builder $query): Builder
    {
        return $query->where('estado_geral', EstadoGeralProjecto::EmExecucao);
    }

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    #[Scope]
    protected function semEncerramentoAdministrativo(Builder $query): Builder
    {
        return $query->where('encerramento_administrativo', false);
    }

    /**
     * Recalcula a execução financeira a partir das despesas aprovadas.
     *
     * valor executado = SUM(despesas.valor aprovadas) / valor_contratual * 100
     *
     * NOTA: assume que "valor executado" corresponde à soma das despesas
     * aprovadas. Se o cliente pretende medições/certificação de trabalho,
     * esta fórmula tem de ser substituída por uma entidade Medicoes.
     */
    public function recalcularExecucaoFinanceira(): void
    {
        if ($this->valor_contratual === null || (float) $this->valor_contratual <= 0) {
            $this->forceFill(['execucao_financeira_percentagem' => 0])->saveQuietly();

            return;
        }

        $aprovado = $this->despesas()
            ->where('estado_aprovacao', EstadoAprovacao::Aprovada)
            ->sum('valor');

        $percentagem = round(((float) $aprovado / (float) $this->valor_contratual) * 100, 2);

        $this->forceFill(['execucao_financeira_percentagem' => $percentagem])->saveQuietly();
    }

    /**
     * Recalcula a execução física como média simples das actividades.
     *
     * NOTA: média sem ponderação; a ponderação por peso/orçamento fica para
     * uma ronda posterior.
     */
    public function recalcularExecucaoFisica(): void
    {
        $media = (float) $this->actividades()->avg('percentagem_conclusao');

        $this->forceFill(['execucao_fisica_percentagem' => round($media, 2)])->saveQuietly();
    }

    /**
     * @return BelongsTo<Area, $this>
     */
    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function gestor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'gestor_id');
    }

    /**
     * @return BelongsToMany<User, $this>
     */
    public function utilizadores(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'projecto_user')
            ->using(ProjectoUser::class)
            ->withPivot('papel');
    }

    /**
     * Utilizadores com um papel específico neste projecto.
     *
     * @return BelongsToMany<User, $this>
     */
    public function utilizadoresComPapel(PapelProjecto $papel): BelongsToMany
    {
        return $this->utilizadores()->wherePivot('papel', $papel->value);
    }

    /**
     * @return HasMany<Actividade, $this>
     */
    public function actividades(): HasMany
    {
        return $this->hasMany(Actividade::class);
    }

    /**
     * @return HasMany<Documento, $this>
     */
    public function documentos(): HasMany
    {
        return $this->hasMany(Documento::class);
    }

    /**
     * @return HasMany<Despesa, $this>
     */
    public function despesas(): HasMany
    {
        return $this->hasMany(Despesa::class);
    }

    /**
     * @return HasMany<Equipa, $this>
     */
    public function equipas(): HasMany
    {
        return $this->hasMany(Equipa::class);
    }

    /**
     * @return HasMany<RequisicaoMaterial, $this>
     */
    public function requisicoesMateriais(): HasMany
    {
        return $this->hasMany(RequisicaoMaterial::class);
    }

    /**
     * @return HasMany<DiarioObra, $this>
     */
    public function diariosObra(): HasMany
    {
        return $this->hasMany(DiarioObra::class);
    }

    /**
     * @return HasMany<Fotografia, $this>
     */
    public function fotografias(): HasMany
    {
        return $this->hasMany(Fotografia::class);
    }

    /**
     * @return HasMany<Reuniao, $this>
     */
    public function reunioes(): HasMany
    {
        return $this->hasMany(Reuniao::class);
    }

    /**
     * @return HasMany<EventoAgenda, $this>
     */
    public function eventosAgenda(): HasMany
    {
        return $this->hasMany(EventoAgenda::class);
    }

    /**
     * @return HasMany<Decisao, $this>
     */
    public function decisoes(): HasMany
    {
        return $this->hasMany(Decisao::class);
    }

    /**
     * @return HasMany<Indicador, $this>
     */
    public function indicadores(): HasMany
    {
        return $this->hasMany(Indicador::class);
    }
}

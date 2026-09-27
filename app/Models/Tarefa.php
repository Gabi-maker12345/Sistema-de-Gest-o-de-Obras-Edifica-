<?php

namespace App\Models;

use App\Enums\EstadoTarefa;
use App\Enums\PrioridadeTarefa;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Fillable([
    'actividade_id',
    'responsavel_id',
    'equipa_id',
    'titulo',
    'descricao',
    'data_inicio',
    'prazo',
    'data_conclusao',
    'prioridade',
    'estado',
    'percentagem_conclusao',
    'horas_estimadas',
    'horas_reais',
])]
class Tarefa extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'prioridade' => PrioridadeTarefa::Media,
        'estado' => EstadoTarefa::Pendente,
        'percentagem_conclusao' => 0,
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('tarefa')
            ->logOnlyDirty()
            ->logAll();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'data_inicio' => 'date',
            'prazo' => 'date',
            'data_conclusao' => 'date',
            'prioridade' => PrioridadeTarefa::class,
            'estado' => EstadoTarefa::class,
            'percentagem_conclusao' => 'integer',
            'horas_estimadas' => 'decimal:2',
            'horas_reais' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Actividade, $this>
     */
    public function actividade(): BelongsTo
    {
        return $this->belongsTo(Actividade::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function responsavel(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsavel_id');
    }

    /**
     * @return BelongsTo<Equipa, $this>
     */
    public function equipa(): BelongsTo
    {
        return $this->belongsTo(Equipa::class);
    }

    /**
     * @return HasMany<Fotografia, $this>
     */
    public function fotografias(): HasMany
    {
        return $this->hasMany(Fotografia::class);
    }

    /**
     * @return HasMany<RequisicaoMaterial, $this>
     */
    public function requisicoesMateriais(): HasMany
    {
        return $this->hasMany(RequisicaoMaterial::class);
    }
}

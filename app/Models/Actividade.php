<?php

namespace App\Models;

use App\Enums\EstadoActividade;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Fillable([
    'projecto_id',
    'actividade_pai_id',
    'nome',
    'descricao',
    'data_inicio_prevista',
    'data_fim_prevista',
    'data_inicio_real',
    'data_fim_real',
    'percentagem_conclusao',
    'estado',
])]
class Actividade extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'percentagem_conclusao' => 0,
        'estado' => EstadoActividade::NaoIniciada,
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('actividade')
            ->logOnlyDirty()
            ->logAll();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'data_inicio_prevista' => 'date',
            'data_fim_prevista' => 'date',
            'data_inicio_real' => 'date',
            'data_fim_real' => 'date',
            'percentagem_conclusao' => 'integer',
            'estado' => EstadoActividade::class,
        ];
    }

    /**
     * @return BelongsTo<Projecto, $this>
     */
    public function projecto(): BelongsTo
    {
        return $this->belongsTo(Projecto::class);
    }

    /**
     * @return BelongsTo<Actividade, $this>
     */
    public function actividadePai(): BelongsTo
    {
        return $this->belongsTo(self::class, 'actividade_pai_id');
    }

    /**
     * @return HasMany<Actividade, $this>
     */
    public function subActividades(): HasMany
    {
        return $this->hasMany(self::class, 'actividade_pai_id');
    }

    /**
     * @return HasMany<Tarefa, $this>
     */
    public function tarefas(): HasMany
    {
        return $this->hasMany(Tarefa::class);
    }
}

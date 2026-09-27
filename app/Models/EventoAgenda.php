<?php

namespace App\Models;

use App\Enums\TipoEvento;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('eventos_agenda')]
#[Fillable([
    'user_id',
    'projecto_id',
    'tarefa_id',
    'titulo',
    'descricao',
    'tipo',
    'data_hora_inicio',
    'data_hora_fim',
    'local',
    'lembrete_minutos_antes',
])]
class EventoAgenda extends Model
{
    use HasFactory;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'tipo' => TipoEvento::Pessoal,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tipo' => TipoEvento::class,
            'data_hora_inicio' => 'datetime',
            'data_hora_fim' => 'datetime',
            'lembrete_minutos_antes' => 'integer',
        ];
    }

    /**
     * Eventos a começar dentro da janela indicada, ordenados por início.
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    #[Scope]
    protected function entre(Builder $query, \DateTimeInterface $de, \DateTimeInterface $ate): Builder
    {
        return $query
            ->where('data_hora_inicio', '<=', $ate)
            ->where(function (Builder $q) use ($de) {
                $q->whereNull('data_hora_fim')->orWhere('data_hora_fim', '>=', $de);
            })
            ->orderBy('data_hora_inicio');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Projecto, $this>
     */
    public function projecto(): BelongsTo
    {
        return $this->belongsTo(Projecto::class);
    }

    /**
     * @return BelongsTo<Tarefa, $this>
     */
    public function tarefa(): BelongsTo
    {
        return $this->belongsTo(Tarefa::class);
    }
}

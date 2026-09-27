<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['projecto_id', 'encarregado_id', 'nome', 'especialidade'])]
class Equipa extends Model
{
    use HasFactory;

    /**
     * @return BelongsTo<Projecto, $this>
     */
    public function projecto(): BelongsTo
    {
        return $this->belongsTo(Projecto::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function encarregado(): BelongsTo
    {
        return $this->belongsTo(User::class, 'encarregado_id');
    }

    /**
     * @return BelongsToMany<User, $this>
     */
    public function membros(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'equipa_membros')
            ->withPivot('funcao', 'data_entrada', 'data_saida');
    }

    /**
     * @return HasMany<Tarefa, $this>
     */
    public function tarefas(): HasMany
    {
        return $this->hasMany(Tarefa::class);
    }
}

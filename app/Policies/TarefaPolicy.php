<?php

namespace App\Policies;

use App\Models\Projecto;
use App\Models\Tarefa;
use Illuminate\Database\Eloquent\Model;

class TarefaPolicy extends ProjectoAwarePolicy
{
    /**
     * A tarefa chega ao projecto pela actividade a que pertence.
     */
    protected function resolveProjecto(Model $model): ?Projecto
    {
        return $model instanceof Tarefa ? $model->actividade?->projecto : null;
    }
}

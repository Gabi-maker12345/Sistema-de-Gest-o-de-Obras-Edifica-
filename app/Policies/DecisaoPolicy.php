<?php

namespace App\Policies;

use App\Models\Decisao;
use App\Models\Projecto;
use Illuminate\Database\Eloquent\Model;

class DecisaoPolicy extends ProjectoAwarePolicy
{
    protected function resolveProjecto(Model $model): ?Projecto
    {
        return $model instanceof Decisao ? $model->projecto : null;
    }
}

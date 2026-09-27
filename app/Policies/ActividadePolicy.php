<?php

namespace App\Policies;

use App\Models\Actividade;
use App\Models\Projecto;
use Illuminate\Database\Eloquent\Model;

class ActividadePolicy extends ProjectoAwarePolicy
{
    protected function resolveProjecto(Model $model): ?Projecto
    {
        return $model instanceof Actividade ? $model->projecto : null;
    }
}

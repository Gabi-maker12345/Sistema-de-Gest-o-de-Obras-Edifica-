<?php

namespace App\Policies;

use App\Models\DiarioObra;
use App\Models\Projecto;
use Illuminate\Database\Eloquent\Model;

class DiarioObraPolicy extends ProjectoAwarePolicy
{
    protected function resolveProjecto(Model $model): ?Projecto
    {
        return $model instanceof DiarioObra ? $model->projecto : null;
    }
}

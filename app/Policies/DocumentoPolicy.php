<?php

namespace App\Policies;

use App\Models\Documento;
use App\Models\Projecto;
use Illuminate\Database\Eloquent\Model;

class DocumentoPolicy extends ProjectoAwarePolicy
{
    protected function resolveProjecto(Model $model): ?Projecto
    {
        return $model instanceof Documento ? $model->projecto : null;
    }
}

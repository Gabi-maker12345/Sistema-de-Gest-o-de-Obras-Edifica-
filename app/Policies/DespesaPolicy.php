<?php

namespace App\Policies;

use App\Models\Despesa;
use App\Models\Projecto;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class DespesaPolicy extends ProjectoAwarePolicy
{
    /**
     * Uma despesa sem projecto fica negada: sem contexto não há autorização.
     */
    protected function resolveProjecto(Model $model): ?Projecto
    {
        return $model instanceof Despesa ? $model->projecto : null;
    }

    /**
     * Acesso ao valor da despesa.
     */
    public function verValores(User $user, Model $model): bool
    {
        return $this->podeVerFinanceiro($user, $model);
    }
}

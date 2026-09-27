<?php

namespace App\Policies;

use App\Models\Projecto;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ProjectoPolicy extends ProjectoAwarePolicy
{
    protected function resolveProjecto(Model $model): ?Projecto
    {
        return $model instanceof Projecto ? $model : null;
    }

    /**
     * Acesso aos valores do contrato e orçamentos.
     */
    public function verValores(User $user, Projecto $projecto): bool
    {
        if ($user->temAcessoTotal()) {
            return true;
        }

        return $user->podeVerFinanceiroEm($projecto);
    }
}

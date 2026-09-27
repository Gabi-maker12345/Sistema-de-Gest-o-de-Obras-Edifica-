<?php

namespace App\Policies;

use App\Models\Pagamento;
use App\Models\Projecto;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class PagamentoPolicy extends ProjectoAwarePolicy
{
    /**
     * O pagamento chega ao projecto pela despesa a que pertence.
     */
    protected function resolveProjecto(Model $model): ?Projecto
    {
        return $model instanceof Pagamento ? $model->despesa?->projecto : null;
    }

    /**
     * Acesso ao valor do pagamento.
     */
    public function verValores(User $user, Model $model): bool
    {
        return $this->podeVerFinanceiro($user, $model);
    }
}

<?php

namespace App\Policies;

use App\Models\Projecto;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Base das policies que autorizam via o papel do utilizador no projecto.
 *
 * O acesso é sempre resolvido a partir do projecto a que o modelo pertence.
 * Quem tem acesso total (Administrador/Proprietário) ignora o papel; nos
 * restantes, o papel na pivot decide. Um modelo sem projecto associado
 * fica sempre negado, porque não há contexto de autorização.
 */
abstract class ProjectoAwarePolicy
{
    /**
     * Projecto a que o modelo pertence, ou null se não tiver.
     */
    abstract protected function resolveProjecto(Model $model): ?Projecto;

    /**
     * A listagem é sempre permitida: o próprio query é filtrado por
     * Projecto::visiveisA(), por isso abortar aqui só esconderia a tela.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Model $model): bool
    {
        return $this->podeVerNoProjecto($user, $model);
    }

    /**
     * O projecto é injectado por route model binding quando existe; sem ele
     * só quem tem acesso total pode criar.
     */
    public function create(User $user, ?Projecto $projecto = null): bool
    {
        if ($user->temAcessoTotal()) {
            return true;
        }

        return $projecto !== null && $user->podeEscreverEm($projecto);
    }

    public function update(User $user, Model $model): bool
    {
        return $this->podeEscreverNoProjecto($user, $model);
    }

    public function delete(User $user, Model $model): bool
    {
        return $user->temAcessoTotal();
    }

    public function restore(User $user, Model $model): bool
    {
        return $user->temAcessoTotal();
    }

    public function forceDelete(User $user, Model $model): bool
    {
        return $user->temAcessoTotal();
    }

    /**
     * Leitura: basta ter algum papel atribuído no projecto.
     */
    protected function podeVerNoProjecto(User $user, Model $model): bool
    {
        if ($user->temAcessoTotal()) {
            return true;
        }

        $projecto = $this->resolveProjecto($model);

        return $projecto !== null && $user->papelEm($projecto) !== null;
    }

    /**
     * Escrita: exige um papel que permita escrever.
     */
    protected function podeEscreverNoProjecto(User $user, Model $model): bool
    {
        if ($user->temAcessoTotal()) {
            return true;
        }

        $projecto = $this->resolveProjecto($model);

        return $projecto !== null && $user->podeEscreverEm($projecto);
    }

    /**
     * Valores financeiros: exige um papel com permissão financeira.
     */
    protected function podeVerFinanceiro(User $user, Model $model): bool
    {
        if ($user->temAcessoTotal()) {
            return true;
        }

        $projecto = $this->resolveProjecto($model);

        return $projecto !== null && $user->podeVerFinanceiroEm($projecto);
    }
}

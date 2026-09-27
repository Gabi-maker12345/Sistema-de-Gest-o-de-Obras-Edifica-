<?php

namespace App\Observers;

use App\Enums\EstadoAprovacao;
use App\Models\Despesa;

class DespesaObserver
{
    /**
     * Recalcula a execução financeira sempre que a aprovação muda.
     *
     * Criação e update usam eventos distintos porque `wasChanged()` só é
     * fiável no update: o Eloquent não popula `changes` numa inserção e
     * `wasRecentlyCreated` mantém-se verdadeiro durante toda a vida da
     * instância, o que contaminaria os updates seguintes.
     */
    public function created(Despesa $despesa): void
    {
        if ($despesa->estado_aprovacao === EstadoAprovacao::Aprovada) {
            $this->recalcularProjeto($despesa);
        }
    }

    public function updated(Despesa $despesa): void
    {
        if ($despesa->wasChanged('estado_aprovacao')) {
            $this->recalcularProjeto($despesa);
        }
    }

    /**
     * Uma despesa soft-deleted deixa de contar para a execução financeira.
     */
    public function deleted(Despesa $despesa): void
    {
        $this->recalcularProjeto($despesa);
    }

    /**
     * Ao restaurar, o valor aprovado volta a contar para a execução financeira.
     */
    public function restored(Despesa $despesa): void
    {
        $this->recalcularProjeto($despesa);
    }

    protected function recalcularProjeto(Despesa $despesa): void
    {
        if ($despesa->projecto_id === null) {
            return;
        }

        $despesa->projecto?->recalcularExecucaoFinanceira();
    }
}

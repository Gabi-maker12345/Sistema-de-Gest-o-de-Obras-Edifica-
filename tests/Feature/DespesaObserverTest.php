<?php

use App\Enums\CategoriaDespesa;
use App\Enums\EstadoAprovacao;
use App\Models\Despesa;
use App\Models\Projecto;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

beforeEach(function () {
    $this->projecto = Projecto::create([
        'nome' => 'Edifício A',
        'valor_contratual' => 100000,
    ]);

    $this->despesa = fn (array $atributos = []) => Despesa::create(array_merge([
        'projecto_id' => $this->projecto->id,
        'categoria' => CategoriaDespesa::Material,
        'valor' => 1000,
        'data' => now(),
    ], $atributos));
});

test('o observer esta registado', function () {
    expect(Despesa::query()->getConnection()
        ->getEventDispatcher()
        ->hasListeners('eloquent.created: '.Despesa::class))->toBeTrue();
});

test('nao recalcula quando a despesa nao tem projecto', function () {
    $semProjecto = Despesa::create([
        'categoria' => CategoriaDespesa::Material,
        'valor' => 5000,
        'data' => now(),
        'estado_aprovacao' => EstadoAprovacao::Aprovada,
    ]);

    expect($semProjecto->projecto_id)->toBeNull();
});

test('recalcula ao criar a despesa ja aprovada', function () {
    ($this->despesa)(['valor' => 30000, 'estado_aprovacao' => EstadoAprovacao::Aprovada]);

    expect($this->projecto->fresh()->execucao_financeira_percentagem)->toEqual('30.00');
});

test('nao recalcula quando a despesa e criada pendente', function () {
    ($this->despesa)(['valor' => 30000]);

    expect($this->projecto->fresh()->execucao_financeira_percentagem)->toEqual('0.00');
});

test('recalcula ao aprovar', function () {
    $despesa = ($this->despesa)(['valor' => 25000]);

    expect($this->projecto->fresh()->execucao_financeira_percentagem)->toEqual('0.00');

    $despesa->update(['estado_aprovacao' => EstadoAprovacao::Aprovada]);

    expect($this->projecto->fresh()->execucao_financeira_percentagem)->toEqual('25.00');
});

test('recalcula ao reprovar', function () {
    $despesa = ($this->despesa)(['valor' => 25000, 'estado_aprovacao' => EstadoAprovacao::Aprovada]);

    expect($this->projecto->fresh()->execucao_financeira_percentagem)->toEqual('25.00');

    $despesa->update(['estado_aprovacao' => EstadoAprovacao::Rejeitada]);

    expect($this->projecto->fresh()->execucao_financeira_percentagem)->toEqual('0.00');
});

test('recalcula em alteracoes sucessivas na mesma instancia', function () {
    $despesa = ($this->despesa)(['valor' => 10000, 'estado_aprovacao' => EstadoAprovacao::Aprovada]);

    expect($this->projecto->fresh()->execucao_financeira_percentagem)->toEqual('10.00');

    $despesa->update(['estado_aprovacao' => EstadoAprovacao::Rejeitada]);
    expect($this->projecto->fresh()->execucao_financeira_percentagem)->toEqual('0.00');

    $despesa->update(['estado_aprovacao' => EstadoAprovacao::Aprovada]);
    expect($this->projecto->fresh()->execucao_financeira_percentagem)->toEqual('10.00');
});

test('recalcula ao apagar e ao restaurar', function () {
    $despesa = ($this->despesa)(['valor' => 40000, 'estado_aprovacao' => EstadoAprovacao::Aprovada]);

    expect($this->projecto->fresh()->execucao_financeira_percentagem)->toEqual('40.00');

    $despesa->delete();
    expect($this->projecto->fresh()->execucao_financeira_percentagem)->toEqual('0.00');

    $despesa->restore();
    expect($this->projecto->fresh()->execucao_financeira_percentagem)->toEqual('40.00');
});

test('soma varias despesas aprovadas', function () {
    ($this->despesa)(['valor' => 30000, 'estado_aprovacao' => EstadoAprovacao::Aprovada]);
    ($this->despesa)(['valor' => 15000, 'estado_aprovacao' => EstadoAprovacao::Aprovada]);
    ($this->despesa)(['valor' => 99000, 'estado_aprovacao' => EstadoAprovacao::Pendente]);

    expect($this->projecto->fresh()->execucao_financeira_percentagem)->toEqual('45.00');
});

test('nao divide por valor contratual ausente ou zero', function () {
    $semValor = Projecto::create(['nome' => 'Sem contrato']);

    Despesa::create([
        'projecto_id' => $semValor->id,
        'categoria' => CategoriaDespesa::Material,
        'valor' => 500,
        'data' => now(),
        'estado_aprovacao' => EstadoAprovacao::Aprovada,
    ]);

    $zero = Projecto::create(['nome' => 'Valor zero', 'valor_contratual' => 0]);

    Despesa::create([
        'projecto_id' => $zero->id,
        'categoria' => CategoriaDespesa::Material,
        'valor' => 500,
        'data' => now(),
        'estado_aprovacao' => EstadoAprovacao::Aprovada,
    ]);

    expect($semValor->fresh()->execucao_financeira_percentagem)->toEqual('0.00')
        ->and($zero->fresh()->execucao_financeira_percentagem)->toEqual('0.00');
});

test('a despesa continua associada ao projecto', function () {
    $despesa = ($this->despesa)(['estado_aprovacao' => EstadoAprovacao::Aprovada]);

    expect($despesa->projecto())->toBeInstanceOf(BelongsTo::class)
        ->and($despesa->projecto->id)->toBe($this->projecto->id);
});

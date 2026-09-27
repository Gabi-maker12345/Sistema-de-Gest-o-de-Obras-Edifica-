<?php

use App\Enums\CategoriaDespesa;
use App\Enums\PapelProjecto;
use App\Enums\PerfilUtilizador;
use App\Models\Actividade;
use App\Models\Decisao;
use App\Models\Despesa;
use App\Models\DiarioObra;
use App\Models\Documento;
use App\Models\Pagamento;
use App\Models\Projecto;
use App\Models\Tarefa;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

beforeEach(function () {
    $this->projecto = Projecto::create([
        'nome' => 'Edifício A',
        'valor_contratual' => 100000,
    ]);

    $this->gestor = User::factory()->create(['perfil' => PerfilUtilizador::Tecnico]);
    $this->fiscal = User::factory()->create(['perfil' => PerfilUtilizador::Tecnico]);
    $this->consulta = User::factory()->create(['perfil' => PerfilUtilizador::Tecnico]);
    $this->semAcesso = User::factory()->create(['perfil' => PerfilUtilizador::Tecnico]);
    $this->admin = User::factory()->create(['perfil' => PerfilUtilizador::Admin]);
    $this->proprietario = User::factory()->create(['perfil' => PerfilUtilizador::Proprietario]);

    $this->projecto->utilizadores()->attach($this->gestor->id, ['papel' => PapelProjecto::Gestor->value]);
    $this->projecto->utilizadores()->attach($this->fiscal->id, ['papel' => PapelProjecto::Fiscal->value]);
    $this->projecto->utilizadores()->attach($this->consulta->id, ['papel' => PapelProjecto::Consulta->value]);
});

test('papel e exposto como enum no pivot', function () {
    $utilizador = $this->projecto->utilizadores()->where('users.id', $this->gestor->id)->first();

    expect($utilizador->pivot->papel)->toBe(PapelProjecto::Gestor);
});

test('papelEm devolve o papel ou null', function () {
    expect($this->gestor->papelEm($this->projecto))->toBe(PapelProjecto::Gestor)
        ->and($this->fiscal->papelEm($this->projecto))->toBe(PapelProjecto::Fiscal)
        ->and($this->semAcesso->papelEm($this->projecto))->toBeNull();
});

test('papelEm funciona com a relacao ja carregada', function () {
    $this->gestor->load('projectosAtribuidos');

    expect($this->gestor->papelEm($this->projecto))->toBe(PapelProjecto::Gestor);
});

test('administrador e proprietario tem acesso total', function () {
    expect($this->admin->temAcessoTotal())->toBeTrue()
        ->and($this->proprietario->temAcessoTotal())->toBeTrue()
        ->and($this->gestor->temAcessoTotal())->toBeFalse();
});

test('isAdministrador distingue o proprietor', function () {
    expect($this->admin->isAdministrador())->toBeTrue()
        ->and($this->proprietario->isAdministrador())->toBeFalse();
});

test('visiveisA filtra pelos projectos atribuidos', function () {
    expect(Projecto::visiveisA($this->gestor)->pluck('id')->all())->toBe([$this->projecto->id])
        ->and(Projecto::visiveisA($this->semAcesso)->count())->toBe(0);
});

test('visiveisA deixa passar quem tem acesso total', function () {
    $outro = Projecto::create(['nome' => 'Edifício B']);

    expect(Projecto::visiveisA($this->admin)->count())->toBe(2)
        ->and(Projecto::visiveisA($this->proprietario)->count())->toBe(2)
        ->and(Projecto::visiveisA($this->gestor)->pluck('id')->all())->toBe([$this->projecto->id])
        ->and($outro->exists)->toBeTrue();
});

test('a policy e descoberta automaticamente para os models criticos', function (string $model) {
    expect(Gate::getPolicyFor($model))->not->toBeNull();
})->with([
    Projecto::class,
    Actividade::class,
    Tarefa::class,
    Documento::class,
    Despesa::class,
    Pagamento::class,
    Decisao::class,
    DiarioObra::class,
]);

test('leitura exige algum papel no projecto', function () {
    expect(Gate::forUser($this->gestor)->allows('view', $this->projecto))->toBeTrue()
        ->and(Gate::forUser($this->consulta)->allows('view', $this->projecto))->toBeTrue()
        ->and(Gate::forUser($this->semAcesso)->denies('view', $this->projecto))->toBeTrue()
        ->and(Gate::forUser($this->proprietario)->allows('view', $this->projecto))->toBeTrue();
});

test('escrita exige papel que possa escrever', function () {
    expect(Gate::forUser($this->gestor)->allows('update', $this->projecto))->toBeTrue()
        ->and(Gate::forUser($this->fiscal)->denies('update', $this->projecto))->toBeTrue()
        ->and(Gate::forUser($this->consulta)->denies('update', $this->projecto))->toBeTrue()
        ->and(Gate::forUser($this->proprietario)->allows('update', $this->projecto))->toBeTrue();
});

test('apagar e restauro sao exclusivos de quem tem acesso total', function () {
    expect(Gate::forUser($this->gestor)->denies('delete', $this->projecto))->toBeTrue()
        ->and(Gate::forUser($this->admin)->allows('delete', $this->projecto))->toBeTrue()
        ->and(Gate::forUser($this->proprietario)->allows('forceDelete', $this->projecto))->toBeTrue();
});

test('valores financeiros exigem papel com permissao financeira', function () {
    expect(Gate::forUser($this->gestor)->allows('verValores', $this->projecto))->toBeTrue()
        ->and(Gate::forUser($this->fiscal)->allows('verValores', $this->projecto))->toBeTrue()
        ->and(Gate::forUser($this->consulta)->denies('verValores', $this->projecto))->toBeTrue()
        ->and(Gate::forUser($this->semAcesso)->denies('verValores', $this->projecto))->toBeTrue();
});

test('a tarefa herda o acesso da sua actividade', function () {
    $actividade = Actividade::create(['projecto_id' => $this->projecto->id, 'nome' => 'Estrutura']);
    $tarefa = Tarefa::create(['actividade_id' => $actividade->id, 'titulo' => 'Cofragem']);

    expect(Gate::forUser($this->gestor)->allows('update', $tarefa))->toBeTrue()
        ->and(Gate::forUser($this->consulta)->denies('update', $tarefa))->toBeTrue()
        ->and(Gate::forUser($this->semAcesso)->denies('view', $tarefa))->toBeTrue();
});

test('uma despesa sem projecto fica negada sem acesso total', function () {
    $orfa = Despesa::create([
        'categoria' => CategoriaDespesa::Material,
        'valor' => 100,
        'data' => now(),
    ]);

    expect(Gate::forUser($this->gestor)->denies('view', $orfa))->toBeTrue()
        ->and(Gate::forUser($this->fiscal)->denies('update', $orfa))->toBeTrue()
        ->and(Gate::forUser($this->proprietario)->allows('view', $orfa))->toBeTrue();
});

test('create sem projecto e negado e so o acesso total passa', function () {
    expect(Gate::forUser($this->gestor)->allows('create', [Projecto::class, $this->projecto]))->toBeTrue()
        ->and(Gate::forUser($this->consulta)->denies('create', [Projecto::class, $this->projecto]))->toBeTrue()
        ->and(Gate::forUser($this->gestor)->denies('create', [Projecto::class]))->toBeTrue()
        ->and(Gate::forUser($this->admin)->allows('create', [Projecto::class]))->toBeTrue();
});

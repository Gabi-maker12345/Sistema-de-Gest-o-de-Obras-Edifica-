<?php

use App\Enums\CategoriaDespesa;
use App\Enums\EstadoAprovacao;
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
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

beforeEach(function () {
    $this->projecto = Projecto::create(['nome' => 'Edifício A', 'valor_contratual' => 100000]);
    $this->user = User::factory()->create(['perfil' => PerfilUtilizador::Admin]);
});

test('a criacao do projecto fica registada', function () {
    expect(Activity::query()
        ->where('subject_type', Projecto::class)
        ->where('subject_id', $this->projecto->getKey())
        ->where('event', 'created')
        ->exists())->toBeTrue();
});

test('guarda o valor anterior e o novo dos atributos', function () {
    $this->projecto->update(['nome' => 'Edifício A alterado']);

    $registo = Activity::query()
        ->where('subject_type', Projecto::class)
        ->where('subject_id', $this->projecto->getKey())
        ->where('event', 'updated')
        ->latest('id')
        ->first();

    expect($registo)->not->toBeNull()
        ->and($registo->log_name)->toBe('projecto')
        ->and($registo->attribute_changes->get('old')['nome'])->toBe('Edifício A')
        ->and($registo->attribute_changes->get('attributes')['nome'])->toBe('Edifício A alterado');
});

test('o projecto audita atributos que a lista anterior nao cobria', function () {
    $gestor = User::factory()->create();

    $this->projecto->update([
        'gestor_id' => $gestor->getKey(),
        'morada' => 'Rua Nova',
    ]);

    $alterados = array_keys(Activity::query()
        ->where('subject_type', Projecto::class)
        ->where('subject_id', $this->projecto->getKey())
        ->where('event', 'updated')
        ->latest('id')
        ->first()
        ->attribute_changes
        ->get('old'));

    expect($alterados)->toContain('gestor_id', 'morada');
});

test('nao gera registo quando nada muda', function () {
    $antes = Activity::query()->count();

    $this->projecto->update(['nome' => 'Edifício A']);

    expect(Activity::query()->count())->toBe($antes);
});

test('os models criticos suportam soft delete', function (string $model) {
    expect(in_array(SoftDeletes::class, class_uses_recursive($model), true))->toBeTrue();
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

test('os models criticos registam auditoria', function (string $model) {
    expect(in_array(LogsActivity::class, class_uses_recursive($model), true))->toBeTrue();
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

test('a despesa aprovada fica auditada com o valor anterior', function () {
    $despesa = Despesa::create([
        'projecto_id' => $this->projecto->getKey(),
        'categoria' => CategoriaDespesa::Material,
        'valor' => 1000,
        'data' => now(),
    ]);

    $despesa->update(['estado_aprovacao' => EstadoAprovacao::Aprovada]);

    expect(Activity::query()
        ->where('subject_type', Despesa::class)
        ->where('subject_id', $despesa->getKey())
        ->exists())->toBeTrue();
});

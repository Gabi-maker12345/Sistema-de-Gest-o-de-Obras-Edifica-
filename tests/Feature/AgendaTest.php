<?php

use App\Enums\TipoEvento;
use App\Models\Actividade;
use App\Models\EventoAgenda;
use App\Models\Projecto;
use App\Models\Tarefa;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->projecto = Projecto::create(['nome' => 'Obra A']);

    $actividade = Actividade::create(['projecto_id' => $this->projecto->getKey(), 'nome' => 'Estrutura']);
    $this->tarefa = Tarefa::create(['actividade_id' => $actividade->getKey(), 'titulo' => 'Cofragem']);
});

test('o evento guarda a tabela correcta', function () {
    $evento = EventoAgenda::create([
        'user_id' => $this->user->getKey(),
        'titulo' => 'Reunião de obra',
        'data_hora_inicio' => now(),
    ]);

    expect($evento->getTable())->toBe('eventos_agenda')
        ->and($evento->exists)->toBeTrue();
});

test('o tipo e um enum com valor por omissao pessoal', function () {
    expect(EventoAgenda::make()->tipo)->toBe(TipoEvento::Pessoal);

    $evento = EventoAgenda::create([
        'user_id' => $this->user->getKey(),
        'titulo' => 'Visita',
        'tipo' => TipoEvento::Obra,
        'data_hora_inicio' => now(),
    ]);

    expect($evento->tipo)->toBe(TipoEvento::Obra);
});

test('as datas e o lembrete sao convertidos', function () {
    $evento = EventoAgenda::create([
        'user_id' => $this->user->getKey(),
        'titulo' => 'Reunião',
        'data_hora_inicio' => '2026-02-01 10:00:00',
        'data_hora_fim' => '2026-02-01 11:30:00',
        'lembrete_minutos_antes' => '15',
    ]);

    expect($evento->data_hora_inicio->toDateTimeString())->toBe('2026-02-01 10:00:00')
        ->and($evento->data_hora_fim->toDateTimeString())->toBe('2026-02-01 11:30:00')
        ->and($evento->lembrete_minutos_antes)->toBe(15);
});

test('o projecto e a tarefa sao opcionais', function () {
    $evento = EventoAgenda::create([
        'user_id' => $this->user->getKey(),
        'titulo' => 'Compromisso pessoal',
        'data_hora_inicio' => now(),
    ]);

    expect($evento->projecto_id)->toBeNull()
        ->and($evento->tarefa_id)->toBeNull()
        ->and($evento->projecto)->toBeNull()
        ->and($evento->tarefa)->toBeNull();
});

test('as relacoescem aos modelos certos', function () {
    $evento = EventoAgenda::create([
        'user_id' => $this->user->getKey(),
        'projecto_id' => $this->projecto->getKey(),
        'tarefa_id' => $this->tarefa->getKey(),
        'titulo' => 'Reunião de obra',
        'data_hora_inicio' => now(),
    ]);

    expect($evento->user())->toBeInstanceOf(BelongsTo::class)
        ->and($evento->user->is($this->user))->toBeTrue()
        ->and($evento->projecto->is($this->projecto))->toBeTrue()
        ->and($evento->tarefa->is($this->tarefa))->toBeTrue();
});

test('o utilizador e o projecto listam os seus eventos', function () {
    EventoAgenda::create(['user_id' => $this->user->getKey(), 'projecto_id' => $this->projecto->getKey(), 'titulo' => 'A', 'data_hora_inicio' => now()]);
    EventoAgenda::create(['user_id' => $this->user->getKey(), 'titulo' => 'B', 'data_hora_inicio' => now()]);

    expect($this->user->eventosAgenda()->count())->toBe(2)
        ->and($this->projecto->eventosAgenda()->count())->toBe(1);
});

test('o scope entre devolve os eventos que sobrepoem a janela', function () {
    EventoAgenda::create(['user_id' => $this->user->getKey(), 'titulo' => 'Sobreposto', 'data_hora_inicio' => now()->addHours(2), 'data_hora_fim' => now()->addHours(3)]);
    EventoAgenda::create(['user_id' => $this->user->getKey(), 'titulo' => 'Aberto', 'data_hora_inicio' => now()->subDays(5)]);
    EventoAgenda::create(['user_id' => $this->user->getKey(), 'titulo' => 'Anterior', 'data_hora_inicio' => now()->subDays(10), 'data_hora_fim' => now()->subDays(9)]);
    EventoAgenda::create(['user_id' => $this->user->getKey(), 'titulo' => 'Seguinte', 'data_hora_inicio' => now()->addDays(10)]);

    $resultado = EventoAgenda::entre(now()->subDay(), now()->addDay())->pluck('titulo')->all();

    expect($resultado)->toBe(['Aberto', 'Sobreposto']);
});

test('o scope entre ordena pelo inicio', function () {
    EventoAgenda::create(['user_id' => $this->user->getKey(), 'titulo' => 'Depois', 'data_hora_inicio' => now()->addHours(3)]);
    EventoAgenda::create(['user_id' => $this->user->getKey(), 'titulo' => 'Antes', 'data_hora_inicio' => now()->addHours(1)]);

    expect(EventoAgenda::entre(now()->subDay(), now()->addDay())->pluck('titulo')->all())
        ->toBe(['Antes', 'Depois']);
});

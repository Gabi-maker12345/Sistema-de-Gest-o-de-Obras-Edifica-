<?php

use App\Enums\EstadoActividade;
use App\Enums\EstadoTarefa;
use App\Models\Actividade;
use App\Models\Projecto;
use App\Models\Tarefa;

beforeEach(function () {
    $this->projecto = Projecto::create(['nome' => 'Obra B', 'valor_contratual' => 1000]);

    $actividade = Actividade::create([
        'projecto_id' => $this->projecto->id,
        'nome' => 'Estrutura',
    ]);
});

test('marca como atrasada a actividade vencida e nao terminada', function () {
    Actividade::create([
        'projecto_id' => $this->projecto->id,
        'nome' => 'Vencida',
        'data_fim_prevista' => now()->subDay(),
    ]);

    $this->artisan('actividades:marcar-atrasadas')->assertSuccessful();

    expect(Actividade::where('nome', 'Vencida')->first()->estado)->toBe(EstadoActividade::Atrasada);
});

test('nao toca em actividades concluidas, futuras ou sem data', function () {
    Actividade::create(['projecto_id' => $this->projecto->id, 'nome' => 'Concluida', 'data_fim_prevista' => now()->subDay(), 'estado' => EstadoActividade::Concluida]);
    Actividade::create(['projecto_id' => $this->projecto->id, 'nome' => 'Futura', 'data_fim_prevista' => now()->addDay()]);
    Actividade::create(['projecto_id' => $this->projecto->id, 'nome' => 'Sem data', 'data_fim_prevista' => null]);

    $this->artisan('actividades:marcar-atrasadas')->assertSuccessful();

    expect(Actividade::where('nome', 'Concluida')->first()->estado)->toBe(EstadoActividade::Concluida)
        ->and(Actividade::where('nome', 'Futura')->first()->estado)->toBe(EstadoActividade::NaoIniciada)
        ->and(Actividade::where('nome', 'Sem data')->first()->estado)->toBe(EstadoActividade::NaoIniciada);
});

test('marca tarefas vencidas incluindo as que estao em curso', function () {
    $actividade = Actividade::where('nome', 'Estrutura')->first();

    Tarefa::create(['actividade_id' => $actividade->id, 'titulo' => 'Vencida', 'prazo' => now()->subDay()]);
    Tarefa::create(['actividade_id' => $actividade->id, 'titulo' => 'Em curso vencida', 'prazo' => now()->subDays(2), 'estado' => EstadoTarefa::EmCurso]);
    Tarefa::create(['actividade_id' => $actividade->id, 'titulo' => 'Concluida', 'prazo' => now()->subDay(), 'estado' => EstadoTarefa::Concluida]);

    $this->artisan('actividades:marcar-atrasadas')->assertSuccessful();

    expect(Tarefa::where('titulo', 'Vencida')->first()->estado)->toBe(EstadoTarefa::Atrasada)
        ->and(Tarefa::where('titulo', 'Em curso vencida')->first()->estado)->toBe(EstadoTarefa::Atrasada)
        ->and(Tarefa::where('titulo', 'Concluida')->first()->estado)->toBe(EstadoTarefa::Concluida);
});

test('recalcula a execucao fisica como media simples', function () {
    // a actividade do beforeEach conta com 0%: (0 + 50 + 100) / 3 = 50
    Actividade::create(['projecto_id' => $this->projecto->id, 'nome' => 'A', 'percentagem_conclusao' => 50, 'data_fim_prevista' => now()->subDay()]);
    Actividade::create(['projecto_id' => $this->projecto->id, 'nome' => 'B', 'percentagem_conclusao' => 100, 'data_fim_prevista' => now()->subDay()]);

    $this->artisan('actividades:marcar-atrasadas')->assertSuccessful();

    expect($this->projecto->fresh()->execucao_fisica_percentagem)->toEqual('50.00');
});

test('nao rebenta sem actividades nem tarefas', function () {
    Projecto::create(['nome' => 'Obra vazia']);

    $this->artisan('actividades:marcar-atrasadas')->assertSuccessful();
});

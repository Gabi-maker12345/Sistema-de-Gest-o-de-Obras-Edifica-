<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia;

/*
| As quatro folhas do site publico abrem a toda a gente; o painel exige sessao
| e abre a folha certa. D5: o painel vive sob /admin e ja nao se chama
| `dashboard`, porque essa rota era do Breeze.
*/

test('as folhas publicas abrem sem sessao', function (string $rota, string $folha) {
    $this->get($rota)
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component($folha));
})->with([
    ['/', 'Inicio'],
    ['/funcionalidades', 'Funcionalidades'],
    ['/sobre', 'Sobre'],
    ['/contacto', 'Contacto'],
]);

test('o painel exige sessao', function () {
    $this->get('/admin/dashboard')->assertRedirect('/login');
});

test('o painel abre a folha do dashboard com sessao', function () {
    $utilizador = User::factory()->create();

    $this->actingAs($utilizador)
        ->get('/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('Admin/Dashboard'));
});

/*
| Os quatro cadastros da fase 3 e o detalhe do projecto. O registo vive em
| memoria no cliente (D1), por isso a rota so precisa de entregar o
| identificador a ficha — o teste fixa que a folha certa e que a prop chega.
*/
test('os cadastros da fase 3 abrem a folha certa', function (string $rota, string $folha) {
    $utilizador = User::factory()->create();

    $this->actingAs($utilizador)
        ->get($rota)
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component($folha));
})->with([
    ['/admin/projectos', 'Admin/Projectos'],
    ['/admin/utilizadores', 'Admin/Utilizadores'],
    ['/admin/areas', 'Admin/Areas'],
    ['/admin/equipas', 'Admin/Equipas'],
]);

test('o detalhe do projecto entrega o identificador a ficha', function () {
    $utilizador = User::factory()->create();

    $this->actingAs($utilizador)
        ->get('/admin/projectos/p42')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Admin/ProjectoDetalhe')
            ->where('id', 'p42'));
});

/*
| A ficha da equipa existe porque os membros vivem nela (spec §303): sao uma
| tabela de juncao com chave composta e nunca um campo do modal da equipa.
*/
test('o detalhe da equipa entrega o identificador a ficha', function () {
    $utilizador = User::factory()->create();

    $this->actingAs($utilizador)
        ->get('/admin/equipas/eq7')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Admin/EquipaDetalhe')
            ->where('id', 'eq7'));
});

/*
| A Agenda e As minhas tarefas (fase 4). Nenhuma das duas recebe prop: os eventos
| e as tarefas vivem no contexto em memoria, e quem os filtra e o utilizador que
| o selector "Ver como" esta a simular — por isso o id nao viaja na rota. O teste
| fixa so que a folha certa abre, que e o que a rota e responsavel por.
*/
test('a agenda e as minhas tarefas abrem a folha certa', function (string $rota, string $folha) {
    $utilizador = User::factory()->create();

    $this->actingAs($utilizador)
        ->get($rota)
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component($folha));
})->with([
    ['/admin/agenda', 'Admin/Agenda'],
    ['/admin/tarefas', 'Admin/MinhasTarefas'],
]);

test('as folhas da fase 4 nao entregam identificador', function (string $rota) {
    $utilizador = User::factory()->create();

    $this->actingAs($utilizador)
        ->get($rota)
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->missing('id'));
})->with(['/admin/agenda', '/admin/tarefas']);

test('a agenda e as minhas tarefas exigem sessao', function (string $rota) {
    $this->get($rota)->assertRedirect('/login');
})->with(['/admin/agenda', '/admin/tarefas']);

/*
| Os quatro modulos de execucao (spec, fase 5). Sao folhas do indice — gavetas
| com tampa, ao lado de Projectos e Equipas — e nao separadores da ficha do
| projecto. O registo que mostram e sempre de uma obra, e por isso a escolha da
| obra vive no estado da folha e nao na rota: a rota diz que modulo se abre, nao
| que registo se esta a ler. Mesmo contrato da Agenda, e mesmo motivo para o
| teste nao esperar identificador.
 */
test('os modulos de execucao abrem a folha certa', function (string $rota, string $folha) {
    $utilizador = User::factory()->create();

    $this->actingAs($utilizador)
        ->get($rota)
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component($folha));
})->with([
    ['/admin/actividades', 'Admin/Actividades'],
    ['/admin/diario', 'Admin/Diario'],
    ['/admin/fotografias', 'Admin/Fotografias'],
    ['/admin/documentos', 'Admin/Documentos'],
]);

test('os modulos de execucao nao entregam identificador', function (string $rota) {
    $utilizador = User::factory()->create();

    $this->actingAs($utilizador)
        ->get($rota)
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->missing('id'));
})->with(['/admin/actividades', '/admin/diario', '/admin/fotografias', '/admin/documentos']);

test('os modulos de execucao exigem sessao', function (string $rota) {
    $this->get($rota)->assertRedirect('/login');
})->with(['/admin/actividades', '/admin/diario', '/admin/fotografias', '/admin/documentos']);

test('os cadastros da fase 3 exigem sessao', function (string $rota) {
    $this->get($rota)->assertRedirect('/login');
})->with([
    '/admin/projectos',
    '/admin/projectos/p1',
    '/admin/utilizadores',
    '/admin/areas',
    '/admin/equipas',
    '/admin/equipas/eq1',
]);

test('a resposta e em portugues de Portugal', function () {
    $this->get('/')->assertOk()->assertSee('lang="pt-PT"', false);
});

/*
| `/login` e `/register` vivem sob o middleware `guest`, que devolve quem ja tem
| sessao a raiz. O site publico nao pode Offers um link de entrada cego para
| la: o `AcoesSessao` troca "Entrar" por "Painel" + "Sair" conforme a sessao,
| e e a prop `auth` que o faz. Estes testes fixam esse contrato dos dois lados.
*/

test('sem sessao, o site publico oferece entrada', function () {
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->where('auth.user', null));
});

test('com sessao, o site publico propaga o utilizador para o layout', function () {
    $utilizador = User::factory()->create(['name' => 'Ana Bengui']);

    $this->actingAs($utilizador)
        ->get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('auth.user.id', $utilizador->id)
            // A tabela `users` é a do Breeze: o campo chama-se `name`, e nao `nome`.
            ->where('auth.user.name', 'Ana Bengui')
            ->where('auth.user.email', $utilizador->email));
});

test('com sessao, /login devolve a raiz em vez de um beco sem saida', function () {
    $utilizador = User::factory()->create();

    $this->actingAs($utilizador)->get('/login')->assertRedirect('/');
});

test('com sessao, /register tambem devolve a raiz', function () {
    $utilizador = User::factory()->create();

    $this->actingAs($utilizador)->get('/register')->assertRedirect('/');
});

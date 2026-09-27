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

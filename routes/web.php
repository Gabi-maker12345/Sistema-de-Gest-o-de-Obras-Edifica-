<?php

use App\Http\Controllers\ContactoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
| Site público (D6): as quatro folhas do rolo, acessíveis a toda a gente,
| incluindo quem ainda não entrou.
*/
Route::get('/', fn () => Inertia::render('Inicio'))->name('inicio');

Route::get('/funcionalidades', fn () => Inertia::render('Funcionalidades'))->name('funcionalidades');

Route::get('/sobre', fn () => Inertia::render('Sobre'))->name('sobre');

Route::get('/contacto', fn () => Inertia::render('Contacto'))->name('contacto');

Route::post('/contacto', [ContactoController::class, 'store'])->name('contacto.store');

require __DIR__.'/auth.php';

/*
| O painel vive sob /admin e exige sessão (D5). Sem middleware `verified`: a
| verificação de e-mail deixou de existir em D6, por isso o painel entra só
| com sessão iniciada.
*/
Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Admin/Dashboard'))
        ->name('dashboard');

    /*
    | Os cadastros base (spec §13, fase 3). As rotas não recebem o registo: a
    | camada de dados vive em memória, no contexto, e o `{projecto}` viaja só
    | como identificador para o separador de folhas escrever a estação activa.
    */
    Route::get('/projectos', fn () => Inertia::render('Admin/Projectos'))
        ->name('projectos');

    /*
     * O detalhe só recebe o identificador: o registo vive no contexto em memória
     * (D1), não no servidor. A página procura-o lá e, se não o encontrar, diz
     * que não existe em vez de mostrar um ecrã meio vazio.
     */
    Route::get('/projectos/{projecto}', fn () => Inertia::render('Admin/ProjectoDetalhe', [
        'id' => request()->route('projecto'),
    ]))->name('projectos.mostrar');

    Route::get('/utilizadores', fn () => Inertia::render('Admin/Utilizadores'))
        ->name('utilizadores');

    Route::get('/areas', fn () => Inertia::render('Admin/Areas'))->name('areas');

    Route::get('/equipas', fn () => Inertia::render('Admin/Equipas'))->name('equipas');

    Route::get('/equipas/{equipa}', fn () => Inertia::render('Admin/EquipaDetalhe', [
        'id' => request()->route('equipa'),
    ]))->name('equipas.mostrar');
});

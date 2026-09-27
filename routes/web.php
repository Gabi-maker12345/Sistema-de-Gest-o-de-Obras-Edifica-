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
});

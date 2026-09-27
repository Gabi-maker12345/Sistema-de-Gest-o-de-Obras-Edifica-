<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;

/*
| Autenticação real do Breeze, reduzida ao mínimo que o SGO usa (D6): criar
| conta, entrar e sair. A recuperação da palavra-passe, a verificação de
| e-mail e a confirmação de palavra-passe saíram do produto.
|
| O login chama-se `login` para o AuthenticatedSessionController, e este é o
| ficheiro que inclui as rotas.
*/
Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});

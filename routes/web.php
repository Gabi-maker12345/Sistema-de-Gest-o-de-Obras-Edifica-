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

    /*
     | Agenda e as minhas tarefas (spec §13, fase 4). O mesmo contrato da fase
     | anterior: as rotas não recebem registo nenhum, porque os eventos e as
     | tarefas vivem no contexto em memória. A folha agregada lê as tarefas do
     | utilizador que o selector "Ver como" está a simular, e por isso também
     | não recebe o id — quem lê é o contexto.
     */
    Route::get('/agenda', fn () => Inertia::render('Admin/Agenda'))->name('agenda');

    Route::get('/tarefas', fn () => Inertia::render('Admin/MinhasTarefas'))->name('tarefas');

    /*
     | Execução (spec §13, fase 5). Estas quatro folhas são módulos do índice —
     | gavetas com tampa, ao lado de Projectos e Equipas — e não separadores da
     | ficha. O registo que mostram é sempre de uma obra, e por isso a escolha
     | da obra vive no estado da folha e não na rota: a rota diz que módulo se
     | abre, não que registo se está a ler. É o mesmo contrato da Agenda.
     */
    Route::get('/actividades', fn () => Inertia::render('Admin/Actividades'))->name('actividades');

    Route::get('/diario', fn () => Inertia::render('Admin/Diario'))->name('diario');

    Route::get('/fotografias', fn () => Inertia::render('Admin/Fotografias'))->name('fotografias');

    Route::get('/documentos', fn () => Inertia::render('Admin/Documentos'))->name('documentos');
});

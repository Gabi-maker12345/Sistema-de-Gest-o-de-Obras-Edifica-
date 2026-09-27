<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactoRequest;
use Illuminate\Http\RedirectResponse;

class ContactoController extends Controller
{
    /**
     * A folha de contacto valida e confirma, e não envia.
     *
     * D1 mantém tudo em memória e sem integrações: não há e-mail nem WhatsApp
     * configurados, por isso o formulário diz ao utilizador que a mensagem foi
     * registada para a demonstração em vez de fingir um envio.
     */
    public function store(StoreContactoRequest $request): RedirectResponse
    {
        return back()
            ->with('contacto', [
                'estado' => 'recebido',
                'nome' => $request->string('nome')->toString(),
            ])
            ->with('contacto_aviso', 'Na demonstração a mensagem é validada mas não é enviada para o exterior.');
    }
}

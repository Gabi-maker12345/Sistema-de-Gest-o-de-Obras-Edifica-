<?php

namespace App\Http\Controllers\Auth;

use App\Enums\PerfilUtilizador;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Registar');
    }

    /**
     * Handle an incoming registration request.
     *
     * O `perfil` não vem do formulário: uma conta criada publicamente começa
     * como Técnico e quem a promove a Gestor ou Administrador é a aba
     * Utilizadores, dentro do painel. O `telefone` é opcional porque quem
     * trabalha no terreno regista Diário de obra e Fotografias pelo telemóvel.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'telefone' => ['nullable', 'string', 'max:32'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'telefone' => $validated['telefone'] ?? null,
            'password' => $validated['password'],
            'perfil' => PerfilUtilizador::Tecnico,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('admin.dashboard', absolute: false));
    }
}

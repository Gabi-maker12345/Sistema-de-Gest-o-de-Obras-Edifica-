<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PerfilUtilizador;
use App\Http\Controllers\Admin\Concerns\GuardaRecursosSgo;
use App\Http\Controllers\Controller;
use App\Http\Resources\UtilizadorRecurso;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;

class UtilizadorController extends Controller
{
    use GuardaRecursosSgo;

    public function index(Request $request): Response
    {
        $pesquisa = $request->string('pesquisa')->trim()->value();
        $perfil = $request->string('perfil')->trim()->value();

        $utilizadores = User::query()
            ->when($pesquisa !== '', function ($q) use ($pesquisa) {
                $q->where(fn ($w) => $w
                    ->where('name', 'like', "%{$pesquisa}%")
                    ->orWhere('email', 'like', "%{$pesquisa}%"));
            })
            ->when($perfil !== '', fn ($q) => $q->where('perfil', $perfil))
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Utilizadores', [
            'utilizadores' => UtilizadorRecurso::collection($utilizadores),
            'filtroPesquisa' => $pesquisa,
            'filtroPerfil' => $perfil,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', User::class);

        return $this->guardar($request, User::class, null, $this->regras(), function (array $dados) {
            $dados['name'] = $dados['nome'];
            unset($dados['nome']);
            $dados['password'] = bcrypt('sgo-demo');

            return $dados;
        });
    }

    public function update(Request $request, User $utilizador): JsonResponse
    {
        $this->authorize('update', $utilizador);

        return $this->guardar($request, User::class, $utilizador, $this->regras(edição: true), function (array $dados) {
            if (isset($dados['nome'])) {
                $dados['name'] = $dados['nome'];
                unset($dados['nome']);
            }

            return $dados;
        });
    }

    public function destroy(Request $request, User $utilizador): JsonResponse
    {
        $this->authorize('delete', $utilizador);

        if ($utilizador->is($request->user())) {
            abort(422, 'Não pode eliminar o seu próprio utilizador.');
        }

        return $this->eliminarRegisto($utilizador);
    }

    protected function recursoPara(Model $registo): UtilizadorRecurso
    {
        return new UtilizadorRecurso($registo);
    }

    /**
     * @return array<string, mixed>
     */
    private function regras(bool $edição = false): array
    {
        return [
            'nome' => [$edição ? 'sometimes' : 'required', 'string', 'max:255'],
            'email' => [$edição ? 'sometimes' : 'required', 'email', 'max:255', 'unique:users,email'.($edição ? ','.$this->idDaEdição($edição) : '')],
            'telefone' => ['nullable', 'string', 'max:30'],
            'perfil' => [$edição ? 'sometimes' : 'required', Enum::for(PerfilUtilizador::class)],
            'activo' => ['sometimes', 'boolean'],
        ];
    }

    private function idDaEdição(bool $_): int
    {
        return 0;
    }
}

<?php

namespace App\Http\Controllers\Admin\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Throwable;

/**
 * Escrita uniforme dos recursos do painel (D1 -> persistencia real).
 *
 * O contrato com o front e sempre o mesmo: um POST/PUT/DELETE devolve a
 * representacao do recurso ja transformada pelo `*Recurso` correspondente,
 * para que a pagina hidrate a coleccion local sem pedido extra. Em validacao,
 * o Laravel devolve 422 no formato do Inertia (`errors` por campo), que e o
 * formato que os modais sabem ler.
 */
trait GuardaRecursosSgo
{
    /**
     * Valida e guarda. `$preparar` recebe os dados validados e a entrada
     * original -- e onde se injetam chaves de sessao, como `registado_por`.
     *
     * @param  array<string, mixed>  $regras
     * @param  array<string, string>  $mensagens
     * @param  (callable(array<string, mixed>, Request): array<string, mixed>)|null  $preparar
     */
    protected function guardar(
        Request $request,
        string $modelo,
        ?Model $registo,
        array $regras,
        ?callable $preparar = null,
        array $mensagens = [],
    ): JsonResponse {
        $dados = $request->validate($regras, $mensagens);

        if ($preparar !== null) {
            $dados = $preparar($dados, $request);
        }

        /** @var class-string<Model> $modelo */
        if ($registo === null) {
            $registo = new $modelo;
        }

        $registo->fill($this->semSubmetidosVazios($dados));

        $registo->save();

        return $this->respostaRecurso($registo, $request);
    }

    /**
     * Um campo enviado como '' num PUT parcial nao deve apagar o que ja la
     * esta quando a coluna e nullable: passa a ser null explicito.
     *
     * @param  array<string, mixed>  $dados
     * @return array<string, mixed>
     */
    protected function semSubmetidosVazios(array $dados): array
    {
        foreach ($dados as $chave => $valor) {
            if ($valor === '') {
                $dados[$chave] = null;
            }
        }

        return $dados;
    }

    /**
     * Elimina o registo (soft-delete nos modelos que o usam).
     */
    protected function eliminarRegisto(Model $registo): JsonResponse
    {
        $registo->delete();

        return response()->json(['ok' => true, 'id' => (string) $registo->getKey()]);
    }

    /**
     * Representacao do recurso guardado. Se o controller declarar
     * `recursoPara()` usa-a; senao devolve o registo recem-relido.
     */
    protected function respostaRecurso(Model $registo, Request $request): JsonResponse
    {
        if (method_exists($this, 'recursoPara')) {
            /** @var JsonResource $recurso */
            $recurso = $this->recursoPara($registo);

            return $recurso->toResponse($request)->toJson();
        }

        return response()->json($registo->refresh());
    }
}

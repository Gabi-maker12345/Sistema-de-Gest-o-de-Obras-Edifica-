<?php

namespace App\Http\Resources;

use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Envelope de paginação lido pelo front como `{ dados, total }`.
 *
 * O contentor `data` do JsonResource é desembrulhado na serialização para que
 * a folha receba a lista directamente na prop.
 */
class PaginadoRecurso extends JsonResource
{
    /**
     * @return array{dados: array<int, mixed>, total: int}
     */
    public function toArray(Request $request): array
    {
        /** @var Paginator $paginas */
        $paginas = $this->resource;

        return [
            'dados' => $this->value ?: $paginas->items(),
            'total' => $paginas->total(),
        ];
    }
}

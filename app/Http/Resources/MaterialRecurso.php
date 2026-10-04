<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaterialRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'nome' => $this->nome,
            'categoria' => $this->categoria ?? '',
            'unidadeMedida' => $this->unidade_medida,
            'precoReferencia' => $this->preco_referencia === null ? null : (float) $this->preco_referencia,
        ];
    }
}

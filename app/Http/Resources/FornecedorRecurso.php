<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FornecedorRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'nome' => $this->nome,
            'nif' => $this->nif ?? '',
            'morada' => $this->morada ?? '',
            'contacto' => $this->contacto ?? '',
            'especialidade' => $this->especialidade ?? '',
            'avaliacao' => $this->avaliacao === null ? null : (float) $this->avaliacao,
        ];
    }
}

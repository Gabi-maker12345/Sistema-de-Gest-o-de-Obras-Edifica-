<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentoRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'projectoId' => $this->projecto_id === null ? null : (string) $this->projecto_id,
            'tipoDocumento' => $this->tipo_documento?->value,
            'nomeFicheiro' => $this->nome_ficheiro,
            'versao' => (int) $this->versao,
            'tamanho' => $this->tamanho ?? '',
            'uploadPor' => $this->upload_por === null ? null : (string) $this->upload_por,
            'criadoEm' => $this->created_at?->format('Y-m-d'),
            'documentavelType' => $this->documentavel_type,
            'documentavelId' => $this->documentavel_id === null ? null : (string) $this->documentavel_id,
        ];
    }
}

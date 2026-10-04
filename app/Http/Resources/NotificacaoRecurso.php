<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Notificação do Laravel (`notifications`) no formato do sino do front.
 */
class NotificacaoRecurso extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $dados = $this->data ?? [];

        return [
            'id' => $this->id,
            'tipo' => $dados['tipo'] ?? 'informativa',
            'titulo' => $dados['titulo'] ?? '',
            'corpo' => $dados['corpo'] ?? '',
            'criadoEm' => $this->created_at?->format('Y-m-d\TH:i:00'),
            'lida' => $this->read_at !== null,
            'ligacao' => $dados['ligacao'] ?? null,
        ];
    }
}

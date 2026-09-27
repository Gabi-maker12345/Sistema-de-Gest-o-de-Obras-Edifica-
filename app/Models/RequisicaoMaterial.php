<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'projecto_id',
    'tarefa_id',
    'material_id',
    'quantidade',
    'data',
    'preco_unitario',
])]
#[Table('requisicoes_materiais')]
class RequisicaoMaterial extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantidade' => 'decimal:2',
            'data' => 'date',
            'preco_unitario' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Projecto, $this>
     */
    public function projecto(): BelongsTo
    {
        return $this->belongsTo(Projecto::class);
    }

    /**
     * @return BelongsTo<Tarefa, $this>
     */
    public function tarefa(): BelongsTo
    {
        return $this->belongsTo(Tarefa::class);
    }

    /**
     * @return BelongsTo<Material, $this>
     */
    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }
}

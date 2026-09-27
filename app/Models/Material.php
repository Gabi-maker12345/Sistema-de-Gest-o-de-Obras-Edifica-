<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nome', 'categoria', 'unidade_medida', 'preco_referencia'])]
#[Table('materiais')]
class Material extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'preco_referencia' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsToMany<Fornecedor, $this>
     */
    public function fornecedores(): BelongsToMany
    {
        return $this->belongsToMany(Fornecedor::class, 'fornecedor_materiais')
            ->withPivot('preco', 'prazo_entrega_dias');
    }

    /**
     * @return HasMany<RequisicaoMaterial, $this>
     */
    public function requisicoesMateriais(): HasMany
    {
        return $this->hasMany(RequisicaoMaterial::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nome', 'nif', 'morada', 'contacto', 'especialidade', 'avaliacao'])]
#[Table('fornecedores')]
class Fornecedor extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'avaliacao' => 'decimal:2',
        ];
    }

    /**
     * @return HasMany<Despesa, $this>
     */
    public function despesas(): HasMany
    {
        return $this->hasMany(Despesa::class);
    }

    /**
     * @return BelongsToMany<Material, $this>
     */
    public function materiais(): BelongsToMany
    {
        return $this->belongsToMany(Material::class, 'fornecedor_materiais')
            ->withPivot('preco', 'prazo_entrega_dias');
    }
}

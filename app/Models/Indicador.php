<?php

namespace App\Models;

use App\Enums\TipoIndicador;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['projecto_id', 'nome_indicador', 'valor', 'unidade', 'meta', 'tipo', 'data_referencia'])]
#[Table('indicadores')]
class Indicador extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'valor' => 'decimal:2',
            'meta' => 'decimal:2',
            'tipo' => TipoIndicador::class,
            'data_referencia' => 'date',
        ];
    }

    /**
     * @return BelongsTo<Projecto, $this>
     */
    public function projecto(): BelongsTo
    {
        return $this->belongsTo(Projecto::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['projecto_id', 'diario_id', 'tarefa_id', 'url', 'descricao', 'data_captura', 'latitude', 'longitude', 'tirada_por'])]
class Fotografia extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'data_captura' => 'datetime',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
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
     * @return BelongsTo<DiarioObra, $this>
     */
    public function diario(): BelongsTo
    {
        return $this->belongsTo(DiarioObra::class, 'diario_id');
    }

    /**
     * @return BelongsTo<Tarefa, $this>
     */
    public function tarefa(): BelongsTo
    {
        return $this->belongsTo(Tarefa::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function tiradaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tirada_por');
    }
}

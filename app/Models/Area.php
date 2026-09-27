<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['responsavel_id', 'nome', 'descricao'])]
class Area extends Model
{
    use HasFactory;

    /**
     * @return BelongsTo<User, $this>
     */
    public function responsavel(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsavel_id');
    }

    /**
     * @return HasMany<Projecto, $this>
     */
    public function projectos(): HasMany
    {
        return $this->hasMany(Projecto::class);
    }
}

<?php

namespace App\Models;

use App\Enums\TipoReuniao;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['projecto_id', 'titulo', 'tipo', 'data_hora', 'local', 'convocado_por', 'acta'])]
#[Table('reunioes')]
class Reuniao extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tipo' => TipoReuniao::class,
            'data_hora' => 'datetime',
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
     * @return BelongsTo<User, $this>
     */
    public function convocadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'convocado_por');
    }

    /**
     * @return BelongsToMany<User, $this>
     */
    public function participantes(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'reuniao_participantes')
            ->withPivot('presenca', 'papel');
    }

    /**
     * @return HasMany<Decisao, $this>
     */
    public function decisoes(): HasMany
    {
        return $this->hasMany(Decisao::class);
    }
}

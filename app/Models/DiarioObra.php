<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Fillable([
    'projecto_id',
    'data',
    'condicoes_meteorologicas',
    'efectivo_presente',
    'actividades_realizadas',
    'ocorrencias',
    'registado_por',
])]
#[Table('diario_obra')]
class DiarioObra extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('diario_obra')
            ->logOnlyDirty()
            ->logAll();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'data' => 'date',
            'efectivo_presente' => 'integer',
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
    public function registadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registado_por');
    }

    /**
     * @return HasMany<Fotografia, $this>
     */
    public function fotografias(): HasMany
    {
        return $this->hasMany(Fotografia::class, 'diario_id');
    }
}

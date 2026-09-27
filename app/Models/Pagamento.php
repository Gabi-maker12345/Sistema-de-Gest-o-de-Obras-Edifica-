<?php

namespace App\Models;

use App\Enums\EstadoPagamento;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Fillable([
    'despesa_id',
    'valor',
    'data_pagamento',
    'metodo_pagamento',
    'referencia',
    'estado',
    'aprovado_por',
])]
class Pagamento extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'estado' => EstadoPagamento::Pendente,
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('pagamento')
            ->logOnlyDirty()
            ->logAll();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'valor' => 'decimal:2',
            'data_pagamento' => 'date',
            'estado' => EstadoPagamento::class,
        ];
    }

    /**
     * @return BelongsTo<Despesa, $this>
     */
    public function despesa(): BelongsTo
    {
        return $this->belongsTo(Despesa::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function aprovadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'aprovado_por');
    }
}

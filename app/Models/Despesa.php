<?php

namespace App\Models;

use App\Enums\CategoriaDespesa;
use App\Enums\EstadoAprovacao;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Fillable([
    'projecto_id',
    'fornecedor_id',
    'documento_id',
    'categoria',
    'descricao',
    'valor',
    'data',
    'estado_aprovacao',
    'registado_por',
])]
class Despesa extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'estado_aprovacao' => EstadoAprovacao::Pendente,
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('despesa')
            ->logOnlyDirty()
            ->logAll();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'categoria' => CategoriaDespesa::class,
            'valor' => 'decimal:2',
            'data' => 'date',
            'estado_aprovacao' => EstadoAprovacao::class,
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
     * @return BelongsTo<Fornecedor, $this>
     */
    public function fornecedor(): BelongsTo
    {
        return $this->belongsTo(Fornecedor::class);
    }

    /**
     * @return BelongsTo<Documento, $this>
     */
    public function documento(): BelongsTo
    {
        return $this->belongsTo(Documento::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function registadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registado_por');
    }

    /**
     * @return HasMany<Pagamento, $this>
     */
    public function pagamentos(): HasMany
    {
        return $this->hasMany(Pagamento::class);
    }
}

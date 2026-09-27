<?php

namespace App\Models;

use App\Enums\EstadoDecisao;
use App\Enums\ImpactoDecisao;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Fillable([
    'reuniao_id',
    'projecto_id',
    'descricao',
    'responsavel_id',
    'estado',
    'impacto',
    'prazo_implementacao',
])]
#[Table('decisoes')]
class Decisao extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'estado' => EstadoDecisao::Pendente,
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('decisao')
            ->logOnlyDirty()
            ->logAll();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'estado' => EstadoDecisao::class,
            'impacto' => ImpactoDecisao::class,
            'prazo_implementacao' => 'date',
        ];
    }

    /**
     * @return BelongsTo<Reuniao, $this>
     */
    public function reuniao(): BelongsTo
    {
        return $this->belongsTo(Reuniao::class);
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
    public function responsavel(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsavel_id');
    }
}

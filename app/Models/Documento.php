<?php

namespace App\Models;

use App\Enums\TipoDocumento;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Fillable([
    'projecto_id',
    'documentavel_id',
    'documentavel_type',
    'nome_ficheiro',
    'caminho',
    'tipo_documento',
    'versao',
    'upload_por',
])]
class Documento extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'versao' => 1,
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('documento')
            ->logOnlyDirty()
            ->logAll();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tipo_documento' => TipoDocumento::class,
            'versao' => 'integer',
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
    public function uploadPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'upload_por');
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function documentavel(): MorphTo
    {
        return $this->morphTo();
    }
}

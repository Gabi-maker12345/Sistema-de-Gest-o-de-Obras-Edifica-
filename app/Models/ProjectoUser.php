<?php

namespace App\Models;

use App\Enums\PapelProjecto;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * Pivot da atribuição de um utilizador a um projecto.
 *
 * Existe para que `papel` seja exposto como PapelProjecto em vez de string.
 */
class ProjectoUser extends Pivot
{
    /**
     * @var string
     */
    protected $table = 'projecto_user';

    /**
     * @var bool
     */
    public $incrementing = false;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'papel' => PapelProjecto::class,
        ];
    }
}

<?php

namespace App\Models;

use App\Enums\PapelProjecto;
use App\Enums\PerfilUtilizador;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'telefone', 'perfil', 'ativo'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'ativo' => true,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'perfil' => PerfilUtilizador::class,
            'ativo' => 'boolean',
        ];
    }

    /**
     * Perfis com acesso total, que bypassam qualquer verificação de papel.
     */
    public function temAcessoTotal(): bool
    {
        return $this->perfil?->temAcessoTotal() ?? false;
    }

    /**
     * Apenas o perfil Administrador, sem o Proprietário.
     */
    public function isAdministrador(): bool
    {
        return $this->perfil === PerfilUtilizador::Admin;
    }

    /**
     * Papel do utilizador num projecto específico, ou null se não tiver acesso.
     */
    public function papelEm(Projecto $projecto): ?PapelProjecto
    {
        if ($this->relationLoaded('projectosAtribuidos')) {
            $papel = $this->projectosAtribuidos
                ->firstWhere('projectos.id', $projecto->getKey())
                ?->pivot
                ?->papel;

            if ($papel instanceof PapelProjecto) {
                return $papel;
            }
        }

        $valor = $this->projectosAtribuidos()
            ->where('projectos.id', $projecto->getKey())
            ->value('projecto_user.papel');

        return $valor === null ? null : PapelProjecto::from($valor);
    }

    /**
     * Determina se o utilizador pode escrever no projecto dado.
     *
     * Administradores passam sempre; nos restantes, decide o papel na pivot.
     */
    public function podeEscreverEm(Projecto $projecto): bool
    {
        if ($this->temAcessoTotal()) {
            return true;
        }

        return $this->papelEm($projecto)?->podeEscrever() ?? false;
    }

    /**
     * Determina se o utilizador pode ver os valores financeiros do projecto.
     */
    public function podeVerFinanceiroEm(Projecto $projecto): bool
    {
        if ($this->temAcessoTotal()) {
            return true;
        }

        return $this->papelEm($projecto)?->podeVerFinanceiro() ?? false;
    }

    /**
     * @return HasMany<Area, $this>
     */
    public function areas(): HasMany
    {
        return $this->hasMany(Area::class, 'responsavel_id');
    }

    /**
     * @return HasMany<Projecto, $this>
     */
    public function projectos(): HasMany
    {
        return $this->hasMany(Projecto::class, 'gestor_id');
    }

    /**
     * @return BelongsToMany<Projecto, $this>
     */
    public function projectosAtribuidos(): BelongsToMany
    {
        return $this->belongsToMany(Projecto::class, 'projecto_user')
            ->using(ProjectoUser::class)
            ->withPivot('papel');
    }

    /**
     * @return HasMany<Tarefa, $this>
     */
    public function tarefas(): HasMany
    {
        return $this->hasMany(Tarefa::class, 'responsavel_id');
    }

    /**
     * @return BelongsToMany<Equipa, $this>
     */
    public function equipas(): BelongsToMany
    {
        return $this->belongsToMany(Equipa::class, 'equipa_membros')
            ->withPivot('funcao', 'data_entrada', 'data_saida');
    }

    /**
     * @return BelongsToMany<Reuniao, $this>
     */
    public function reunioes(): BelongsToMany
    {
        return $this->belongsToMany(Reuniao::class, 'reuniao_participantes')
            ->withPivot('presenca', 'papel');
    }

    /**
     * @return HasMany<EventoAgenda, $this>
     */
    public function eventosAgenda(): HasMany
    {
        return $this->hasMany(EventoAgenda::class);
    }

    /**
     * @return HasMany<Decisao, $this>
     */
    public function decisoes(): HasMany
    {
        return $this->hasMany(Decisao::class, 'responsavel_id');
    }

    /**
     * @return HasMany<Documento, $this>
     */
    public function documentos(): HasMany
    {
        return $this->hasMany(Documento::class, 'upload_por');
    }

    /**
     * @return HasMany<Fotografia, $this>
     */
    public function fotografias(): HasMany
    {
        return $this->hasMany(Fotografia::class, 'tirada_por');
    }

    /**
     * @return HasMany<DiarioObra, $this>
     */
    public function diariosObra(): HasMany
    {
        return $this->hasMany(DiarioObra::class, 'registado_por');
    }
}

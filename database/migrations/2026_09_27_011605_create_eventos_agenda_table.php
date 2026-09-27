<?php

use App\Enums\TipoEvento;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('eventos_agenda', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('projecto_id')->nullable()->constrained('projectos')->nullOnDelete();
            $table->foreignId('tarefa_id')->nullable()->constrained('tarefas')->nullOnDelete();
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->string('tipo')->default(TipoEvento::Pessoal->value);
            $table->dateTime('data_hora_inicio');
            $table->dateTime('data_hora_fim')->nullable();
            $table->string('local')->nullable();
            $table->unsignedInteger('lembrete_minutos_antes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'data_hora_inicio']);
            $table->index('data_hora_inicio');
            $table->index('tipo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eventos_agenda');
    }
};

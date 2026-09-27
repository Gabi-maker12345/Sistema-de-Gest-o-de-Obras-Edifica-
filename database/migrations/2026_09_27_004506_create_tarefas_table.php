<?php

use App\Enums\EstadoTarefa;
use App\Enums\PrioridadeTarefa;
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
        Schema::create('tarefas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actividade_id')->constrained('actividades')->cascadeOnDelete();
            $table->foreignId('responsavel_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('equipa_id')->nullable()->constrained('equipas')->nullOnDelete();
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->date('data_inicio')->nullable();
            $table->date('prazo')->nullable();
            $table->date('data_conclusao')->nullable();
            $table->string('prioridade')->default(PrioridadeTarefa::Media->value);
            $table->string('estado')->default(EstadoTarefa::Pendente->value);
            $table->unsignedTinyInteger('percentagem_conclusao')->default(0);
            $table->decimal('horas_estimadas', 6, 2)->nullable();
            $table->decimal('horas_reais', 6, 2)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['actividade_id', 'estado']);
            $table->index(['responsavel_id', 'estado']);
            $table->index('prazo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tarefas');
    }
};

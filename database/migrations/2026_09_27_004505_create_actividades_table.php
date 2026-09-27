<?php

use App\Enums\EstadoActividade;
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
        Schema::create('actividades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projecto_id')->constrained('projectos')->cascadeOnDelete();
            $table->foreignId('actividade_pai_id')->nullable()->constrained('actividades')->nullOnDelete();
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->date('data_inicio_prevista')->nullable();
            $table->date('data_fim_prevista')->nullable();
            $table->date('data_inicio_real')->nullable();
            $table->date('data_fim_real')->nullable();
            $table->unsignedTinyInteger('percentagem_conclusao')->default(0);
            $table->string('estado')->default(EstadoActividade::NaoIniciada->value);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['projecto_id', 'estado']);
            $table->index('data_inicio_prevista');
            $table->index('data_fim_prevista');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('actividades');
    }
};

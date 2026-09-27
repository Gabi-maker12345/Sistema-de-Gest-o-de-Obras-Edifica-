<?php

use App\Enums\EstadoGeralProjecto;
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
        Schema::create('projectos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('area_id')->nullable()->constrained('areas')->nullOnDelete();
            $table->foreignId('gestor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('nome');
            $table->string('cliente')->nullable();
            $table->string('morada')->nullable();
            $table->date('data_inicio')->nullable();
            $table->date('data_fim_prevista')->nullable();
            $table->date('data_fim_real')->nullable();
            $table->decimal('valor_contratual', 14, 2)->nullable();
            $table->decimal('orcamento_previsto', 12, 2)->nullable();
            $table->decimal('orcamento_actual', 12, 2)->nullable();
            $table->string('estado_geral')->default(EstadoGeralProjecto::Planeamento->value);
            $table->decimal('execucao_fisica_percentagem', 5, 2)->nullable()->default(0);
            $table->decimal('execucao_financeira_percentagem', 5, 2)->nullable()->default(0);
            $table->boolean('encerramento_administrativo')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['area_id', 'estado_geral']);
            $table->index('data_inicio');
            $table->index('data_fim_prevista');
            $table->index('encerramento_administrativo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projectos');
    }
};

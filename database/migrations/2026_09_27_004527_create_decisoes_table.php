<?php

use App\Enums\EstadoDecisao;
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
        Schema::create('decisoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reuniao_id')->nullable()->constrained('reunioes')->nullOnDelete();
            $table->foreignId('projecto_id')->constrained('projectos')->cascadeOnDelete();
            $table->text('descricao');
            $table->foreignId('responsavel_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('estado')->default(EstadoDecisao::Pendente->value);
            $table->string('impacto')->nullable();
            $table->date('prazo_implementacao')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['projecto_id', 'estado']);
            $table->index('prazo_implementacao');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('decisoes');
    }
};

<?php

use App\Enums\EstadoAprovacao;
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
        Schema::create('despesas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projecto_id')->nullable()->constrained('projectos')->nullOnDelete();
            $table->foreignId('fornecedor_id')->nullable()->constrained('fornecedores')->nullOnDelete();
            $table->foreignId('documento_id')->nullable()->constrained('documentos')->nullOnDelete();
            $table->string('categoria');
            $table->string('descricao')->nullable();
            $table->decimal('valor', 12, 2);
            $table->date('data');
            $table->string('estado_aprovacao')->default(EstadoAprovacao::Pendente->value);
            $table->foreignId('registado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['projecto_id', 'estado_aprovacao']);
            $table->index('data');
            $table->index(['categoria', 'data']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('despesas');
    }
};

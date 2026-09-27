<?php

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
        Schema::create('requisicoes_materiais', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projecto_id')->constrained('projectos')->cascadeOnDelete();
            $table->foreignId('tarefa_id')->nullable()->constrained('tarefas')->nullOnDelete();
            $table->foreignId('material_id')->constrained('materiais')->cascadeOnDelete();
            $table->decimal('quantidade', 10, 2);
            $table->date('data');
            $table->decimal('preco_unitario', 10, 2)->nullable();
            $table->timestamps();

            $table->index(['projecto_id', 'data']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requisicoes_materiais');
    }
};

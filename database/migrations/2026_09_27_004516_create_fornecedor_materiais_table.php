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
        Schema::create('fornecedor_materiais', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fornecedor_id')->constrained('fornecedores')->cascadeOnDelete();
            $table->foreignId('material_id')->constrained('materiais')->cascadeOnDelete();
            $table->decimal('preco', 10, 2)->nullable();
            $table->unsignedInteger('prazo_entrega_dias')->nullable();
            $table->timestamps();

            $table->unique(['fornecedor_id', 'material_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fornecedor_materiais');
    }
};

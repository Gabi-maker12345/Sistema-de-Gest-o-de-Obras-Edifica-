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
        Schema::create('indicadores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projecto_id')->constrained('projectos')->cascadeOnDelete();
            $table->string('nome_indicador');
            $table->decimal('valor', 12, 2);
            $table->string('unidade')->nullable();
            $table->decimal('meta', 12, 2)->nullable();
            $table->string('tipo')->nullable();
            $table->date('data_referencia');
            $table->timestamps();

            $table->index(['projecto_id', 'nome_indicador', 'data_referencia']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('indicadores');
    }
};

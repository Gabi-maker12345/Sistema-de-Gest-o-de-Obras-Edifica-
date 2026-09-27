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
        Schema::create('diario_obra', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projecto_id')->constrained('projectos')->cascadeOnDelete();
            $table->date('data');
            $table->string('condicoes_meteorologicas')->nullable();
            $table->unsignedInteger('efectivo_presente')->nullable();
            $table->text('actividades_realizadas')->nullable();
            $table->text('ocorrencias')->nullable();
            $table->foreignId('registado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['projecto_id', 'data']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diario_obra');
    }
};

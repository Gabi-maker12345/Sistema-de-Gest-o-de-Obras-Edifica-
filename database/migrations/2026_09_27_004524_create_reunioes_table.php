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
        Schema::create('reunioes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projecto_id')->constrained('projectos')->cascadeOnDelete();
            $table->string('titulo');
            $table->string('tipo');
            $table->dateTime('data_hora');
            $table->string('local')->nullable();
            $table->foreignId('convocado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->text('acta')->nullable();
            $table->timestamps();

            $table->index(['projecto_id', 'data_hora']);
            $table->index('data_hora');
            $table->index('tipo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reunioes');
    }
};

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
        Schema::create('fotografias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projecto_id')->constrained('projectos')->cascadeOnDelete();
            $table->foreignId('diario_id')->nullable()->constrained('diario_obra')->nullOnDelete();
            $table->foreignId('tarefa_id')->nullable()->constrained('tarefas')->nullOnDelete();
            $table->string('url');
            $table->string('descricao')->nullable();
            $table->dateTime('data_captura')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->foreignId('tirada_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('data_captura');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fotografias');
    }
};

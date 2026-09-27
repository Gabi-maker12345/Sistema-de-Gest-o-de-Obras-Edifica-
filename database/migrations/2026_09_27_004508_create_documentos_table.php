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
        Schema::create('documentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projecto_id')->constrained('projectos')->cascadeOnDelete();
            $table->nullableMorphs('documentavel');
            $table->string('nome_ficheiro');
            $table->string('caminho');
            $table->string('tipo_documento');
            $table->unsignedInteger('versao')->default(1);
            $table->foreignId('upload_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['projecto_id', 'tipo_documento']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documentos');
    }
};

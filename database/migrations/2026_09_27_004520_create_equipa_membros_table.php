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
        Schema::create('equipa_membros', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipa_id')->constrained('equipas')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('funcao')->nullable();
            $table->date('data_entrada')->nullable();
            $table->date('data_saida')->nullable();
            $table->timestamps();

            $table->unique(['equipa_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipa_membros');
    }
};

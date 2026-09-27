<?php

use App\Enums\EstadoPagamento;
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
        Schema::create('pagamentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('despesa_id')->constrained('despesas')->cascadeOnDelete();
            $table->decimal('valor', 12, 2);
            $table->date('data_pagamento')->nullable();
            $table->string('metodo_pagamento')->nullable();
            $table->string('referencia')->nullable();
            $table->string('estado')->default(EstadoPagamento::Pendente->value);
            $table->foreignId('aprovado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('estado');
            $table->index('data_pagamento');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pagamentos');
    }
};

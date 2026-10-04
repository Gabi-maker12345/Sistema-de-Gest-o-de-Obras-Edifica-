<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Alinhamento do esquema com o produto (ANALISE_LOGICAS_FRONT_ATUAL.md):
 * a coluna `sincronizado` existia no front em memória mas não na base;
 * `localizacao` é o texto legível da fotografia; `tamanho` é o peso do anexo.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('despesas', function (Blueprint $table) {
            $table->boolean('sincronizado')->default(true)->after('registado_por');
        });

        Schema::table('diario_obra', function (Blueprint $table) {
            $table->boolean('sincronizado')->default(true)->after('registado_por');
        });

        Schema::table('fotografias', function (Blueprint $table) {
            $table->boolean('sincronizado')->default(true)->after('tirada_por');
            $table->string('localizacao')->nullable()->after('data_captura');
        });

        Schema::table('documentos', function (Blueprint $table) {
            $table->string('tamanho')->nullable()->after('nome_ficheiro');
        });
    }

    public function down(): void
    {
        Schema::table('despesas', fn (Blueprint $t) => $t->dropColumn('sincronizado'));
        Schema::table('diario_obra', fn (Blueprint $t) => $t->dropColumn('sincronizado'));
        Schema::table('fotografias', fn (Blueprint $t) => $t->dropColumn(['sincronizado', 'localizacao']));
        Schema::table('documentos', fn (Blueprint $t) => $t->dropColumn('tamanho'));
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Uma tarefa pode ser de gestão e não estar presa a nenhuma actividade
 * (spec §13: "Fechar auto de medição" não é uma actividade de obra).
 */
return new class extends Migration
{
    public function up(): void
    {
        // SQLite não altera colunas in-place; reconstrói-se a tabela.
        if (DB::connection()->getDriverName() === 'sqlite') {
            Schema::table('tarefas', function (Blueprint $table) {
                $table->foreignId('actividade_id')->nullable()->change();
            });

            return;
        }

        Schema::table('tarefas', function (Blueprint $table) {
            $table->foreignId('actividade_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('tarefas', function (Blueprint $table) {
            $table->foreignId('actividade_id')->nullable(false)->change();
        });
    }
};

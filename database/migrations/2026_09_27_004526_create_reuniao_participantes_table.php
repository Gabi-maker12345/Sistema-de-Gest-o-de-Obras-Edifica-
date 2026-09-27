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
        Schema::create('reuniao_participantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reuniao_id')->constrained('reunioes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->boolean('presenca')->default(false);
            $table->string('papel')->nullable();
            $table->timestamps();

            $table->unique(['reuniao_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reuniao_participantes');
    }
};

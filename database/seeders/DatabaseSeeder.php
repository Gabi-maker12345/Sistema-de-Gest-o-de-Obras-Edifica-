<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Fonte única de dados de demonstração (substitui o seed em memória
        // do front, resources/js/Data/seed.ts).
        $this->call(SgoSeeder::class);
    }
}

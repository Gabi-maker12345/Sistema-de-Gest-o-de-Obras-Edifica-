<?php

use App\Console\Commands\MarcarAtrasadas;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command(MarcarAtrasadas::class)
    ->dailyAt('00:10')
    ->withoutOverlapping()
    ->description('Marca actividades e tarefas em atraso e recalcula a execução física.');

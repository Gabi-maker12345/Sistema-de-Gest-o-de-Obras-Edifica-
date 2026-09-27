<?php

namespace App\Providers;

use App\Models\Despesa;
use App\Observers\DespesaObserver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Despesa::observe(DespesaObserver::class);

        Vite::prefetch(concurrency: 3);
    }
}

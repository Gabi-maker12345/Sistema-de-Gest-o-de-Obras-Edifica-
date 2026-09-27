<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'SGO') }}</title>

        {{-- Fonte de sistema para a letra de desenhista, monoespaçada para a cota. --}}
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link
            href="https://fonts.bunny.net/css?family=archivo:wght@400;500;600;700&family=ibm-plex-mono:wght@400;500;600&display=swap"
            rel="stylesheet"
        />

        {{-- Scripts --}}
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="bg-paper font-sans text-graphite antialiased">
        @inertia
    </body>
</html>

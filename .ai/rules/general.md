---
paths:
  - '**/*'
---

# General

## Acabar sempre por validar, matar servidores e comitar
Nenhum turno acaba sem estes três passos, por esta ordem:

1. Validar: `npm run types`, `npm run build`, `vendor/bin/pint --dirty --format agent`, `php artisan test --compact`.
2. Matar os servidores do projecto e remover `public/hot`.
3. Comitar tudo o que for aceitável.

Ao matar servidores, não filtrar processos por `*SGO*` na linha de comandos: o
`php artisan serve` que started de um terminal não traz o caminho do projecto e
escapa ao filtro, mata-se-lhe o filho e ele ressuscita outro na porta seguinte.
Procurar `artisan serve` e `vite` para além de `*SGO*`, e conferir as portas
depois de matar.

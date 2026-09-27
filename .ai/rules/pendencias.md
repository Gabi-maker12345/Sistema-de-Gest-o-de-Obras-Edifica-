# Pendências

Todas as decisões estão resolvidas. Se alguma for reaberta, actualizar a tabela da secção 0 de `sgo-spec.md` **e** a secção correspondente da spec, para que os dois ficheiros não divirjam.

## D1 — Onde vive o front-end — ✅ RESOLVIDO

**Inertia dentro do Laravel actual.** Rotas em `routes/web.php`, páginas em `resources/js/Pages`, router do Inertia em vez de TanStack Router. A camada de dados continua a ser TypeScript + Context em memória (sem base de dados, sem migrations, sem persistência), conforme a spec — o Inertia serve apenas de routing, layouts e componentes de página. Nomes de rota mantêm-se: `/`, `/funcionalidades`, `/sobre`, `/contacto`, `/login`, `/admin/*`.

## D2 — Moeda — ✅ RESOLVIDO

**AOA (Kwanza), prefixo `Kz`.** Todos os inputs monetários, máscaras, formatadores e eixos de gráficos usam `Kz`. Nenhum `€` no produto.

## D3 — Dependências Tailwind — ✅ RESOLVIDO

**Subir para Tailwind v4.** Estado incoerente encontrado: `tailwindcss@4.3.3` instalado mas `package.json` declara `^3.2.1`; `postcss.config.js` usa o plugin `tailwindcss` da v3 (inexistente na v4); `vite.config.js` não tem `@tailwindcss/vite`; `resources/css/app.css` está em `@tailwind base/components/utilities` (sintaxe v3). shadcn/ui actual assume v4.

Trabalho: `package.json` → `tailwindcss@^4.3.3`; adicionar `@tailwindcss/vite` ao array de plugins de `vite.config.js`; remover `postcss.config.js` e `tailwind.config.js`; migrar `resources/css/app.css` para CSS-first (`@import 'tailwindcss';` + `@theme`).

## D5 — Autenticação — ✅ RESOLVIDO

**Manter Breeze (login real) + selector "Ver como".** `/login` e afins mantêm-se, `/admin/*` sob middleware `auth`. O selector "Ver como" aparece no ecrã de login (§2 da spec) e permanentemente no topo do painel (§3); é uma afinidade de demonstração que troca o utilizador efectivo para filtragem de dados, sem alterar a sessão real. O Dashboard da spec passa a `/admin/dashboard`; a rota `/dashboard` do Breeze deixa de ser o painel.

## D4 — Paleta — ✅ RESOLVIDO

Direcção visual escolhida: **THE ROLL — o carimbo da prancha técnica**, registo de composição `safer`. Paleta definida na secção 11 de `sgo-spec.md` (papel `#E9EDEA`, grafite `#15181A`, tinta de carimbo `#31409E`, âmbar `#D98A0B`, lápis vermelho `#B4321C`), com o papel de cada cor fixado. Escolher exactamente estes tokens, com a semântica de carimbo/âncora/estado/ação que a secção 11 descreve.


## D4 — Paleta

Spec pede grafite + âmbar/laranja. Falta definir os valores exactos, ou decidir que se escolhem na secção 1 (design system) com a skill `impeccable`.

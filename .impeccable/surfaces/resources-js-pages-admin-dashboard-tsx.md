---
version: 1
slug: "resources-js-pages-admin-dashboard-tsx"
primary_target: "resources/js/Pages/Admin/Dashboard.tsx"
related_targets: ["resources/js/Layouts/LayoutAdmin.tsx"]
---

# Painel — casca e folha de cotas

## Âmbito e modo

`/admin/dashboard` e a casca do painel (sidebar recolhível com os sete grupos da
spec §4, topo com busca, notificações, perfil e «Ver como») mais a folha de
cotas do dashboard. Modo **Operate**: o gestor abre o painel e tem de saber, sem
perguntar a ninguém, o que está atrasado e o que espera a sua aprovação.

## Audiência, tarefa, prova

- **Audência:** o gestor de projecto, a alternar entre o escritório e o
  estaleiro; e o encarregado, que entra pelo telefone. O selector «Ver como»
  permuta o perfil efectivo.
- **Tarefa:** responder «onde está este projecto, fisicamente e financeiramente?»
  e depois tratar o que está a pedir aprovação.
- **Prova:** os seis indicadores da spec §5 lidos como uma folha de medições, e
  a tabela de projectos ordenada pelo desvio entre execução física e financeira.
  Nenhum número é escrito à mão: tudo vem dos registos em memória.
- **Restrições:** português europeu pré-AO; moeda `Kz`; números tabulares em
  mono; sem espaço de Movimento no painel (só Bloco, 48px); contentor
  `max-w-7xl`; as cores e a codificação de estados são as de
  `.ai/rules/direccao-visual.md`, que não se renegocia.

## Direcção e momento

Momento a memorizar: a folha de cotas — a linha de medição por cima das
cabeças das colunas, com os medidores desenhados a hachura e o valor escrito na
margem, e os seis indicadores no bloco de título da folha, no canto, como num
desenho verdadeiro. É a resposta directa à crítica da fase 1: a prancha sem a
tabela de prancha.

A sidebar é o índice de folhas do jogo emitido: as folhas por emitir ficam a
traço fino e sem ligação, e cada folha leva o seu número. Assim o menu da spec
§4 aparece inteiro sem que nenhuma rota seja inventada.

## Decisões por resolver

- Notificações e busca são construídas já aqui porque a spec §3 as pede no topo
  do painel, apesar de a §13 as detalhar na fase 8.
- A comparação das execuções (gráfico) entra abaixo da tabela, na mesma
  malha de 10 divisões, porque a spec §5 exige gráfico e a folha de cotas não
  tem onde pôr um.

## Direction contract

**THESIS.** O painel é a folha de medições, não um painel de cartões: a
diferença entre o que se construiu e o que se gastou é a informação principal, e
a prancha é o registo que sabe mostrar uma diferença. Recusa o hero-metric, a
grelha de cartões de indicador e a faixa de KPIs.

**OWN-WORLD.** Sobre papel `#E9EDEA` com malha de 32px e fibra de papel apenas
na margem de plotação, grafite `#15181A` para texto e estrutura, tinta de
carimbo `#31409E` só para identidade, âmbar `#D98A0B` só para acção (e
`--amber-ink` quando tem de ser lido), lápis vermelho só para atraso e erro. Raios
de 1px, sombras de offset duro, tabelas de gap-px, cota em mono 11px.

**STORY.** O gestor vê seis números, depois vê a tabela de projectos onde cada
linha tem a sua matriz de identidade, o estado lido pelo peso do traço, as duas
execuções separadas e o desvio entre elas, e sai a tratar a fila de aprovação.

**FIRST VIEWPORT.** Esquerda: `h1` com o assunto do dia e a linha de proveniência
da folha. Direita, no canto: o bloco de título, com os seis indicadores em
leitura tabular. Abaixo, em largura inteira: a linha de cota, as cabeças, e as
primeiras linhas de projectos já visíveis sem scroll.

**FORM.** Tabela de prancha cotada, escolhida por sorteio sobre três estruturas
de dealt. Seed key `c77a22f9`.

**FINISH.** unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance

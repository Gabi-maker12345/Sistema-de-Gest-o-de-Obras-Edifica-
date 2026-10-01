---
version: 1
slug: "resources-js-pages-admin-projectos-tsx"
primary_target: "resources/js/Pages/Admin/Projectos.tsx"
related_targets: ["resources/js/Pages/Admin/ProjectoDetalhe.tsx","resources/js/Pages/Admin/Utilizadores.tsx","resources/js/Pages/Admin/Areas.tsx","resources/js/Pages/Admin/Equipas.tsx","resources/js/Components/brand/espelho-datas.tsx"]
---

# Espelho de datas — os cadastros base

## Âmbito e modo

`/admin/projectos` e o detalhe do projecto, mais `/admin/utilizadores`,
`/admin/areas` e `/admin/equipas`: a fase 3 da spec §13. Modo **Operate**. O
gestor entra aqui para criar e corrigir registos e para responder «onde está
este projecto?» e «quem lhe mex?» sem sair da folha.

## Audiência, tarefa, prova

- **Audiência:** o gestor de projecto, no escritório, e a proprietária, que
  administra perfis e acessos. O encarregado aparece aqui só como registo.
- **Tarefa:** abrir o espelho, ver a frente de cada obra contra o calendário,
  abrir um projecto, gerir quem lhe acede. Nos outros três módulos, criar e
  corrigir linhas.
- **Prova:** a régua de hoje a cortar as janelas, e a diferença entre o
  enchimento e o traço de fim da janela — o desenho a mostrar que há obra por
  fazer dentro de um prazo já fechado. Nenhum número escrito à mão.
- **Restrições:** pré-AO; `Kz`; tabular em mono; sem Movimento no painel (só
  Bloco, 48px); `max-w-7xl`; as cores e as codificações de estado são as de
  `.ai/rules/direccao-visual.md`, que não se renegocia. O substrato é o que o
  código já faz — tábua de grafite, folha de papel pousada, pasta manila — e
  não o «fundo é papel» literal da secção 11 da spec, que ficou atrás do código.

## Direcção e momento

Momento a memorizar: a régua de hoje. Uma linha de grafite a 64% atravessa
todas as janelas de uma ponta à outra da folha, e o que ela separa é a única
coisa que o gestor precisa de saber sem pensar — o que ainda tem prazo e o que
já não tem. Onde a régua passa à direita do traço de fim da janela e o
enchimento não chegou ao fim, a folha está a lápis vermelho, e é a única zona
vermelha da página.

O espelho não é um cronograma: a janela é uma cota com traços de extremo, e o
enchimento é o medidor do dashboard esticado sobre o eixo das datas. Os números
vivem numa margem direita tabular — a cota escrita ao lado da medição — porque
um gráfico que só se lê por forma não serve para quem tem de comparar.

Nos outros três módulos o eixo não é o tempo, é a identidade: a cota sobre as
cabeças das colunas, uma linha por registo, o mesmo carimbo, a mesma margem. O
que muda é a cotação, não a gramática.

## Decisões por resolver

- O Projecto emite só as abas Acessos e Resumo. As outras onze ficam na tira a
  lápis, sem ligação, como as folhas por emitir do índice — não são ecrãs vazios
  nem dead links.
- As datas usam um calendário escrito no registo (grade de cota, mês em
 versalete) em vez de `react-day-picker`: a biblioteca traria um mês que não é
  desta folha, e a dependência nova não se justifica.
- O combo de entidades relacionadas é um combobox próprio sobre Popover, com
  pesquisa e teclado: `cmdk` não está instalado e a spec proíbe `<select>`
  nativo.

## Direction contract

**THESIS.** O registo é medido contra um eixo, e a medição escreve-se na
margem. O que a fase 3 recusa é a grelha de cartões de registo com um badge de
estado em cada um: em THE ROLL a lista de projectos é um desenho em escala de
tempo, e os outros três cadastros são folhas de cota, não catálogos.

**OWN-WORLD.** Tábua de grafite, folha de papel pousada com sombra de offset
duro, pasta manila no índice. Papel `#E9EDEA`, grafite `#15181A`, tinta de
carimbo `#31409E` só para identidade, âmbar `#D98A0B` só para acção, lápis
vermelho só para prazo estourado e desvio ≥ 10 pp. Hachura a 45º no que é
derivado, 90º no que está cortado. Raios de 1 e 2px, cota em mono 11px em
`graphite-64`, tabela de `gap-px` com grelha a `graphite-32`.

**STORY.** O gestor abre a folha, vê onde termina cada obra, abre a que está
atrasada, e sai dela com o acesso de quem tem de mexer corrigido. A proprietária
abre utilizadores e vê que a consulta de um projecto não é o mesmo que perfil
global.

**FIRST VIEWPORT.** Esquerda: a cota de proveniência, o `h1` «Projectos», a
linha de quem está a ver. Direita, no canto: o quadro de medições sobre a tábua
com as cinco leituras que mandam, e o bloco de título por baixo. Abaixo, em
largura inteira: a régua dos meses com a cota dos estados por cima, a régua de
hoje a atravessar tudo, e as três primeiras janelas já visíveis sem scroll.

**FORM.** Espelho de datas, 7.ª de sete estruturas ordenadas por ressonância,
sorteada pelo script; seed key `b4af8f1a`.

**FINISH.** unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance

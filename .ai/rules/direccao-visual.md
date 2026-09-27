# Contrato de direcção — THE ROLL

Direcção visual única do SGO. Escolhida na secção 1 da spec, registo de composição
`safer`: fiel à prancha técnica, puxado para convenções reconhecíveis da categoria, sem
concessões gratuitamente ousadas. Este ficheiro é a fonte de verdade estética: qualquer
ecrã novo tem de ser revisto contra ele antes de estar pronto.

## O que a direção é

Cada ecrã é uma **folha plotada**: uma prancha técnica monocromática onde o estado de um
registo se lê pelo **peso do traço** e não por mais uma cor. Não é uma interface "azul de
escritório com detalhes de engenharia": é um documento de trabalho, e a identidade do
registo está carimbada no canto.

Três metaphors obrigatórias, e só estas:

- **A malha da prancha** — a grelha de fundo, muito ténue, a fazer o papel.
- **A revisão vertical** — a margem direita onde a folha acumula revisões.
- **O carimbo** — a identidade do registo em que se está, em tinta de carimbo.

## Paleta (D4, exacta)

| Papel | Token | Hex | Onde vive |
| --- | --- | --- | --- |
| Papel / fundo | `--paper` | `#E9EDEA` | Fundo, cartões, folhas |
| Grafite / estrutura | `--graphite` | `#15181A` | Texto, linhas, hachura, eixos |
| Tinta de carimbo | `--stamp` | `#31409E` | Identidade do registo, selos, ligações |
| Âmbar | `--amber` | `#D98A0B` | Acção primária, foco, estado activo |
| Lápis vermelho | `--red-pencil` | `#B4321C` | Atraso, erro, rejeição — nada mais |

Regras não negociáveis:

- O **âmbar é a acção**. Botão primário, foco visível, estado activo, "pendente de sincronização". Nunca é um fundo decorativo nem um segundo tom de escala.
- **Excepção única: a `Marca`.** O quadrado da «S» é âmbar em todos os ecrãs. A marca não é uma acção, é a assinatura — é a única excepção ao âmbar em todo o produto. Se outro elemento precisar de âmbar fora da acção, não é a marca: é um erro.
- A **tinta de carimbo é a identidade**. Matriz do registo, selo, escala, ligação ao projecto de origem.
- O **lápis vermelho é reservado** a atraso, erro e rejeição. Nunca decorativo. Se um ecrã tem vermelho em tudo, está errado.
- O âmbar e o vermelho **nunca** são dois tons da mesma escala.
- Marketing é **monocromático**: grafite sobre papel, carimbo para identidade, âmbar só na acção. Nada defotografia, gradientes ou cor decorativa.
- Todos os tons existem em variantes `-08`, `-12`, `-16`, `-20`, `-32`, `-48`, `-64` geradas por `color-mix`. Não inventar hex novos.

### Pressão de tinta: a mesma tinta só muda de função, nunca de papel

Rácios medidos sobre `--paper` (`#E9EDEA`), WCAG AA a 4,5:1 para texto e 3:1 para
contorno ou símbolo com significado:

| Token | Rácio | Pode ser |
| --- | --- | --- |
| `--graphite` | 17,8:1 | texto, estrutura |
| `--stamp` | 7,5:1 | texto de identidade, matriz, selo |
| `--amber-ink` | 6,2:1 | **texto e contorno** de âmbar |
| `--red-pencil` | 5,2:1 | atraso, erro, rejeição |
| `--graphite-64` | 5,0:1 | a `.cota` — o segundo passo mais escuro |
| `--stamp-64` | 3,3:1 | divisória, tracejado — **nunca** texto a 11px |
| `--graphite-48` | 3,1:1 | só decoração sem conteúdo |
| `--amber` | **2,3:1** | **só enchimento**, nunca texto nem contorno |

Duas regras que daí saem, e que um ecrã novo não pode violar:

- **O âmbar é um enchimento, não uma cor de leitura.** Preenchido com grafite por
  cima dá 6,4:1 e é o botão primário. Como texto ou como anel de foco, desce para
  `--amber-ink` — que é o mesmo âmbar a outra pressão, não um hex novo.
- **Nenhuma variante alfa de tinta serve para texto pequeno.** `-64` e abaixo são
  traço, divisória e hachura. Texto a 11px lê-se com o token cheio ou com
  `--graphite-64`.

O anel de foco é âmbar-ink, e o `.cota` é `graphite-64`: são as duas excepções que
já violariam a regra acima se fossem tiradas.

## Tipografia

- **Archivo** para tudo o que se lê (`--font-sans`). Robusta, de drafting, sem ser decorativa.
- **IBM Plex Mono** para cota, etiqueta, número, e qualquer valor que seja para comparar (`--font-mono`).
- Escala: `--text-2xs` (0.6875rem, o corpo das cotas), base, e títulos de `text-3xl` a `text-4xl` com `tracking-tight` e `leading-[1.05]`.
- **Cota** (`.cota`): versaletes via `text-transform: uppercase`, tracking `[0.06em]`, `text-2xs`, grafite claro. É a voz do documento. Usar para rótulos de campo, cabeçalhos de coluna e metadados — nunca para frases.
- **Anotação** (`.anotacao`): `text-2xs`, `leading-relaxed`, tracking normal, grafite claro, com `normal-case` quando o texto é uma frase. É a letra a lápis do canto do desenho.
- Números tabulares sempre em mono. Valores de dinheiro com o prefixo `Kz` (D2).

## Estados: quatro codificações, e o estado **nunca** é só cor

1. **Peso de traço** — `traco="firme"` (2px, peso semibold) para atrasado, erro, e o que exige acção agora; `medio` (1px, medium) para pendente; `leve` (1px, normal) para concluído e para o que é contexto. O `Selo` é onde isto vive.
2. **Hachura** — `.hachura-45` para campo derivado e para o que é leitura; `.hachura-90` para faixa de corte e divisória de bloco.
3. **Revisão** — `.linha-activa` é a barra sólida que marca a estação activa, a folha em que estamos.
4. **Carimbo** — a identidade do registo, sempre presente em `text-stamp`, com `--rodado` (rotação de 2 a 4 graus) e `matriz`.

`EstadoSelo` é a única forma de mostrar estado. Não criar variantes por ecrã.
E dentro dele, o estado nunca é carimbo: a tinta de carimbo é identidade, e um
`Selo` que a usa deixa de dizer o que é. `medio` e `leve` diferem **só** no peso
do traço — é essa diferença que os separa, e é para isso que serve.

## Superfícies e limites

- Separadores *hairline*:: `border-graphite-12` (divisórias), `-20` (tabelas, `BlocoTitulo`), `-32` (bordas de controlo), `-64`/`-48` (texto secundário).
- Raio quase zero: `rounded-nib` (1px) em controlos, `rounded-selo` (2px) em selos. **Nenhum** `rounded-full` num cartão ou num botão; o traço de caneta não é redondo.
- Sombra é `shadow-folha` / `shadow-levantada` / `shadow-selo` — sempre um offset duro de 1 a 3px, sem desfoque. Nada de `drop-shadow`, nada de `blur`.
- Grelhas de cartões: `gap-px` com `bg-graphite-12` no contentor e `bg-paper` nas células. É assim que se desenha uma tabela de prancha.
- Densidade: tabelas densas e legíveis. Compactar, nunca clarear.

## Ritmo, proporção e escala

A composição é o que faz a prancha parecer uma prancha. Estas regras são contrato: um ecrã
que as viola não está pronto, por mais bem escrito que esteja.

### Base de 32px

O passo do rolo é 32px. Tudo o que separa é múltiplo de 4; o que separa blocos é múltiplo de 8;
o que separa movimentos é múltiplo de 32. Nenhum valor solto. Se um espaçamento não sai da
tabela abaixo, o número está errado.

### Três níveis de distância — e só três

| Nível | Quando | Móvel | Desktop | Classe |
| --- | --- | --- | --- | --- |
| **Movimento** | Entre secções de assuntos diferentes | 96px | 128px | `space-y-24 sm:space-y-32` |
| **Bloco** | Entre um título e o seu conteúdo, ou entre blocos irmãos | 48px | 48px | `space-y-12` |
| **Dentro** | Entre elementos do mesmo bloco | 24px | 24px | `space-y-6` |
| **Apertado** | Rótulo e valor, cota e legenda, metadados | 8px | 8px | `space-y-2` |

O erro a evitar é o **espaçamento uniforme**: todas as secções com a mesma distância. Uma página
com seis secções todas a 112px é uma lista, não uma composição — o olho não recebe nenhum sinal
sobre onde o assunto vira. Movimento é raro e grande; o resto é apertado. Uma folha bem
desenhada tem muito branco e muito pouco entrelinha.

**Movimento é para documentos, não para aplicação.** Uma página pública com várias secções é um
documento e usa o nível Movimento. Um ecrã do painel é uma superfície densa lida de cima para
baixo: entre zonas usa-se **Bloco** (48px), nunca Movimento. Um painel com 128px entre secções
tornou-se uma landing page — e `LayoutAdmin` e `Dashboard` já são o caso inverso, com `space-y-8`
(32px) num ecrã que precisa de respiro. O painel sobe para 48px, o site público sobe para 128px.

### Proporção e medida

- Contentor: `max-w-6xl` (1152px) no site público, `max-w-7xl` (1280px) no painel. Duas
  larguras, uma por área, e nenhuma mais.
- **Medida de leitura: 672px (`max-w-2xl`) é o máximo do corpo de texto.** `h1` pode chegar a
  768px (`max-w-3xl`). Acima disso não é texto, é faixa.
- Se o contentor for mais largo do que a medida, **o vazio tem de ser deliberado e estruturado**
  — borda de plotagem a direito, linha de cota, número de folha rodado na margem. Nunca um gutter
  acidental. Uma coluna de texto de 672px dentro de um well de 1056px com nada à direita é o
  defeito de composição mais caro do produto.
- Painel: `sm:grid-cols-2` só quando o conteúdo de cada célula justificar 616px. Para conteúdo
  linha-shaped (nome, estado, dois números), a grelha é uma tabela, não cartões.

### Escala de títulos

Um nível, um tamanho. Nunca o mesmo nível com duas medidas na mesma página, nunca saltar níveis.

| Nível | Tamanho | Uso |
| --- | --- | --- |
| `h1` | `text-4xl` (36px), `sm:text-5xl` na capa pública | O que o ecrã é |
| `h2` | `text-3xl` (30px) | Movimento dentro da página |
| `h3` | `text-2xl` (24px) | Bloco dentro de um `h2` |
| `h4` | `text-xl` (20px) | Cabeçalho de cartão, título de coluna |

No painel o `h1` é o assunto do dia **e o conteúdo tem de o igualar**. Um `h1` de saudação
acima de um conteúdo que só tem um `.cota` de 11px é hierarquia invertida.

### Peso da voz

**`.cota` é o segundo passo mais escuro (`graphite-64`), nunca o mais claro.** O rótulo não pode
ser mais ténue do que o conteúdo que rotula, e a 11px a inversão agrava-se. `graphite-48` é
reservado a texto decorativo sem conteúdo (numeração de lista, marca de ficheiro).

### Padding e larguras de componente

- **Dois valores de cartão, nunca mais:** `p-5` (20px) para o cartão padrão, `p-6 sm:p-8`
  (24/32px) para bloco grande. `p-5 sm:p-7` e `p-6 sm:p-10` não existem. Nenhuma aresta de cartão
  deve ficar desalinhada da aresta do bloco ao lado.
- **`BlocoTitulo` leva sempre largura explícita** (`w-full` dentro de um bloco, `w-*` quando
  dimensionado). Nunca content-width solto: sem contrato de largura, o mesmo componente
  renderiza como tira de 4 colunas num sítio e como bloco 2×2 noutro.
- `grid-cols-[1fr_20rem]` está invertido quando o `aside` é o que tem mais conteúdo. O esbelto
  fica com a medida maior.

## Comportamento

- Transições curtas (150ms) e só em cor/transform. Sem `animate-bounce`, sem shimmer, sem parallax.
- Foco visível em todo o controlo focável, e sempre com âmbar.
- Botão primário é o âmbar. Nunca mais de um primário por vista.
- Responsivo: por baixo de `md` a navegação colapsa e a barra de revisão some; o conteúdo mantém a leitura.

## Registo de linguagem (copiar na mesma voz)

- Português de Portugal **pré-AO**: `projectos`, `acção`, `aspectos`, `objectivo`, `director`, `selecção`, `actividades`, `correcto`, `logótipo`. Nunca a forma pós-AO.
- Posicionamento: **gestão de projectos, obras e trabalho**. A copy não é só sobre obras.
- Voz documental: "Folha 01", "Escala 1:1", "Rev. C", "O que está por fazer". O produto fala como quem preenche um documento, não como um landing page de SaaS.
- Estados escrevem-se por extenso em pt-PT ("Pendente", "Em execução", "Atrasada"); o valor interno (`em_execucao`) nunca chega ao ecrã sem passar por `lib/rotulos.ts`.
- Integrações por integrar dizem "bremente disponível" e são desenhadas a tracejado, nunca como link morto sem legenda.

## O que está proibido

- Gradientes, glassmorphism, drop-shadows com desfoque, emojis como ícone, ilustrações a 3D,fotografia de obra de banco de imagens, purple/blue de gradiente.
- Uma cor nova para "dar destaque". Se falta um estado, falta um **peso de traço**.
- Texto corrido sem hierarquia: um ecrã tem de ter um título, um subtítulo e um bloco de metadados.
- Âmbar a mais de dois elementos por ecrã.
- Ecra de login com a estrutura do Breeze (cartão centrado, link "Esqueceu-se a palavra-passe?").
- Mapas, "IA", gamificação, medalhas, cartoon.

## Checklist de revisão (antes de dar um ecrã por pronto)

- [ ] Fundo `--paper`, texto `--graphite`; nenhuma cor fora dos cinco tokens.
- [ ] Nenhum texto a 11px numa variante alfa (`-64` ou menos) nem em `--amber` puro.
- [ ] Existe carimbo com a identidade do registo em que se está.
- [ ] Cada estado é lido por peso de traço, não só por cor.
- [ ] Existe pelo menos uma cota e uma anotação a lápis no ecrã.
- [ ] Números em mono, dinheiro com `Kz`.
- [ ] Âmbar só na acção; vermelho só em atraso/erro/rejeição.
- [ ] Ortografia pré-AO e copy de "gestão de projectos, obras e trabalho".
- [ ] Foco visível, sem `rounded-full` em cartões, sem sombra com desfoque.
- [ ] Responsivo a 375px, com a navegação colapsada a funcionar.
- [ ] **Todo o espaçamento sai da tabela de três níveis**; nenhum valor solto, nenhuma secção com a mesma distância que a anterior.
- [ ] **Nenhuma medida acima de 672px** no corpo de texto, e o vazio à direita é estrutural, não acidental.
- [ ] **Um nível de título, um tamanho**; nenhum `h2` a 30px ao lado de um `h2` a 24px na mesma página.
- [ ] **`.cota` em `graphite-64`**, nunca em `graphite-48` quando rotula conteúdo.
- [ ] **`BlocoTitulo` com largura explícita**; nada truncado dentro dele.
- [ ] **Dois paddings de cartão, no máximo**, e arestas alinhadas entre blocos vizinhos.
- [ ] Âmbar fora da acção: só na `Marca`.

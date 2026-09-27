# SGO — Sistema de gestão de trabalho, projectos e obras (apenas front-end)

> Fonte única de verdade do produto. Ler antes de qualquer trabalho de interface.
> Origem: plano fornecido pelo utilizador. Não alterar sem pedido explícito.

## 0. Decisões de arquitectura (já tomadas)

| # | Decisão | Consequência na implementação |
| --- | --- | --- |
| D1 | **Inertia dentro do Laravel actual** | Rotas em `routes/web.php` + páginas em `resources/js/Pages`. **Não** usar TanStack Router. Nomes de rota (`/`, `/funcionalidades`, `/sobre`, `/contacto`, `/login`, `/admin/*`) mantêm-se. A camada de dados continua a ser **TypeScript + Context em memória** — sem base de dados, sem migrations, sem persistência, conforme a spec; o Inertia serve só de routing, layouts e componentes de página. |
| D2 | **Moeda: AOA (Kwanza), prefixo `Kz`** | Todos os inputs monetários, máscaras, formatadores e eixos de gráficos usam `Kz`. Nenhum `€` no produto. |
| D3 | **Tailwind v4** | Corrigir a incoerência actual (`tailwindcss@4.3.3` instalado mas declarado `^3.2.1`, `postcss.config.js` da v3, sem `@tailwindcss/vite` no `vite.config.js`, `app.css` em sintaxe v3). Migrar para CSS-first em `resources/css/app.css`, remover `postcss.config.js` e `tailwind.config.js`. Componentes shadcn/ui actuais assumem v4. |
| D5 | **Autenticação real (Breeze) + "Ver como"** | `/login` e afins mantêm-se do Breeze, com middleware `auth` em `/admin/*`. O selector "Ver como" existe no ecrã de login (§2) **e** permanentemente no topo do painel (§3); é uma afinidade de demonstração que substitui o utilizador autenticado para fins de filtragem de dados, sem tocar na sessão real. O Dashboard da spec passa a viver em `/admin/dashboard` (a rota `/dashboard` do Breeze deixa de ser o painel). |
| D6 | **Nenhum ecrã nem componente do Breeze sobrevive** | O scaffold Breeze é apenas ponto de partida: ecrãs **e** `resources/js/Components/*` são substituídos por componentes próprios. A spec só pede `/login` como ecrã de autenticação — `/register`, `/forgot-password`, `/reset-password`, `/verify-email` e `/profile` saem. Não reaproveitar `AuthenticatedLayout`, `GuestLayout`, `NavLink`, `Dropdown`, `Modal`, `PrimaryButton`/`SecondaryButton`/`DangerButton`, `TextInput`/`Checkbox`/`InputLabel`/`InputError` tal como vêm: a biblioteca de UI é a definida na secção 1, com primitivas shadcn/Radix. |

Ainda pendente: D4 (paleta exacta) — ver [`pendencias.md`](pendencias.md).

---

## 1. Âmbito e posicionamento

Todas as telas em React (Angular não roda nesta plataforma), em português, com dados de exemplo em memória — sem banco de dados, sem persistência real.

O SGO é uma plataforma pessoal de gestão de trabalho: centraliza agenda, tarefas, projectos administrativos, obras e finanças numa única fonte de informação. "Obra" é apenas um tipo de Projecto, não um sistema à parte. O copy institucional (landing, Sobre, Funcionalidades) deve falar em "gestão de projectos, obras e trabalho", nunca restringir o discurso a "construção civil" — mas pode ter uma secção de destaque específica para o módulo de Obras por ser o mais desenvolvido.

**Não implementar nesta fase:** Google Drive, Google Calendar, WhatsApp, E-mail, IA. Estes podem aparecer como itens desactivados "brevemente disponível" no menu, sem ecrãs nem lógica.

## 2. Site público

- Início (landing): apresentação do SGO com o posicionamento acima, destaques, chamada para acção, rodapé.
- Funcionalidades, Sobre e Contacto (formulário com validação).
- Entrar: login simulado que leva ao painel, com um selector "Ver como: [utilizador]" para escolher qual utilizador de exemplo simular (ver secção de Permissões).

## 3. Painel administrativo

Layout com sidebar recolhível (para ícones), topo com busca, notificações e perfil do utilizador. O selector "Ver como" fica sempre visível no topo do painel, mesmo depois do login — ao trocar de utilizador, filtra em tempo real a lista de Projectos visíveis no menu e no dashboard, conforme os acessos desse utilizador nos dados de exemplo (ver Utilizadores/Acessos). Administrador vê sempre tudo, independentemente do selector.

## 4. Menu lateral (agrupado)

**Geral**
- Dashboard
- Agenda
- As minhas tarefas

**Trabalho**
- Projectos
- Actividades
- Equipas

**Financeiro**
- Despesas
- Pagamentos
- Materiais
- Requisições de materiais
- Fornecedores

**Registo de campo**
- Diário de obra
- Fotografias
- Documentos

**Colaboração**
- Reuniões
- Decisões

**Análise**
- Indicadores
- Relatórios

**Sistema**
- Utilizadores
- Áreas
- Configurações

## 5. Detalhe dos módulos

### Dashboard
Indicadores: projectos activos, execução física média (%), execução financeira média (%), tarefas pendentes, tarefas atrasadas, efectivo presente. Gráficos (Recharts), alertas (ex.: actividades atrasadas, despesas pendentes de aprovação) e actividade recente.

### Agenda
Vista de calendário (mês/semana/lista) com dados de exemplo. Campos do evento: título, descrição, tipo (pessoal, profissional, obra — badge colorido por tipo), data/hora início, data/hora fim, local, lembrete (minutos antes), projecto (opcional, campo de pesquisa/select), tarefa (opcional, idem). Evento ligado a um Projecto mostra o nome do projecto como badge. Botão "Nova tarefa a partir daqui" pré-preenche o formulário de Tarefa com a data do evento.

### As minhas tarefas
Vista agregada, cross-projecto, das tarefas atribuídas ao utilizador actualmente simulado (distinto da lista de Tarefas dentro de um Projecto). Layout em Kanban (colunas: Pendente, Em curso, Concluída, Atrasada) com alternativa em lista com filtros rápidos: Atrasadas, Para hoje, Esta semana, Todas. Cada cartão mostra o projecto de origem como badge.

### Utilizadores
Lista e formulário: nome, e-mail, password, telefone, perfil (Administrador/Proprietário, Gestor, Colaborador/Técnico, Fiscal/Responsável de Obra, Consulta), activo. O perfil é global (Administrador vê e edita tudo sempre); acesso a projectos específicos é tratado à parte, na aba Acessos de cada Projecto (ver abaixo), com um papel próprio por projecto (gestor, colaborador, fiscal, consulta), distinto deste perfil global.

### Áreas
Nome, descrição, responsável.

### Projectos
Lista com busca e filtro por estado geral (planeamento, em execução, suspenso, cancelado).

Formulário: nome, cliente, morada, área, gestor, datas (início, fim prevista, fim real), orçamento previsto, orçamento actual, valor contratual (campo com tooltip explicando a diferença entre os três: orçamento previsto/actual = custo interno estimado/real; valor contratual = valor acordado com o cliente).

Indicadores mostrados separadamente, tanto na lista como no detalhe (nunca fundidos num único badge):
- Estado geral (badge): planeamento, em execução, suspenso, cancelado.
- Execução física (barra de progresso %): média da percentagem_conclusao das Actividades do projecto, nos dados de exemplo.
- Execução financeira (barra de progresso %): soma das Despesas aprovadas do projecto ÷ valor contratual × 100.
- Encerramento administrativo (toggle/badge sim-não): editável apenas por Gestor/Admin, com texto de ajuda a explicar que é independente das duas execuções acima — um projecto não é "concluído" só por atingir 100% financeiro.

Página de detalhe com abas, nesta ordem: Acessos, Resumo, Actividades, Tarefas, Equipas, Despesas, Diário, Fotografias, Documentos, Reuniões, Decisões, Indicadores, Histórico.
- Aba Acessos: lista de utilizadores com acesso a este projecto especificamente, cada um com o seu papel de projecto (gestor, colaborador, fiscal, consulta). Formulário para adicionar/remover utilizador e definir o papel. Nota fixa na aba: "Administrador vê sempre todos os projectos, independentemente desta lista."
- Aba Histórico: ver secção Auditoria (secção 7).

### Equipas
Nome, especialidade, encarregado, projecto; gestão de membros (função, data de entrada/saída).

### Actividades
Por projecto, com sub-actividades (actividade pai), datas previstas/reais, percentagem de conclusão, estado (não iniciada, em curso, concluída, atrasada). Nos dados de exemplo, incluir pelo menos uma actividade cujo prazo já passou e o estado simulado já mostra "atrasada", para demonstrar a regra automática do sistema real. Aba Histórico no detalhe.

### Tarefas
Título, descrição, responsável, equipa, prioridade (baixa, média, alta, urgente), estado (pendente, em curso, concluída, atrasada), prazo, horas estimadas x reais, % conclusão. Aba Histórico no detalhe.

### Documentos
Anexos por projecto, tarefa, despesa ou fornecedor, com tipo, versão e quem carregou; envio simulado com pré-visualização. Aba Histórico no detalhe.

### Fornecedores
Nome, NIF, morada, contacto, especialidade, avaliação; materiais que fornecem (preço, prazo de entrega).

### Despesas
Por projecto — campo agora opcional, permitindo despesas sem obra/projecto associado (despesas pessoais/administrativas). Campos: categoria (obrigatória sempre), descrição, valor, data, fornecedor, estado de aprovação (pendente, aprovada, rejeitada), registado por. Na lista, filtro "Com projecto / Sem projecto / Todas". Badge de sincronização (ver secção 6). Aba Histórico no detalhe.

### Pagamentos
Ligados a despesas: valor, data, método, referência, estado, aprovado por. Aba Histórico no detalhe.

### Materiais
Catálogo: nome, categoria, unidade de medida, preço de referência.

### Requisições de materiais
Por projecto/tarefa: material, quantidade, data, preço unitário.

### Diário de obra
Um registo por projecto/dia: condições meteorológicas, efectivo presente, actividades realizadas, ocorrências. Badge de sincronização (ver secção 6). Aba Histórico no detalhe.

### Fotografias
Galeria por projecto, diário ou tarefa, com descrição, data de captura e localização. Badge de sincronização (ver secção 6).

### Reuniões
Título, tipo, data/hora, local, convocado por, acta; participantes com presença e papel.

### Decisões
Descrição, responsável, estado, impacto, prazo de implementação; ligadas a reuniões e projectos. Aba Histórico no detalhe.

### Indicadores
Por projecto: nome, valor, unidade, meta, tipo, data de referência.

### Relatórios
Ecrã com a lista dos relatórios definidos: Relatório de Obra, Diário de Obra, Relatório Financeiro, Mapa de Despesas, Mapa de Materiais, Cronograma, Relatório Fotográfico, Relatório de Actividades, Plano de Acções, Balanço Mensal. Cada um com botões "Exportar PDF" e "Exportar Excel" simulados (toast de confirmação, sem geração real de ficheiro nesta fase).

### Configurações
Dados da empresa, perfil do utilizador, preferências de notificação, tema claro/escuro.

## 6. Offline / sincronização (simulação visual)

Nos módulos Diário de obra, Fotografias e Despesas, cada registo nos dados de exemplo tem um campo `sincronizado` (boolean). Mostrar badge discreto em cada cartão/linha: "Sincronizado" (cinza) ou "Pendente de sincronização" (âmbar, ícone de nuvem cortada). Não simular lógica de rede real — apenas o estado visual, para validação com o cliente.

## 7. Auditoria / histórico

Nos ecrãs de detalhe de Projecto, Actividade, Tarefa, Despesa, Pagamento, Documento, Decisão e Diário de obra, adicionar aba "Histórico": linha do tempo simples com dados de exemplo mostrando quem criou o registo e quando, seguida de alterações subsequentes (campo alterado, valor anterior → valor novo, por quem, quando). Pode ser um componente simples reaproveitado nestes ecrãs, sem necessidade de arquitectura genérica nesta fase.

## 8. Notificações

Dropdown no topo do painel: lista de notificações de exemplo (tarefa atribuída, despesa aprovada/rejeitada, actividade atrasada, decisão pendente), cada uma com estado lido/não lido e link para o registo relacionado. Apenas canal in-app — sem menção a e-mail ou WhatsApp.

## 9. Fora de âmbito nesta fase

- Módulo "Contactos": não implementar, não incluir no menu — ainda não está definido se é distinto de Fornecedores/Equipas.
- Qualquer integração externa (Google Drive, Google Calendar, WhatsApp, E-mail, IA): não implementar, apenas itens desactivados no menu se fizer sentido visualmente.

## 10. Comportamento geral dos formulários

Todos os formulários com validação, mensagens de erro, confirmação ao eliminar, estados de carregamento e telas de "nenhum registo". Tabelas de junção (membros de equipa, participantes de reunião, materiais por fornecedor, acessos por projecto) aparecem como gestão dentro do módulo/aba principal, nunca como ecrã próprio no menu.

## 11. Visual

**Direcção escolhida: THE ROLL — o carimbo da prancha técnica.** Cada ecrã é uma folha plotada: carimbo vivo com a identidade do registo, estado expresso como peso de traço (não mais uma cor), hachura a 45°/90°, revisão vertical como histórico. Registo de composição `safer`: fiel à direção, puxado para convenções reconhecíveis da categoria onde ajuda, sem concessões gratuitamente ousadas.

**Paleta (D4 — decidida):**

| Papel | Token | Hex |
| --- | --- | --- |
| Papel / fundo | `--paper` | `#E9EDEA` |
| Grafite / texto e estrutura | `--graphite` | `#15181A` |
| Tinta de carimbo / identidade e selos | `--stamp` | `#31409E` |
| Âmbar / marca e acção primária | `--amber` | `#D98A0B` |
| Lápis vermelho / atraso, erro, rejeição | `--red-pencil` | `#B4321C` |

**Papel de cada cor:** o âmbar é a acção — botão primário, foco, estado activo, "pendente de sincronização". A tinta de carimbo é a identidade — matriz do registo, escala/selo, ligações ao projecto de origem. O lápis vermelho é reservado a atraso, erro e rejeição; nunca decorativo. O grafite é estrutura, texto e hachura. Nunca usar o âmbar e o vermelho como dois tons da mesma escala.

Cada ecrã leva um carimbo com a identidade do registo em que está, e o estado do registo aparece como peso de traço no texto, não como cor adicional. Tabelas densas e legíveis, tipografia robusta, responsivo.

## 12. Notas técnicas

- React com **Inertia** (router do Inertia, não TanStack Router — ver D1), Tailwind, shadcn/ui (sidebar recolhível, agora organizada em secções/grupos conforme o menu acima), Recharts.
- Rotas públicas (`/`, `/funcionalidades`, `/sobre`, `/contacto`, `/login`) e painel sob `/admin/*` com layout próprio, ambos definidos em `routes/web.php`.
- Dados de demonstração em TypeScript + Context, permitindo criar, editar e eliminar durante a sessão (sem persistência). Os dados de exemplo devem incluir: papel por utilizador em cada projecto (aba Acessos), campo `sincronizado` em Diário de obra/Fotografias/Despesas, os três campos financeiros do Projecto (orçamento previsto, orçamento actual, valor contratual) com os dois indicadores de execução calculados a partir dos restantes dados, eventos de Agenda, e histórico de alterações para os módulos com aba Histórico.
- Metadados (título/descrição/og) por rota pública.

## 13. Ordem de execução

1. Design system, layout público (copy geral, não restrito a "obras"), landing, páginas públicas + login com selector "Ver como".
2. Layout do painel com sidebar agrupada (Geral, Trabalho, Financeiro, Registo de campo, Colaboração, Análise, Sistema) e dashboard com os indicadores separados.
3. Cadastros base: utilizadores (com os perfis correctos), áreas, projectos (valor contratual, três estados/indicadores separados, aba Acessos), equipas.
4. Agenda e As minhas tarefas.
5. Execução: actividades, tarefas, diário de obra (com badge de sincronização), fotografias (idem), documentos.
6. Aba Histórico nas páginas de detalhe de Projecto, Actividade, Tarefa, Despesa, Pagamento, Documento e Decisão.
7. Financeiro e compras: fornecedores, materiais, requisições de materiais, despesas (projecto opcional, badge de sincronização), pagamentos.
8. Reuniões, decisões, indicadores, ecrã de relatórios (exportação simulada), notificações, configurações e revisão final.

---

# Modais de criação

Detalhar e implementar os modais de criação de cada entidade do SGO, seguindo as regras gerais abaixo e a especificação por entidade. Os modais de edição reutilizam exactamente o mesmo layout e campos, apenas pré-preenchidos e com o botão principal a dizer "Guardar alterações" em vez de "Criar".

## Regras gerais (transversais a todos os modais de criação)

**Estrutura:**
- Trigger: botão "+ Novo <Entidade>" no canto superior direito da lista/tabela do módulo.
- Tamanho do modal por número de campos: sm (~420px, até 4 campos, uma coluna), md (~560px, 5–9 campos, uma ou duas colunas), lg (~720px, 10+ campos, duas colunas com secções/fieldsets).
- Cabeçalho: título "Novo <Entidade>" + botão fechar (X).
- Corpo: scroll interno se exceder ~70% da altura do ecrã. Campos agrupados por secção com um sub-título pequeno (ex.: "Datas", "Financeiro") sempre que houver mais de 6 campos — não usar wizard/multi-step em nenhum modal desta fase, mesmo os mais longos (Projecto, Diário de obra); secções dentro de um único ecrã scrollável são suficientes e mais simples de implementar sem backend real.
- Rodapé fixo: "Cancelar" (outline, à esquerda) e "Criar <Entidade>" (primário, âmbar, à direita). Ao submeter, botão principal mostra spinner e fica disabled (simular ~600ms de latência com setTimeout antes de resolver).
- Sucesso: fecha o modal, mostra toast "‹Entidade› criada com sucesso", insere o novo registo no topo da lista já renderizada (via Context).
- Validação: erros aparecem abaixo do campo respectivo, a vermelho; foco automático no primeiro campo inválido; o modal não fecha. Campos obrigatórios marcados com *.
- Fecho por fora/Esc: se o formulário tiver alterações, pedir confirmação ("Tem alterações não guardadas. Sair sem guardar?") antes de fechar.
- Eliminação (fora do âmbito dos modais de criação, mas usa o mesmo padrão): AlertDialog simples de confirmação, nunca o modal de edição.

**Padrões de campo (usar consistentemente em todos os módulos):**
- Selects de entidades relacionadas (Projecto, Utilizador, Fornecedor, Material, Actividade) usam combobox pesquisável (shadcn Command dentro de Popover), nunca `<select>` nativo.
- Campos dependentes (ex.: Tarefa depende de Actividade, que depende de Projecto; Requisição depende de Projecto antes de Tarefa) ficam desabilitados e com placeholder "Escolha primeiro o Projecto" até o campo pai estar preenchido; ao mudar o campo pai, o campo filho reseta.
- Datas: shadcn Calendar + Popover. Data/hora: dois campos lado a lado (data + hora).
- Valores monetários: input com prefixo `Kz` (ver D2), máscara de milhares.
- Percentagens: input numérico com sufixo "%"; quando o campo é calculado (ex.: `percentagem_conclusao` de uma Actividade nova), aparece read-only a 0% com nota "calculado automaticamente".
- Uploads (Documentos, Fotografias): dropzone com pré-visualização de imagem/ícone de ficheiro e barra de progresso simulada; Fotografias aceita selecção múltipla (cria um registo por ficheiro).
- Campos "estado"/"aprovação" que fazem parte de um fluxo (`estado_aprovacao` de Despesa, estado de Pagamento) vêm sempre com valor por defeito fixo na criação (ex.: "pendente") e não editáveis nesse momento — a mudança de estado é uma acção própria no detalhe do registo, não um campo do modal de criação.

## Modais simples (sm/md, uma entidade, sem dependências fortes)

**Utilizadores**
- nome* (texto), email* (texto, validação de formato), password* (password, com indicador de força), confirmar_password* (deve coincidir), telefone (texto, opcional), perfil* (select: Administrador/Proprietário, Gestor, Colaborador/Técnico, Fiscal/Responsável de Obra, Consulta), activo (toggle, default true).

**Áreas**
- nome* (texto), descrição (textarea, opcional), responsável (combobox de Utilizadores, opcional).

**Materiais**
- nome* (texto), categoria (texto ou select simples), unidade_medida* (select: un, kg, m, m2, m3, l, saco, outro), preco_referencia (input monetário, opcional).

**Fornecedores**
- nome* (texto), nif (texto, validação de formato), morada (texto), contacto (texto/telefone), especialidade (texto), avaliação (star rating 1–5, opcional). Nota no rodapé do modal: "Pode associar materiais a este fornecedor depois de criado."

**Equipas**
- nome* (texto), especialidade (texto), encarregado (combobox de Utilizadores), projecto (combobox de Projectos, opcional). Nota: "Adicione membros à equipa depois de criada, na página de detalhe."

**Eventos de agenda**
- título* (texto), descrição (textarea, opcional), tipo* (select: pessoal, profissional, obra — cor do badge muda conforme selecção em tempo real no preview do modal), data_hora_inicio* (data+hora), data_hora_fim (data+hora, opcional, validação: não pode ser antes do início), local (texto, opcional), lembrete_minutos_antes (select: sem lembrete, 15min, 30min, 1h, 1 dia), projecto (combobox, opcional), tarefa (combobox dependente do projecto escolhido, opcional).

**Reuniões**
- título* (texto), tipo* (select: obra, cliente, interna, fornecedor), data_hora* (data+hora), local (texto), projecto* (combobox), convocado_por (combobox de Utilizadores, default = utilizador simulado actual), acta (textarea, opcional, placeholder "Pode preencher depois da reunião"). Nota: "Participantes são adicionados depois de criada a reunião."

## Modais médios (dependências entre campos)

**Actividades**
- projecto* (combobox; pré-preenchido e bloqueado se aberto a partir da aba Actividades dentro de um Projecto), actividade_pai (combobox de Actividades do mesmo projecto, opcional, placeholder "Nenhuma — actividade de topo"), nome* (texto), descrição (textarea), data_inicio_prevista* (data), data_fim_prevista* (data, validação: posterior ao início). estado inicia sempre em "não iniciada" (não é campo do formulário); percentagem_conclusao fixa em 0% (read-only, nota "actualiza automaticamente conforme as tarefas").

**Tarefas**
- projecto* (combobox — só para filtrar a lista de actividades, não é campo gravado), actividade* (combobox dependente do projecto escolhido), título* (texto), descrição (textarea), responsável* (combobox de Utilizadores), equipa (combobox de Equipas do projecto, opcional), prioridade* (select: baixa, média, alta, urgente — default média), prazo* (data), horas_estimadas (número decimal, opcional). estado default "pendente"; horas_reais e percentagem_conclusao não aparecem na criação (só no detalhe/edição).

**Documentos**
- associar_a* (select do tipo: Projecto, Tarefa, Despesa, Fornecedor), entidade_relacionada* (combobox cujas opções mudam conforme o tipo escolhido acima), tipo_documento* (select: contrato, licença, planta, especificação, factura, outro), ficheiro* (dropzone, um ficheiro), versão (fixo em "v1", read-only — próximas versões sobem o número automaticamente ao re-anexar no mesmo registo).

**Despesas**
- tem_projecto (toggle "Associar a um projecto?", default ligado) → se desligado, esconde o campo projecto e a despesa fica marcada como pessoal/administrativa; projecto (combobox, condicional ao toggle acima), categoria* (select: mão-de-obra, material, equipamento, subcontratação, outro), descrição (texto), valor* (input monetário), data* (data, default hoje), fornecedor (combobox, opcional). estado_aprovacao fixo em "pendente"; registado_por preenchido automaticamente com o utilizador simulado actual (mostrado como texto informativo, não editável).

**Requisições de materiais**
- projecto* (combobox), tarefa (combobox dependente do projecto, opcional), material* (combobox — ao seleccionar, mostra a unidade de medida do material como texto informativo ao lado), quantidade* (número decimal), data* (data, default hoje), preco_unitario (input monetário, pré-preenchido a partir do `preco_referencia` do material, editável).

**Fotografias**
- projecto* (combobox), contexto (select opcional: Diário de obra / Tarefa / Nenhum — mostra o combobox correspondente conforme escolha), ficheiro(s)* (dropzone, multi-selecção — cria um registo por imagem, todas com os mesmos metadados de descrição/data/localização por defeito, editáveis depois individualmente), descrição (texto, opcional), data_captura (data+hora, default agora), localização (texto ou "usar localização actual" simulado, opcional).

**Decisões**
- tem_reuniao (toggle "Originada numa reunião?") → reuniao (combobox, condicional), projecto* (combobox), descrição* (textarea), responsável* (combobox de Utilizadores), impacto* (select: custo, prazo, âmbito), prazo_implementacao (data, opcional). estado fixo em "pendente".

**Indicadores**
- projecto* (combobox), nome_indicador* (texto ou select de sugestões: Desvio de custo, Desvio de prazo, IPC, Índice de segurança), tipo* (select: custo, prazo, qualidade, segurança), valor* (número), unidade (texto, ex.: %, dias, Kz), meta (número, opcional), data_referencia* (data, default hoje). Banner informativo no topo do modal: "Em produção este valor é calculado automaticamente a partir de outros registos — este formulário serve apenas para os dados de demonstração."

**Diário de obra**
- projecto* (combobox), data* (data, default hoje; validar contra os dados de exemplo que não exista já um registo do mesmo projecto+data e mostrar erro "Já existe um diário para esta data"), condições_meteorológicas (select: ensolarado, nublado, chuva, vento forte), efectivo_presente (número inteiro), actividades_realizadas (multi-select das Actividades do projecto, ou textarea livre), ocorrências (textarea, opcional). sincronizado fixo em true quando criado pelo painel web (nos dados de exemplo, incluir alguns registos com `sincronizado=false` para mostrar o badge "Pendente de sincronização", simulando origem no terreno).

**Projectos** (modal lg, com secções internas)
- Secção "Geral": nome* (texto), cliente (texto), morada (texto), área (combobox), gestor (combobox de Utilizadores).
- Secção "Datas": data_inicio* (data), data_fim_prevista* (data), data_fim_real (data, oculto/desabilitado na criação — só preenchível depois via edição, quando o projecto realmente terminar).
- Secção "Financeiro": orcamento_previsto (input monetário), orcamento_actual (input monetário, desabilitado na criação com nota "actualiza conforme despesas"), valor_contratual* (input monetário, com tooltip "(?)" explicando a diferença dos três campos).
- Secção "Estado": estado_geral* (select: planeamento, em execução, suspenso, cancelado — default planeamento). execucao_fisica_percentagem, execucao_financeira_percentagem e encerramento_administrativo NÃO aparecem neste modal — só existem depois de o projecto ter Actividades/Despesas, e vivem na página de detalhe.
- Nota no rodapé do modal: "Pode gerir acessos de utilizadores, actividades e restantes dados depois de criar o projecto."

## Modais de gestão de relações (abertos a partir de abas de detalhe, não do botão "+ Novo" principal)

São invocados de dentro do registo já existente (ex.: aba "Membros" da Equipa), são sempre modais sm, e não aparecem no menu nem têm listagem própria fora do contexto do registo pai:

- **Adicionar membro** (dentro de Equipa): utilizador* (combobox, exclui quem já é membro), função (texto), data_entrada* (data, default hoje), data_saida (data, opcional).
- **Adicionar participante** (dentro de Reunião): utilizador* (combobox), papel (texto, ex.: "convidado", "obrigatório"), presença (toggle, default por marcar até à reunião acontecer).
- **Adicionar acesso** (dentro da aba Acessos de Projecto): utilizador* (combobox, exclui quem já tem acesso), papel_no_projecto* (select: gestor, colaborador, fiscal, consulta).
- **Associar material a fornecedor** (dentro de Fornecedor): material* (combobox), preco* (input monetário), prazo_entrega_dias (número).
- **Registar pagamento** (dentro de Despesa, só visível se `estado_aprovacao = aprovada`): valor* (input monetário, pré-preenchido com o valor em falta da despesa, permite pagamento parcial), data_pagamento* (data, default hoje), metodo_pagamento* (select: transferência, dinheiro, cheque, outro), referencia (texto, opcional). estado fixo em "pago" ao submeter (fluxo simplificado: assume-se que o registo só é criado quando o pagamento já aconteceu).

## Checklist permanente (confirmar no fim de cada secção da ordem de execução)

- [ ] `percentagem_conclusao` de Actividade — ausente ou desabilitado nos modais de criação.
- [ ] `orcamento_actual` de Projecto — desabilitado na criação.
- [ ] `execucao_fisica_percentagem` e `execucao_financeira_percentagem` de Projecto — ausentes do modal; só na página de detalhe.
- [ ] `estado_aprovacao` de Despesa — fixo em "pendente", não editável na criação.
- [ ] estado de Pagamento — fixo em "pago" ao submeter, não é campo do modal.
- [ ] Nenhuma tabela de junção (membros, participantes, materiais por fornecedor, acessos por projecto) tem campo próprio dentro do modal da entidade principal — vive em modal sm invocado da aba de detalhe.

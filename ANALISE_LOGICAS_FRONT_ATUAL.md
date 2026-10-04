# Analise das logicas necessarias para o front actual

## Conclusao

O front actual ja esta bastante especificado e funcional em modo demonstracao: Inertia entrega as paginas, React mantem os dados em `SgoContext`, e os modais escrevem em memoria com validacao local, toasts, historico e filtros. Ao mesmo tempo, o Laravel ja tem uma base real pronta para muitos desses conceitos: modelos, migrations, policies, observer de despesas, activity log, notificacoes e testes de acesso.

A proxima etapa nao deve ser criar novos modulos nem mudar a direccao visual. Deve ser ligar, gradualmente, as folhas ja emitidas a logica persistente no Laravel, preservando o comportamento que o cliente ja ve hoje. Tudo o que aparece no indice sem rota activa, como financeiro completo, materiais, fornecedores, reunioes, decisoes, indicadores, relatorios e configuracoes, fica fora por enquanto.

## Ambito analisado

Folhas publicas:

- Inicio, Funcionalidades, Sobre, Contacto.
- Login e Registar continuam a existir no front, com Breeze por baixo.

Folhas do painel ja emitidas:

- Dashboard.
- Agenda.
- As minhas tarefas.
- Projectos e detalhe de projecto.
- Utilizadores.
- Areas.
- Equipas e detalhe de equipa.
- Actividades.
- Diario de obra.
- Fotografias.
- Documentos.

Fora do ambito por enquanto:

- Despesas, Pagamentos, Materiais, Requisicoes de materiais, Fornecedores.
- Reunioes, Decisoes, Indicadores, Relatorios, Configuracoes.
- Integracoes externas, email real, WhatsApp, Google, IA e sincronizacao real de rede.

## Logicas transversais a implementar

### Fonte de dados

- Substituir o estado em memoria por props Inertia vindas de controllers, mantendo o mesmo formato semântico usado hoje no front.
- Criar endpoints `store`, `update` e `destroy` apenas para as folhas ja emitidas.
- Manter os dados derivados no servidor quando forem regra de dominio, e no front apenas quando forem ordenacao, agrupamento ou apresentacao.
- Evitar duplicar regras: o que hoje vive em `SgoContext` deve migrar para models, policies, queries ou actions, conforme a responsabilidade.

### Autorizacao e visibilidade

- Usar as policies existentes para leitura, escrita, remocao e valores financeiros.
- A regra central e: administrador/proprietario ve tudo; outros utilizadores veem projectos via `projecto_user`.
- O selector "Ver como" deve continuar como afinidade de demonstracao. Se for mantido em producao, precisa de uma regra explicita de impersonacao ou simulacao controlada; se nao, deve filtrar pelo utilizador autenticado real.
- Toda query de projecto no painel deve passar pelo mesmo criterio de visibilidade.

### Formularios

- Migrar as validacoes dos modais para Form Requests ou validacao equivalente por endpoint.
- Continuar a devolver erros por campo, porque o front ja espera esse desenho.
- Preservar confirmacao de saida com alteracoes, estado "a guardar" e foco no primeiro campo invalido.
- Nos modais de criacao, manter campos calculados fora do formulario: execucao fisica, execucao financeira, horas reais, percentagens e estados derivados.

### Historico e auditoria

- Usar `spatie/laravel-activitylog` como fonte real do historico.
- Mapear os eventos para a forma usada pela aba Historico: quem criou, quando criou, campo alterado, valor anterior e novo valor.
- Nao criar historico para tudo indiscriminadamente; seguir as entidades ja visiveis no front: Projecto, Actividade, Tarefa, Documento, Diario de obra e, quando o modulo for emitido, Despesa/Pagamento/Decisao.

### Notificacoes

- A base real ja existe: tabela `notifications` padrao do Laravel (migration propria, colunas `uuid`, `data`, `read_at`), modelo `User` com `Notifiable` e o sino do front a consumir notificacoes em memoria. Falta apenas o controller (`NotificacaoController` esta stub) e as rotas de leitura/marcacao; o esforco e menor do que parece.
- Manter notificacoes in-app.
- Implementar leitura/marcacao como lida persistente via `markAsRead()`/`markAsUnread()` do Laravel sobre a tabela existente.
- So criar links para destinos com rota emitida. Enquanto o modulo nao existe, a notificacao deve continuar informativa, sem mandar para ecras vazios.

### Busca, filtros e ordenacao

- Para volumes pequenos, o front pode continuar a filtrar dados ja entregues.
- Quando houver persistencia real e listas maiores, mover busca, filtros principais e paginacao para queries no servidor.
- Garantir que busca global/topo nao revele projectos fora do acesso do utilizador efectivo.

## Logicas por folha ja emitida

### Contacto

- Validar nome, email, assunto e mensagem.
- Confirmar recepcao sem envio externo, enquanto integracoes estiverem fora do ambito.
- Quando email real for permitido, trocar a confirmacao simulada por envio assíncrono com fila.

### Login e sessao

- Manter Breeze como autenticacao real.
- `/admin/*` continua protegido por `auth`.
- `/dashboard` do Breeze nao deve voltar a ser o painel; o painel vive em `/admin/dashboard`.
- O selector "Ver como" nao deve alterar a sessao real.

### Dashboard

- Carregar apenas projectos visiveis ao utilizador efectivo.
- Calcular projectos activos por `estado_geral = em_execucao`.
- Calcular execucao fisica como media da percentagem das actividades do projecto.
- Calcular execucao financeira como despesas aprovadas do projecto divididas pelo valor contratual.
- Calcular tarefas pendentes e atrasadas dentro dos projectos visiveis.
- Calcular efectivo presente pelo ultimo diario de obra de cada projecto.
- Listar despesas pendentes de aprovacao apenas se o modulo financeiro ainda nao estiver emitido como detalhe navegavel.
- Ordenar e filtrar linhas sem perder as regras de acesso.

### Projectos

- Listar apenas projectos visiveis.
- Filtrar por estado geral, area e termo de busca.
- Calcular a janela temporal do projecto a partir de inicio, fim previsto e fim real.
- Validar criacao/edicao: nome, datas, valor contratual, montantes e coerencia entre inicio/fim.
- Guardar area, gestor, datas, orcamentos, valor contratual, estado geral e encerramento administrativo.
- Manter `orcamento_actual` como campo derivado de despesas quando o financeiro real estiver activo; por agora pode ser editavel apenas se a demonstracao exigir.
- Recalcular execucao fisica e financeira apos mudancas em actividades e despesas aprovadas.
- No detalhe, carregar resumo, actividades, tarefas, equipas, diario, fotografias, documentos e historico do projecto.
- Na aba Acessos, adicionar/remover utilizadores e alterar papel no projecto sem confundir com perfil global.
- O acesso por projecto vive no pivot `projecto_user` (colunas `papel`, unico por projecto+utilizador). As permissoes granulares de leitura, escrita e financeiro nao sao colunas separadas: derivam do enum `PapelProjecto` (`podeEscrever()` e `podeVerFinanceiro()`), consumido pela `ProjectoAwarePolicy`. O endpoint de acessos deve aceitar/expôr apenas o papel e deixar a derivação de permissões no servidor; nao desenhar campos read/write/financeiro independentes no formulario.
- Impedir a remocao perigosa do proprio acesso quando isso deixaria o utilizador sem caminho para a obra, salvo administrador/proprietario.

### Utilizadores

- Resolver a diferenca entre o modelo Breeze (`name`) e o front (`nome`) num recurso/mapper unico.
- Criar e editar nome, email, telefone, perfil e estado activo.
- Na criacao, gravar senha com hash e validacao de confirmacao.
- Na edicao, nao exigir senha se ela nao for alterada.
- Validar email unico.
- Utilizador inactivo deve sair de listas de escolha, mas manter historico e relacoes existentes.
- Mostrar contagem de projectos por acessos e papeis por projecto.

### Areas

- Criar e editar nome, descricao e responsavel.
- Validar nome obrigatorio e evitar duplicados relevantes.
- Responsavel deve ser utilizador activo, salvo quando se esta apenas a mostrar dados antigos.
- Calcular numero de projectos por area, projectos em execucao e areas sem responsavel.

### Equipas

- Criar e editar nome, especialidade, encarregado e projecto opcional.
- Permitir equipas sem obra, como o front ja indica.
- Evitar nomes duplicados dentro do mesmo projecto quando isso gerar ambiguidade.
- No detalhe, gerir membros pela tabela de juncao `equipa_membros`.
- Adicionar membro com utilizador, funcao, data de entrada e data de saida opcional.
- Retirar membro sem apagar historico: preencher `data_saida`.
- Mostrar tarefas ligadas a equipa.

### Agenda

- Listar eventos do utilizador efectivo.
- Filtrar por tipo e projecto.
- Alternar vista mes, semana e lista.
- Validar evento: titulo, tipo, inicio, fim nao anterior ao inicio, lembrete, projecto e tarefa opcional.
- Se evento tiver tarefa, garantir que a tarefa pertence ao projecto escolhido.
- Criar tarefa a partir de evento pre-preenchendo projecto, prazo e responsavel quando aplicavel.

### As minhas tarefas

- Listar tarefas atribuidas ao utilizador efectivo.
- Respeitar visibilidade de projectos.
- Filtrar por atrasadas, hoje, esta semana, todas e por projecto.
- Separar quadro por estado: pendente, em curso, concluida e atrasada.
- Validar tarefa: projecto, actividade, titulo, responsavel, prioridade, prazo e horas estimadas.
- Ao mudar projecto no formulario, limpar actividade e equipa dependentes.
- Horas reais e percentagem de conclusao nao devem nascer no modal de criacao.

### Actividades

- Listar actividades por projecto visivel.
- Permitir actividade pai apenas dentro do mesmo projecto.
- Validar datas previstas e percentagem conforme o fluxo.
- Na criacao, iniciar como `nao_iniciada` e percentagem zero.
- Derivar actividade atrasada quando o prazo passou e ela nao foi concluida.
- Calcular progresso do projecto a partir das actividades.
- Mostrar subactividades e tarefas associadas na ficha.
- Alimentar margem de revisao e historico.

### Diario de obra

- Listar diarios por projecto visivel.
- Validar unicidade por projecto e data.
- Guardar condicoes meteorologicas, efectivo presente, actividades realizadas, ocorrencias e registado por.
- Registos criados pelo painel nascem sincronizados.
- Registos vindos do terreno podem aparecer como pendentes de sincronizacao, mas sem logica real de rede nesta fase.
- Calcular ultimo diario por projecto para o Dashboard.

### Fotografias

- Listar fotografias por projecto visivel.
- Associar fotografia a projecto, diario ou tarefa.
- Se associada a diario ou tarefa, garantir coerencia com o projecto.
- Guardar descricao, data de captura, localizacao, autor e estado de sincronizacao.
- Upload real de ficheiro ainda deve ser tratado como proxima camada: por agora o front so precisa da ficha e da representacao visual.
- Manter badge de sincronizacao sem tentar simular rede.

### Documentos

- Associar documento a projecto, tarefa, despesa ou fornecedor, conforme o selector actual.
- Para tarefa ou despesa, derivar `projecto_id` a partir da entidade relacionada.
- Documento associado a fornecedor pode ficar sem projecto e nao deve aparecer na folha de documentos de uma obra.
- Validar tipo de documento, entidade relacionada e ficheiro.
- Reanexar o mesmo ficheiro no mesmo sitio deve aumentar a versao em vez de criar duplicado.
- Guardar upload por, data de criacao, tamanho e versao.
- Upload binario real pode ficar para a fase de storage; a logica de versao ja deve ser desenhada agora.

## Ponte tecnica recomendada

1. Criar recursos Inertia/DTOs para transformar models no formato actual do front.
2. Criar controllers por recurso emitido, usando rotas nomeadas e model binding quando houver registo real.
3. Migrar primeiro leituras do Dashboard e Projectos, porque elas concentram visibilidade, acessos e calculos.
4. Migrar depois os cadastros base: Utilizadores, Areas, Equipas e Acessos.
5. Migrar Agenda e Tarefas, preservando os filtros e dependencias de formulario.
6. Migrar Execucao: Actividades, Diario, Fotografias e Documentos.
7. Ligar historico real e notificacoes persistentes depois que as escritas principais estiverem no servidor.
8. So entao emitir os modulos ainda a lapis no indice.

## Riscos a controlar

- Divergencia entre `nome` no front e `name` no modelo `User`.
- Duplicacao de regras entre TypeScript e PHP durante a transicao.
- Calculos de execucao ficarem persistidos e desactualizados; sempre que possivel, recalcular por eventos de escrita ou query dedicada.
- Consultas sem escopo de acesso mostrarem projectos a quem nao deve ve-los.
- Historico gravar alteracoes irrelevantes quando o formulario reenviar valores iguais.
- Links de notificacao apontarem para modulos ainda nao emitidos.


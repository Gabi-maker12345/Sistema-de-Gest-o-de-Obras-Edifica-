/**
 * Tipos do SGO. A camada de dados e TypeScript + Context em memoria (D1):
 * nada disto e persistido, tudo vive durante a sessao.
 *
 * A ortografia e portuguesa europeia pre-AO: "projecto", "accao", "objectivo",
 * "aspecto", "director", "seleccao".
 */

/**
 * Perfil global do utilizador (spec §5, Utilizadores). O perfil e o mesmo em
 * todo o produto; o acesso a projectos especificos e o papel no projecto
 * (ver `PapelProjecto`), tratado na aba Acessos.
 */
export type PerfilUtilizador =
    | 'administrador_proprietario'
    | 'gestor'
    | 'colaborador_tecnico'
    | 'fiscal_responsavel_obra'
    | 'consulta';

/** Papel do utilizador dentro de um projecto especifico (aba Acessos). */
export type PapelProjecto = 'gestor' | 'colaborador' | 'fiscal' | 'consulta';

export type EstadoProjecto = 'planeamento' | 'em_execucao' | 'suspenso' | 'cancelado';

export type EstadoActividade = 'nao_iniciada' | 'em_curso' | 'concluida' | 'atrasada';

export type EstadoTarefa = 'pendente' | 'em_curso' | 'concluida' | 'atrasada';

export type PrioridadeTarefa = 'baixa' | 'media' | 'alta' | 'urgente';

export type EstadoAprovacao = 'pendente' | 'aprovada' | 'rejeitada';

export type EstadoPagamento = 'pendente' | 'pago';

export type TipoEvento = 'pessoal' | 'profissional' | 'obra';

export type CategoriaDespesa =
    | 'mao_de_obra'
    | 'material'
    | 'equipamento'
    | 'subcontratacao'
    | 'outro';

export type EstadoDecisao = 'pendente' | 'em_execucao' | 'concluida';

export type ImpactoDecisao = 'custo' | 'prazo' | 'ambito';

export type TipoIndicador = 'custo' | 'prazo' | 'qualidade' | 'seguranca';

export type TipoDocumento =
    | 'contrato'
    | 'licenca'
    | 'planta'
    | 'especificacao'
    | 'factura'
    | 'outro';

export interface Utilizador {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    perfil: PerfilUtilizador;
    activo: boolean;
    /** Preenchido em produccao; aqui identifica a origem do registo. */
    cargo?: string;
}

export interface AcessoProjecto {
    id: string;
    projectoId: string;
    utilizadorId: string;
    papel: PapelProjecto;
}

export interface Area {
    id: string;
    nome: string;
    descricao: string;
    responsavelId: string | null;
}

export interface Projecto {
    id: string;
    nome: string;
    cliente: string;
    morada: string;
    areaId: string | null;
    gestorId: string | null;
    dataInicio: string;
    dataFimPrevista: string;
    dataFimReal: string | null;
    /** Custo interno estimado. */
    orcamentoPrevisto: number | null;
    /** Custo interno real; actualiza com as despesas. */
    orcamentoActual: number | null;
    /** Valor acordado com o cliente. */
    valorContratual: number;
    estadoGeral: EstadoProjecto;
    encerramentoAdministrativo: boolean;
}

export interface Actividade {
    id: string;
    projectoId: string;
    actividadePaiId: string | null;
    nome: string;
    descricao: string;
    dataInicioPrevista: string;
    dataFimPrevista: string;
    dataInicioReal: string | null;
    dataFimReal: string | null;
    percentagemConclusao: number;
    estado: EstadoActividade;
}

export interface Tarefa {
    id: string;
    projectoId: string;
    actividadeId: string | null;
    equipaId: string | null;
    titulo: string;
    descricao: string;
    responsavelId: string;
    prioridade: PrioridadeTarefa;
    estado: EstadoTarefa;
    prazo: string;
    horasEstimadas: number | null;
    horasReais: number | null;
    percentagemConclusao: number;
}

export interface Equipa {
    id: string;
    projectoId: string | null;
    nome: string;
    especialidade: string;
    encarregadoId: string | null;
}

export interface MembroEquipa {
    equipaId: string;
    utilizadorId: string;
    funcao: string;
    dataEntrada: string;
    dataSaida: string | null;
}

export interface Despesa {
    id: string;
    /** Projecto e opcional: existem despesas pessoais e administrativas. */
    projectoId: string | null;
    categoria: CategoriaDespesa;
    descricao: string;
    valor: number;
    data: string;
    fornecedorId: string | null;
    estadoAprovacao: EstadoAprovacao;
    registadoPor: string;
    /** Badge de sincronizacao (spec §6). */
    sincronizado: boolean;
}

export interface Pagamento {
    id: string;
    despesaId: string;
    valor: number;
    dataPagamento: string;
    metodoPagamento: 'transferencia' | 'dinheiro' | 'cheque' | 'outro';
    referencia: string;
    estado: EstadoPagamento;
    aprovadoPor: string;
}

export interface EventoAgenda {
    id: string;
    utilizadorId: string;
    projectoId: string | null;
    tarefaId: string | null;
    titulo: string;
    descricao: string;
    tipo: TipoEvento;
    dataHoraInicio: string;
    dataHoraFim: string | null;
    local: string;
    lembreteMinutosAntes: number | null;
}

export interface DiarioObra {
    id: string;
    projectoId: string;
    data: string;
    condicoesMeteorologicas: 'ensolarado' | 'nublado' | 'chuva' | 'vento_forte';
    efectivoPresente: number;
    actividadesRealizadas: string[];
    ocorrencias: string;
    registadoPor: string;
    sincronizado: boolean;
}

export interface Fotografia {
    id: string;
    projectoId: string;
    diarioId: string | null;
    tarefaId: string | null;
    url: string;
    descricao: string;
    dataCaptura: string;
    localizacao: string;
    tiradaPor: string;
    sincronizado: boolean;
}

export interface DocumentoSgo {
    id: string;
    projectoId: string | null;
    tipoDocumento: TipoDocumento;
    nomeFicheiro: string;
    versao: number;
    tamanho: string;
    uploadPor: string;
    criadoEm: string;
}

export interface Fornecedor {
    id: string;
    nome: string;
    nif: string;
    morada: string;
    contacto: string;
    especialidade: string;
    avaliacao: number | null;
}

export interface Material {
    id: string;
    nome: string;
    categoria: string;
    unidadeMedida: 'un' | 'kg' | 'm' | 'm2' | 'm3' | 'l' | 'saco' | 'outro';
    precoReferencia: number | null;
}

export interface Reuniao {
    id: string;
    projectoId: string;
    titulo: string;
    tipo: 'obra' | 'cliente' | 'interna' | 'fornecedor';
    dataHora: string;
    local: string;
    convocadoPor: string;
    acta: string;
}

export interface ParticipanteReuniao {
    reuniaoId: string;
    utilizadorId: string;
    papel: string;
    presenca: boolean;
}

export interface Decisao {
    id: string;
    reuniaoId: string | null;
    projectoId: string;
    descricao: string;
    responsavelId: string;
    estado: EstadoDecisao;
    impacto: ImpactoDecisao;
    prazoImplementacao: string | null;
}

export interface Indicador {
    id: string;
    projectoId: string;
    nomeIndicador: string;
    valor: number;
    unidade: string;
    meta: number | null;
    tipo: TipoIndicador;
    dataReferencia: string;
}

export interface Notificacao {
    id: string;
    tipo: 'tarefa_atribuida' | 'despesa_aprovada' | 'despesa_rejeitada' | 'actividade_atrasada' | 'decisao_pendente';
    titulo: string;
    corpo: string;
    criadoEm: string;
    lida: boolean;
    /** Destino interno do registo relacionado. */
    ligacao: string;
}

/** Uma entrada da aba Historico: criacao ou alteracao de campo. */
export interface EntradaHistorico {
    id: string;
    /** Tipo de registo a que a entrada pertence (Projecto, Tarefa, …). */
    entidade: string;
    registoId: string;
    utilizadorId: string;
    criadoEm: string;
    /** `null` na criacao; `campo` + `de` + `para` nas alteracoes. */
    campo: string | null;
    de: string | null;
    para: string | null;
}

export interface EstadoSgo {
    utilizadores: Utilizador[];
    acessos: AcessoProjecto[];
    areas: Area[];
    projectos: Projecto[];
    actividades: Actividade[];
    tarefas: Tarefa[];
    equipas: Equipa[];
    membrosEquipa: MembroEquipa[];
    despesas: Despesa[];
    pagamentos: Pagamento[];
    eventos: EventoAgenda[];
    diarios: DiarioObra[];
    fotografias: Fotografia[];
    documentos: DocumentoSgo[];
    fornecedores: Fornecedor[];
    materiais: Material[];
    reunioes: Reuniao[];
    participantesReuniao: ParticipanteReuniao[];
    decisoes: Decisao[];
    indicadores: Indicador[];
    notificacoes: Notificacao[];
    historico: EntradaHistorico[];
}

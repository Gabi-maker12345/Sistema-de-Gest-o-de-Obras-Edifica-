import type {
    CategoriaDespesa,
    CondicaoMeteorologica,
    EstadoActividade,
    EstadoAprovacao,
    EstadoDecisao,
    EstadoPagamento,
    EstadoProjecto,
    EstadoTarefa,
    ImpactoDecisao,
    PapelProjecto,
    PerfilUtilizador,
    PrioridadeTarefa,
    TipoDocumento,
    TipoEvento,
    TipoIndicador,
} from '@/Data/types';

/**
 * Rotulos do produto. A interface fala a mesma lingua que a spec, e a
 * linguagem de valores e a que vive nos dados: `'em_execucao'` nunca aparece
 * escrito ao utilizador.
 */

const ROTULOS = {
    perfil: {
        administrador_proprietario: 'Administrador/Proprietário',
        gestor: 'Gestor',
        colaborador_tecnico: 'Colaborador/Técnico',
        fiscal_responsavel_obra: 'Fiscal/Responsável de Obra',
        consulta: 'Consulta',
    } satisfies Record<PerfilUtilizador, string>,

    papelProjecto: {
        gestor: 'Gestor',
        colaborador: 'Colaborador',
        fiscal: 'Fiscal',
        consulta: 'Consulta',
    } satisfies Record<PapelProjecto, string>,

    estadoProjecto: {
        planeamento: 'Planeamento',
        em_execucao: 'Em execução',
        suspenso: 'Suspenso',
        cancelado: 'Cancelado',
    } satisfies Record<EstadoProjecto, string>,

    estadoActividade: {
        nao_iniciada: 'Não iniciada',
        em_curso: 'Em curso',
        concluida: 'Concluída',
        atrasada: 'Atrasada',
    } satisfies Record<EstadoActividade, string>,

    estadoTarefa: {
        pendente: 'Pendente',
        em_curso: 'Em curso',
        concluida: 'Concluída',
        atrasada: 'Atrasada',
    } satisfies Record<EstadoTarefa, string>,

    prioridade: {
        baixa: 'Baixa',
        media: 'Média',
        alta: 'Alta',
        urgente: 'Urgente',
    } satisfies Record<PrioridadeTarefa, string>,

    /**
     * O céu do diário de obra, escrito como se diz em obra: quem lê o diário quer
     * saber se choveu, e «Chuva» é o que aconteceu enquanto «Nublado» só diz
     * que o céu estava tapado.
     */
    meteorologia: {
        ensolarado: 'Ensolarado',
        nublado: 'Nublado',
        chuva: 'Chuva',
        vento_forte: 'Vento forte',
    } satisfies Record<CondicaoMeteorologica, string>,

    estadoAprovacao: {
        pendente: 'Pendente',
        aprovada: 'Aprovada',
        rejeitada: 'Rejeitada',
    } satisfies Record<EstadoAprovacao, string>,

    estadoPagamento: {
        pendente: 'Pendente',
        pago: 'Pago',
    } satisfies Record<EstadoPagamento, string>,

    estadoDecisao: {
        pendente: 'Pendente',
        em_execucao: 'Em execução',
        concluida: 'Concluída',
    } satisfies Record<EstadoDecisao, string>,

    impactoDecisao: {
        custo: 'Custo',
        prazo: 'Prazo',
        ambito: 'Âmbito',
    } satisfies Record<ImpactoDecisao, string>,

    tipoEvento: {
        pessoal: 'Pessoal',
        profissional: 'Profissional',
        obra: 'Obra',
    } satisfies Record<TipoEvento, string>,

    categoriaDespesa: {
        mao_de_obra: 'Mão-de-obra',
        material: 'Material',
        equipamento: 'Equipamento',
        subcontratacao: 'Subcontratação',
        outro: 'Outro',
    } satisfies Record<CategoriaDespesa, string>,

    tipoDocumento: {
        contrato: 'Contrato',
        licenca: 'Licença',
        planta: 'Planta',
        especificacao: 'Especificação',
        factura: 'Factura',
        outro: 'Outro',
    } satisfies Record<TipoDocumento, string>,

    tipoIndicador: {
        custo: 'Custo',
        prazo: 'Prazo',
        qualidade: 'Qualidade',
        seguranca: 'Segurança',
    } satisfies Record<TipoIndicador, string>,
} as const;

/**
 * Todos os rotulos de estado do produto num so indice, porque os valores
 * internos se repetem entre dominios (`pendente` e `em_execucao` aparecem em
 * mais que um). `rotuloEstado` e o unico caminho de um valor interno ate ao
 * ecra: nenhum `Pages/` escreve um valor cru.
 */
const ROTULOS_ESTADO: Record<string, string> = Object.assign(
    {},
    ROTULOS.estadoProjecto,
    ROTULOS.estadoActividade,
    ROTULOS.estadoTarefa,
    ROTULOS.estadoAprovacao,
    ROTULOS.estadoDecisao,
    ROTULOS.estadoPagamento,
);

/**
 * Peso de traco por estado, segundo a regra das quatro codificacoes: o estado
 * le-se pelo peso, nunca so pela cor.
 *
 * - `firme` — atraso, erro e rejeicao. E o unico grupo que levanta o lapis
 *   vermelho, porque e o unico que o contrato reserva a essa cor.
 * - `medio` — estado vivo: pendente, em curso, suspenso. Ainda nao terminou e
 *   por isso merece mais peso que o contexto.
 * - `leve` — terminais e de leitura: concluida, aprovada, pago, cancelado,
 *   nao iniciada.
 */
const TRACO_POR_ESTADO: Record<string, 'firme' | 'medio' | 'leve'> = {
    atrasada: 'firme',
    atrasado: 'firme',
    rejeitada: 'firme',
    rejeitado: 'firme',

    pendente: 'medio',
    em_curso: 'medio',
    em_execucao: 'medio',
    suspenso: 'medio',

    concluida: 'leve',
    concluido: 'leve',
    aprovada: 'leve',
    aprovado: 'leve',
    pago: 'leve',
    cancelado: 'leve',
    nao_iniciada: 'leve',
};

export function rotuloEstado(estado: string): string {
    return ROTULOS_ESTADO[estado] ?? estado;
}

export function tracoEstado(estado: string): 'firme' | 'medio' | 'leve' {
    return TRACO_POR_ESTADO[estado] ?? 'medio';
}

/** Atraso, erro e rejeicao — o unico grupo que pode levantar o lapis vermelho. */
export function estadoEhCritico(estado: string): boolean {
    return tracoEstado(estado) === 'firme';
}

/**
 * Perfis com acesso total: veem e editam tudo, independentemente da lista de
 * acessos de cada projecto.
 */
export const PERFIS_COM_ACESSO_TOTAL: PerfilUtilizador[] = ['administrador_proprietario'];

export function rotuloPerfil(perfil: PerfilUtilizador): string {
    return ROTULOS.perfil[perfil];
}

export function rotuloPapel(papel: PapelProjecto): string {
    return ROTULOS.papelProjecto[papel];
}

export function temAcessoTotal(perfil: PerfilUtilizador): boolean {
    return PERFIS_COM_ACESSO_TOTAL.includes(perfil);
}

export { ROTULOS };

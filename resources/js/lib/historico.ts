import type { EntradaHistorico, EstadoSgo } from '@/Data/types';
import { data, moeda, numero, percentagem } from '@/lib/format';
import { ROTULOS, rotuloEstado } from '@/lib/rotulos';

/**
 * O histórico escrito de forma legível (spec §161).
 *
 * A entrada guarda o `campo` e os dois valores, e é a margem que decide como se
 * lê. Este módulo é o único sítio onde essa tradução existe: o rótulo do campo,
 * o valor na unidade em que se compara e a frase que junta os dois. Duas folhas
 * que traduzissem por conta própria escreviam a mesma alteração de duas maneiras,
 * e o histórico é a prova de que ninguém mexeu a mais — não pode ter duas
 * versões.
 */

/**
 * As colecções que têm histórico, com o nome que a spec lhes dá.
 *
 * São as sete entidades de §161 e nada mais. Uma coleção fora desta lista pode
 * ser corrigida à vontade sem deixar rasto: é o que se quer de um acesso ou de
 * uma equipa, onde o que interessa é o estado final e não a sequência.
 */
export const ENTIDADE_POR_COLECCAO: Record<string, string> = {
    projectos: 'Projecto',
    actividades: 'Actividade',
    tarefas: 'Tarefa',
    despesas: 'Despesa',
    pagamentos: 'Pagamento',
    documentos: 'Documento',
    decisoes: 'Decisão',
};

/**
 * Os rótulos dos campos, escritos como quem os leria na folha.
 *
 * A chave é o campo sem sublinhados e em minúsculas, para que `data_fim_prevista`
 * vindo do seed e `dataFimPrevista` vindo do formulário caiam no mesmo sítio.
 */
const ROTULO_CAMPO: Record<string, string> = {
    // Projecto
    nome: 'Nome',
    cliente: 'Cliente',
    morada: 'Morada',
    estado: 'Estado',
    estadogeral: 'Estado geral',
    datainicio: 'Início',
    datafim: 'Fim',
    datafimprevista: 'Fim previsto',
    datafimreal: 'Fim real',
    orcamentoprevisto: 'Orçamento previsto',
    orcamentoactual: 'Orçamento actual',
    valorcontratual: 'Valor contratual',
    encerramentoadministrativo: 'Encerramento administrativo',

    // Actividade
    descricao: 'Descrição',
    actividade: 'Actividade',
    actividadepai: 'Actividade pai',
    datainicioprevista: 'Início previsto',
    datainicioreal: 'Início real',
    percentagemconclusao: 'Conclusão',

    // Tarefa
    titulo: 'Título',
    responsavel: 'Responsável',
    equipa: 'Equipa',
    prioridade: 'Prioridade',
    prazo: 'Prazo',
    horasestimadas: 'Horas estimadas',
    horasreais: 'Horas reais',

    // Documento
    nomeficheiro: 'Ficheiro',
    tipodocumento: 'Tipo de documento',
    versao: 'Versão',
    tamanho: 'Tamanho',

    // Despesa e Pagamento
    categoria: 'Categoria',
    valor: 'Valor',
    fornecedor: 'Fornecedor',
    estadoaprovacao: 'Aprovação',
    datapagamento: 'Data de pagamento',
    metodopagamento: 'Método de pagamento',
    referencia: 'Referência',
    impacto: 'Impacto',
    datareferencia: 'Data de referência',

    // Entidades com o mesmo campo de nome
    data: 'Data',
    unidade: 'Unidade',
    meta: 'Meta',
};

const CAMPOS_MONEY = new Set([
    'valor',
    'valorcontratual',
    'orcamentoprevisto',
    'orcamentoactual',
    'precoreferencia',
    'precounitario',
]);

const CAMPOS_ENUM: Record<string, Record<string, string>> = {
    prioridade: ROTULOS.prioridade,
    impacto: ROTULOS.impactoDecisao,
    tipodocumento: ROTULOS.tipoDocumento,
    categoria: ROTULOS.categoriaDespesa,
    metodopagamento: ROTULOS.metodoPagamento,
    unidade: ROTULOS.unidadeMedida,
};

function chave(campo: string): string {
    return campo.toLowerCase().replace(/[_\s]/g, '');
}

/** `data_fim_prevista` → «Fim previsto»; `fieldUnknown` → «Field unknown». */
export function rotuloCampo(campo: string): string {
    return ROTULO_CAMPO[chave(campo)] ?? humanizar(campo);
}

/**
 * O rótulo de um campo que a tabela não conhece.
 *
 * Só é um reduto: uma coluna nova entra na tabela com o nome que o desenho lhe
 * dá, não com o nome que a máquina tirou do código.
 */
function humanizar(campo: string): string {
    const partes = campo
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .split(/[_\s]+/)
        .filter(Boolean);

    if (partes.length === 0) {
        return campo;
    }

    const [primeira, ...resto] = partes;

    return [primeira.charAt(0).toUpperCase() + primeira.slice(1), ...resto].join(' ');
}

/**
 * A alteração, escrita como se lê: `Fim previsto: 14/10/2026 → 02/12/2026`.
 *
 * Um valor que não mudou de facto não entra: a entrada que diz que o campo foi
 * gravado com o que já tinha não é uma alteração, é um clique.
 */
export function dePara(de: string | null, para: string | null): string {
    if (de === null && para === null) {
        return 'actualizado';
    }

    if (de === null) {
        return `passou a ${para}`;
    }

    if (para === null) {
        return `passou de ${de} a vazio`;
    }

    return `${de} → ${para}`;
}

/** A letra da revisão: a primeira entrada é `A`, a segunda `B`, e assim por diante. */
export function revisaoDe(posicao: number): string {
    return posicao < 26
        ? String.fromCharCode(65 + posicao)
        : `${posicao + 1}`;
}

/** Quem fez. Um utilizador que já não existe ainda fez: o rasto não se apaga. */
export function utilizadorDe(estado: EstadoSgo, id: string): string {
    return (
        estado.utilizadores.find((utilizador) => utilizador.id === id)?.nome ??
        'Utilizador removido'
    );
}

/**
 * O valor de um campo na unidade em que se compara.
 *
 * Duas decisões que evitam o histórico enganador: um identificador escreve-se
 * pelo nome de quem é (`u3` → «Nuno Domingos Ferreira») e não pela chave, e um
 * valor vazio escreve-se como vazio e não como `—`. Um traço em `de` e em `para`
 * diria que o campo passou a não ter valor quando passou a ter.
 */
export function descreverValor(
    estado: EstadoSgo,
    campo: string,
    valor: unknown,
): string | null {
    if (valor === null || valor === undefined || valor === '') {
        return null;
    }

    const nome = chave(campo);
    const pessoa = utilizadorDe(estado, String(valor));

    /**
     * O valor de quem o campo aponta, escrito pelo nome de quem é.
     *
     * As chaves não levam o `Id`: o formulário escreve `responsavelId` e o seed
     * `responsavel_id`, e as duas formas têm de dar a mesma pessoa. Por isso a
     * chave normalizada é procurada tal como está e depois sem o sufixo — sem
     * isso, `u3` chegava à margem tal como sai do registo, que é exactamente o
     * que o histórico não pode fazer.
     */
    const relacionados: Record<string, string> = {
        responsavel: pessoa,
        registadopor: pessoa,
        aprovadopor: pessoa,
        convocado: pessoa,
        uploadpor: pessoa,
        ficheiropor: pessoa,
        tiradapor: pessoa,
        encarregado: pessoa,
        fornecedor: estado.fornecedores.find((f) => f.id === valor)?.nome ?? 'Fornecedor removido',
        equipa: estado.equipas.find((e) => e.id === valor)?.nome ?? 'Equipa removida',
        actividade:
            estado.actividades.find((a) => a.id === valor)?.nome ?? 'Actividade removida',
        actividadepai:
            estado.actividades.find((a) => a.id === valor)?.nome ?? 'Actividade removida',
        projecto: estado.projectos.find((p) => p.id === valor)?.nome ?? 'Projecto removido',
        area: estado.areas.find((a) => a.id === valor)?.nome ?? 'Área removida',
        entidaderelacionada: String(valor),
    };

    const semSufixo = nome.endsWith('id') ? nome.slice(0, -'id'.length) : nome;
    const relacionado = relacionados[nome] ?? relacionados[semSufixo];

    if (relacionado !== undefined) {
        return relacionado;
    }

    if (nome.startsWith('data') || nome === 'prazo') {
        return data(valor as string);
    }

    if (CAMPOS_MONEY.has(nome)) {
        return moeda(valor as number);
    }

    if (nome === 'versao') {
        return `v${valor}`;
    }

    if (nome.includes('percentagem')) {
        return percentagem(valor as number);
    }

    if (nome.includes('horas')) {
        return `${numero(valor as number)}h`;
    }

    if (typeof valor === 'boolean') {
        return valor ? 'Sim' : 'Não';
    }

    if (nome === 'estado' || nome === 'estadogeral' || nome === 'estadoaprovacao') {
        return rotuloEstado(String(valor));
    }

    if (CAMPOS_ENUM[nome] !== undefined) {
        return CAMPOS_ENUM[nome][String(valor)] ?? String(valor);
    }

    return typeof valor === 'number' ? numero(valor) : String(valor);
}

/** Uma entrada com a letra da revisão que lhe corresponde. */
export interface EntradaRevisao extends EntradaHistorico {
    revisao: string;
}

/**
 * As revisões de um registo, da mais recente para a mais antiga.
 *
 * A letra é atribuída pela ordem em que as entradas foram escritas, não pela
 * ordem em que são mostradas: a primeira coisa que aconteceu é `A` mesmo
 * apareça em último. Sem esta inversão, a margem marcaria a criação com a letra
 * de quem a stilizou, e o registo teria duas cronologias.
 *
 * A criação pode vir do próprio registo e não da lista — um documento sabe
 * quando e por quem foi anexado, e repetir esse facto numa segunda lista seria
 * guardá-lo duas vezes para poder divergir.
 */
export function revisoesDoRegisto(
    estado: EstadoSgo,
    entidade: string,
    registoId: string,
    criacao?: { utilizadorId: string; criadoEm: string } | null,
): EntradaRevisao[] {
    const doEstado = estado.historico.filter(
        (entrada) => entrada.entidade === entidade && entrada.registoId === registoId,
    );

    const doRegisto: EntradaHistorico[] =
        criacao !== undefined &&
        criacao !== null &&
        !doEstado.some((entrada) => entrada.campo === null)
            ? [
                  {
                      id: 'criacao',
                      entidade,
                      registoId,
                      utilizadorId: criacao.utilizadorId,
                      criadoEm: criacao.criadoEm,
                      campo: null,
                      de: null,
                      para: null,
                  },
              ]
            : [];

    return [...doEstado, ...doRegisto]
        .sort((a, b) => a.criadoEm.localeCompare(b.criadoEm))
        .map((entrada, posicao) => ({ ...entrada, revisao: revisaoDe(posicao) }))
        .reverse();
}

/**
 * A entrada de criação de um registo, ou `null` quando a colecção não tem
 * histórico.
 */
export function entradaDeCriacao(
    coleccao: string,
    registo: { id: string },
    utilizadorId: string,
    momento: string,
): EntradaHistorico | null {
    const entidade = ENTIDADE_POR_COLECCAO[coleccao];

    if (entidade === undefined) {
        return null;
    }

    return {
        id: `h-${momento}-${registo.id}`,
        entidade,
        registoId: registo.id,
        utilizadorId,
        criadoEm: momento,
        campo: null,
        de: null,
        para: null,
    };
}

/**
 * As entradas de uma correcção: uma por campo que mudou mesmo.
 *
 * Os segundos de cada entrada sobem um a um para que os campos corrigidos na
 * mesma gravação fiquem ordenados como foram gravados. Sem isso, cinco campos
 * alterados no mesmo instante teriam todos a mesma hora e a ordem dentro da
 * margem seria a ordem do motor.
 */
export function entradasDeAlteracao(
    estado: EstadoSgo,
    coleccao: string,
    registo: Record<string, unknown>,
    alteracoes: Record<string, unknown>,
    utilizadorId: string,
    momento: string,
): EntradaHistorico[] {
    const entidade = ENTIDADE_POR_COLECCAO[coleccao];

    if (entidade === undefined) {
        return [];
    }

    const instante = new Date(momento).getTime();

    return Object.entries(alteracoes)
        .filter(([campo]) => campo !== 'id')
        .filter(([campo, novo]) => !iguais(registo[campo], novo))
        .map(([campo, novo], posicao) => ({
            id: `h-${momento}-${registo.id as string}-${campo}`,
            entidade,
            registoId: registo.id as string,
            utilizadorId,
            // Um segundo por campo corrigido: a ordem dentro da mesma gravação é
            // a ordem em que os campos aparecem no formulário.
            criadoEm: new Date(instante + posicao * 1000).toISOString(),
            campo,
            de: descreverValor(estado, campo, registo[campo]),
            para: descreverValor(estado, campo, novo),
        }));
}

function iguais(a: unknown, b: unknown): boolean {
    if (a === b) {
        return true;
    }

    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
        return false;
    }

    return JSON.stringify(a) === JSON.stringify(b);
}
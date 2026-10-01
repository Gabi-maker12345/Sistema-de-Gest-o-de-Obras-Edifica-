import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { criarEstadoInicial } from '@/Data/seed';
import type {
    AcessoProjecto,
    Actividade,
    Despesa,
    EstadoSgo,
    MembroEquipa,
    Projecto,
    Utilizador,
} from '@/Data/types';
import { temAcessoTotal } from '@/lib/rotulos';

/**
 * A camada de dados do SGO: TypeScript + Context, tudo em memória (D1).
 * Não há base de dados, nem migrations, nem seeders, nem persistência — o que
 * se cria durante a sessão vive até ao fim da sessão.
 *
 * A selector "Ver como" (D5) vive aqui: troca o utilizador *efectivo* usado
 * para filtrar projectos, sem tocar na sessão real do Breeze.
 */

/**
 * Colecções que aceitam criação, edição e eliminação durante a sessão.
 *
 * `utilizadores` e `acessos` entram na fase 3 (cadastros base): um utilizador
 * criado na folha passa a existir no selector «Ver como» e um acesso criado na
 * aba Acessos passa a filtrar a lista de projectos do perfil que o tem — que é
 * exactamente o que a aba promete. `notificacoes` e `historico` ficam de fora:
 * nenhum ecrã os escreve, são leitura.
 */
export type NomeColeccao = Exclude<keyof EstadoSgo, 'notificacoes' | 'historico'>;

interface ContextoSgo {
    estado: EstadoSgo;
    utilizadores: Utilizador[];
    projectos: Projecto[];
    actividades: Actividade[];
    despesas: Despesa[];

    /** Identificador do utilizador que o selector "Ver como" está a simular. */
    verComoId: string;
    utilizadorEfectivo: Utilizador;
    /** Perfil do utilizador efectivo — decide o que ele vê. */
    perfilEfectivo: Utilizador['perfil'];

    definirVerComo: (id: string) => void;
    /** Verdadeiro quando o utilizador efectivo vê todos os projectos. */
    veTodosOsProjectos: boolean;
    /** Projectos visíveis para o utilizador efectivo, pela aba Acessos. */
    projectosVisiveis: Projecto[];
    papelEmProjecto: (projectoId: string) => AcessoProjecto['papel'] | null;

    /** Execução física: média da % de conclusão das Actividades do projecto. */
    execucaoFisica: (projectoId: string) => number;
    /** Execução financeira: despesas aprovadas ÷ valor contratual × 100. */
    execucaoFinanceira: (projectoId: string) => number;
    /** Soma das despesas aprovadas do projecto. */
    despesasAprovadas: (projectoId: string) => number;

    criar: <N extends NomeColeccao>(coleccao: N, registo: EstadoSgo[N][number]) => void;
    actualizar: <N extends NomeColeccao>(
        coleccao: N,
        id: string,
        alteracoes: Partial<EstadoSgo[N][number]>,
    ) => void;
    eliminar: <N extends NomeColeccao>(coleccao: N, id: string) => void;

    /**
     * Substitui a lista de membros de uma equipa.
     *
     * `membrosEquipa` não é uma colecção de registos com `id`: a chave é o par
     * equipa/utilizador. Por isso não passa por `actualizar` nem por `eliminar`,
     * que trabalham por `id`. A equipa continua a ser o registo que se cria e se
     * corrige; os seus membros entram e saem por aqui.
     */
    definirMembros: (equipaId: string, membros: MembroEquipa[]) => void;

    /** Marca uma notificação como lida. */
    marcarNotificacaoLida: (id: string) => void;
}

const Contexto = createContext<ContextoSgo | null>(null);

/** O utilizador com que o painel arranca, antes de o selector mudar. */
const VER_COMO_POR_DEFEITO = 'u1';

/** O perfil com que a folha abre: dá para voltar a ele a partir do selector. */
export const PERFIL_INICIAL = VER_COMO_POR_DEFEITO;

export function ProvedorSgo({ children }: { children: ReactNode }) {
    const [estado, definirEstado] = useState<EstadoSgo>(criarEstadoInicial);
    const [verComoId, definirVerComo] = useState(VER_COMO_POR_DEFEITO);

    const utilizadorEfectivo = useMemo<Utilizador>(
        () =>
            estado.utilizadores.find((utilizador) => utilizador.id === verComoId) ??
            estado.utilizadores[0],
        [estado.utilizadores, verComoId],
    );

    const veTodosOsProjectos = temAcessoTotal(utilizadorEfectivo.perfil);

    const projectosVisiveis = useMemo(() => {
        if (veTodosOsProjectos) {
            return estado.projectos;
        }

        const ids = new Set(
            estado.acessos
                .filter((acesso) => acesso.utilizadorId === utilizadorEfectivo.id)
                .map((acesso) => acesso.projectoId),
        );

        return estado.projectos.filter((projecto) => ids.has(projecto.id));
    }, [estado.projectos, estado.acessos, utilizadorEfectivo.id, veTodosOsProjectos]);

    const papelEmProjecto = useCallback(
        (projectoId: string) =>
            estado.acessos.find(
                (acesso) =>
                    acesso.projectoId === projectoId &&
                    acesso.utilizadorId === utilizadorEfectivo.id,
            )?.papel ?? null,
        [estado.acessos, utilizadorEfectivo.id],
    );

    const despesasAprovadas = useCallback(
        (projectoId: string) =>
            estado.despesas
                .filter(
                    (despesa) =>
                        despesa.projectoId === projectoId && despesa.estadoAprovacao === 'aprovada',
                )
                .reduce((total, despesa) => total + despesa.valor, 0),
        [estado.despesas],
    );

    const execucaoFisica = useCallback(
        (projectoId: string) => {
            const doProjecto = estado.actividades.filter(
                (actividade) => actividade.projectoId === projectoId,
            );

            if (doProjecto.length === 0) {
                return 0;
            }

            const soma = doProjecto.reduce(
                (total, actividade) => total + actividade.percentagemConclusao,
                0,
            );

            return soma / doProjecto.length;
        },
        [estado.actividades],
    );

    const execucaoFinanceira = useCallback(
        (projectoId: string) => {
            const projecto = estado.projectos.find((p) => p.id === projectoId);

            if (!projecto || projecto.valorContratual <= 0) {
                return 0;
            }

            return (despesasAprovadas(projectoId) / projecto.valorContratual) * 100;
        },
        [despesasAprovadas, estado.projectos],
    );

    const criar = useCallback(
        <N extends NomeColeccao>(coleccao: N, registo: EstadoSgo[N][number]) => {
            definirEstado((actual) => {
                const lista = actual[coleccao] as unknown[];

                return {
                    ...actual,
                    [coleccao]: [registo, ...lista],
                } as EstadoSgo;
            });
        },
        [],
    );

    const actualizar = useCallback(
        <N extends NomeColeccao>(
            coleccao: N,
            id: string,
            alteracoes: Partial<EstadoSgo[N][number]>,
        ) => {
            definirEstado((actual) => {
                const lista = actual[coleccao] as Array<{ id: string }>;

                return {
                    ...actual,
                    [coleccao]: lista.map((registo) =>
                        registo.id === id ? { ...registo, ...alteracoes } : registo,
                    ),
                } as EstadoSgo;
            });
        },
        [],
    );

    const eliminar = useCallback(<N extends NomeColeccao>(coleccao: N, id: string) => {
        definirEstado((actual) => {
            const lista = actual[coleccao] as Array<{ id: string }>;

            return {
                ...actual,
                [coleccao]: lista.filter((registo) => registo.id !== id),
            } as EstadoSgo;
        });
    }, []);

    const definirMembros = useCallback((equipaId: string, membros: MembroEquipa[]) => {
        definirEstado((actual) => ({
            ...actual,
            membrosEquipa: [
                ...actual.membrosEquipa.filter((membro) => membro.equipaId !== equipaId),
                ...membros.filter((membro) => membro.equipaId === equipaId),
            ],
        }));
    }, []);

    const marcarNotificacaoLida = useCallback((id: string) => {
        definirEstado((actual) => ({
            ...actual,
            notificacoes: actual.notificacoes.map((notificacao) =>
                notificacao.id === id ? { ...notificacao, lida: true } : notificacao,
            ),
        }));
    }, []);

    const valor = useMemo<ContextoSgo>(
        () => ({
            estado,
            utilizadores: estado.utilizadores,
            projectos: estado.projectos,
            actividades: estado.actividades,
            despesas: estado.despesas,
            verComoId: utilizadorEfectivo.id,
            utilizadorEfectivo,
            perfilEfectivo: utilizadorEfectivo.perfil,
            definirVerComo,
            veTodosOsProjectos,
            projectosVisiveis,
            papelEmProjecto,
            execucaoFisica,
            execucaoFinanceira,
            despesasAprovadas,
            criar,
            actualizar,
            eliminar,
            definirMembros,
            marcarNotificacaoLida,
        }),
        [
            estado,
            utilizadorEfectivo,
            veTodosOsProjectos,
            projectosVisiveis,
            papelEmProjecto,
            execucaoFisica,
            execucaoFinanceira,
            despesasAprovadas,
            criar,
            actualizar,
            eliminar,
            definirMembros,
            marcarNotificacaoLida,
        ],
    );

    return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSgo(): ContextoSgo {
    const contexto = useContext(Contexto);

    if (!contexto) {
        throw new Error('useSgo tem de ser usado dentro de <ProvedorSgo>.');
    }

    return contexto;
}

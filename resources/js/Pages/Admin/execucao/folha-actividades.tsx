import { useMemo, useState } from 'react';

import { BotaoLimpar } from '@/Components/brand/botao-limpar';
import { useOrdem } from '@/Components/brand/cabecalho-cota';
import { useBusca } from '@/Components/brand/contexto-busca';
import { FolhaRegistos } from '@/Components/brand/folha-registos';
import { EstadoSelo } from '@/Components/ui/badge';
import { Botao } from '@/Components/ui/button';
import { Medidor } from '@/Components/ui/progress';
import { useSgo } from '@/Data/SgoContext';
import type { Actividade } from '@/Data/types';
import { data, normalizar } from '@/lib/format';
import { cn } from '@/lib/utils';

import { ModalActividade } from '../ModalActividade';

/**
 * As actividades de um projecto.
 *
 * A lista é uma árvore, não uma lista: a spec (Actividades) permite
 * `actividade_pai`, e uma actividade que existe para servir outra tem de aparecer
 * dentro dela. Por isso as filhas descem indentadas com uma régua lateral e não
 * como linhas iguais — o nível faz parte do significado.
 *
 * As filhas seguem sempre a sua mãe, mesmo quando se ordena: uma obra ordenada
 * por fim previsto, mas com as subactividades soltas pelo fim do ficheiro, não
 * é uma obra ordenada. Só as actividades de topo obedecem à coluna escolhida.
 *
 * A percentagem mostrada é a que o registo traz. A spec diz que a percentagem de
 * uma actividade se actualiza conforme as tarefas, e o Context calcula-a ao
 * fechar tarefas; aqui só se lê esse valor. Recalcular a média aqui repetiria a
 * regra noutro sítio, e as duas médias divergiriam no primeiro caso em que uma
 * actividade tem filhas com tarefas e a mãe não tem nenhuma.
 */
export function FolhaActividades({
    projectoId,
    className,
}: {
    projectoId: string;
    className?: string;
}) {
    const { estado } = useSgo();
    const { termo, limpar } = useBusca();
    const { ordem, alternar, ordenar } = useOrdem<Actividade>(COLUNAS, 'nome');
    // A obra já está escolhida nesta folha, por isso a ficha de criação abre com o
    // projecto preenchido e bloqueado — que é o que a spec pede para a actividade
    // nascida aqui.
    const [fichaAberta, definirFichaAberta] = useState(false);

    const actividades = useMemo(
        () => estado.actividades.filter((actividade) => actividade.projectoId === projectoId),
        [estado.actividades, projectoId],
    );

    const tarefas = useMemo(
        () => estado.tarefas.filter((tarefa) => tarefa.projectoId === projectoId),
        [estado.tarefas, projectoId],
    );

    const visiveis = useMemo(() => {
        const alvo = normalizar(termo.trim());

        return actividades.filter((actividade) => {
            if (alvo.length === 0) {
                return true;
            }

            return normalizar(
                `${actividade.nome} ${actividade.descricao}`,
            ).includes(alvo);
        });
    }, [actividades, termo]);

    const linhas = useMemo(() => {
        const topo = ordenar(visiveis.filter((actividade) => actividade.actividadePaiId === null));

        return topo.flatMap((actividade) => [
            actividade,
            ...visiveis.filter((filha) => filha.actividadePaiId === actividade.id),
        ]);
    }, [visiveis, ordenar]);

    const totalTarefas = tarefas.length;
    const concluidas = actividades.filter((actividade) => actividade.estado === 'concluida').length;

    return (
        <>
            <FolhaRegistos<Actividade>
                titulo="Actividades"
                accoes={
                    <Botao
                        variante="primario"
                        tamanho="sm"
                        onClick={() => definirFichaAberta(true)}
                    >
                        + Nova actividade
                    </Botao>
                }
            contagem={
                termo.trim().length > 0 ? (
                    <BotaoLimpar aoLimpar={limpar} />
                ) : (
                    <span>
                        {actividades.length} actividades · {concluidas} concluídas ·{' '}
                        {totalTarefas} tarefas
                    </span>
                )
            }
            ordem={ordem}
            alternar={alternar}
            colunas={COLUNAS}
            grelha="grid-cols-[minmax(0,1fr)_140px_88px_132px]"
            linhas={linhas}
            chaveDe={(actividade) => actividade.id}
            vazio={
                termo.trim().length > 0
                    ? 'Nenhuma actividade corresponde a esta busca.'
                    : 'Este projecto ainda não tem actividades registadas.'
            }
            className={className}
        >
            {(actividade) => {
                const filhas = actividades.filter(
                    (outra) => outra.actividadePaiId === actividade.id,
                );
                const tarefasDaActividade = tarefas.filter(
                    (tarefa) => tarefa.actividadeId === actividade.id,
                );
                const concluidasDaActividade = tarefasDaActividade.filter(
                    (tarefa) => tarefa.estado === 'concluida',
                ).length;

                return (
                    <div
                        className={cn(
                            'grid grid-cols-1 gap-2 px-3 py-3 md:grid-cols-[minmax(0,1fr)_140px_88px_132px] md:items-center md:gap-3',
                            actividade.actividadePaiId !== null && 'border-l-2 border-graphite-20 pl-5',
                        )}
                    >
                        <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <p
                                    className={cn(
                                        'truncate text-sm',
                                        actividade.actividadePaiId === null
                                            ? 'font-medium text-graphite'
                                            : 'text-graphite-64',
                                    )}
                                >
                                    {actividade.nome}
                                </p>
                                <EstadoSelo estado={actividade.estado} tamanho="sm" />
                            </div>

                            {actividade.descricao.length > 0 && (
                                <p className="line-clamp-2 text-xs text-graphite-64">
                                    {actividade.descricao}
                                </p>
                            )}

                            <p className="cota">
                                {filhas.length > 0 &&
                                    `${filhas.length} subactividade${filhas.length === 1 ? '' : 's'} · `}
                                {tarefasDaActividade.length === 0
                                    ? 'sem tarefas'
                                    : `${concluidasDaActividade}/${tarefasDaActividade.length} tarefas fechadas`}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Medidor valor={actividade.percentagemConclusao} className="flex-1" />
                            <span className="cota w-8 text-right tabular">
                                {Math.round(actividade.percentagemConclusao)}%
                            </span>
                        </div>

                        <p className="cota md:text-right">{data(actividade.dataInicioPrevista)}</p>

                        <p className="cota md:text-right">{leituraFim(actividade)}</p>
                    </div>
                );
            }}
            </FolhaRegistos>

            <ModalActividade
                aberto={fichaAberta}
                actividade={null}
                comProjecto={projectoId}
                aoFechar={() => definirFichaAberta(false)}
            />
        </>
    );
}

const COLUNAS = [
    {
        chave: 'nome',
        cota: 'Actividade',
        valor: (actividade: Actividade) => actividade.nome,
    },
    { chave: 'progresso', cota: 'Progresso', alinhamento: 'direita' as const },
    { chave: 'inicio', cota: 'Início', alinhamento: 'direita' as const },
    { chave: 'fim', cota: 'Fim', alinhamento: 'direita' as const },
];

/**
 * A coluna do fim escreve o que aconteceu, não a data que estava prevista. Uma
 * actividade terminada há dias repete «Previsto» em todas as linhas da obra e a
 * coluna deixa de distinguir uma coisa da outra.
 */
function leituraFim(actividade: Actividade): string {
    if (actividade.estado === 'concluida' && actividade.dataFimReal !== null) {
        return data(actividade.dataFimReal);
    }

    return data(actividade.dataFimPrevista);
}

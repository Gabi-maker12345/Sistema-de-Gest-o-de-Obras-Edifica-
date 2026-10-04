import { useMemo, useState } from 'react';

import { useOrdem } from '@/Components/brand/cabecalho-cota';
import { useBusca } from '@/Components/brand/contexto-busca';
import { FiltroChip, FiltrosFolha } from '@/Components/brand/filtros-folha';
import { FolhaRegistos } from '@/Components/brand/folha-registos';
import { EstadoSelo } from '@/Components/ui/badge';
import { Botao } from '@/Components/ui/button';
import { TextoLongo } from '@/Components/brand/texto-longo';
import { useSgo } from '@/Data/SgoContext';
import type { Tarefa } from '@/Data/types';
import { data, normalizar } from '@/lib/format';
import { diaDe, chaveDia } from '@/lib/agenda';
import { ROTULOS } from '@/lib/rotulos';
import { cn } from '@/lib/utils';

import { ModalTarefa } from '../ModalTarefa';

import { BotaoLimpar } from '@/Components/brand/botao-limpar';

/**
 * As tarefas do projecto, com filtro por actividade.
 *
 * O filtro por actividade é a leitura que o gestor faz: a actividade é o que
 * ele procura, e a pergunta «o que está atrasado na fase da electricidade?» não
 * se deixa responder por uma lista de quarenta linhas. O projecto é fixo — quem
 * está aqui já está dentro de uma obra — por isso o filtro é só a actividade.
 *
 * A ordenação começa por prazo a subir. Uma lista de tarefas ordenada pelo nome
 * obriga a ler tudo para achar a urgente; ordenada pelo prazo, a primeira linha
 * é a primeira a resolver.
 */
export function FolhaTarefas({
    projectoId,
    className,
}: {
    projectoId: string;
    className?: string;
}) {
    const { estado } = useSgo();
    const { termo, limpar } = useBusca();
    const [actividadeId, definirActividade] = useState<string | null>(null);
    // A obra e, se houver uma, a actividade que o filtro já está a mostrar:
    // abrir «+ Nova tarefa» a partir de uma actividade nascida com ela.
    const [fichaAberta, definirFichaAberta] = useState(false);
    const { ordem, alternar, ordenar } = useOrdem<Tarefa>(COLUNAS, 'prazo');

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

        return tarefas.filter((tarefa) => {
            if (actividadeId !== null && tarefa.actividadeId !== actividadeId) {
                return false;
            }

            if (alvo.length === 0) {
                return true;
            }

            return normalizar(`${tarefa.titulo} ${tarefa.descricao}`).includes(alvo);
        });
    }, [tarefas, actividadeId, termo]);

    const linhas = useMemo(() => ordenar(visiveis), [visiveis, ordenar]);

    const atrasadas = linhas.filter(emAtraso);
    const abertas = linhas.filter((tarefa) => tarefa.estado !== 'concluida');

    const limparFiltros = () => {
        definirActividade(null);
        limpar();
    };

    return (
        <div className={cn('space-y-6', className)}>
            <FiltrosFolha
                direita={
                    termo.trim().length > 0 || actividadeId !== null ? (
                        <BotaoLimpar aoLimpar={limparFiltros} />
                    ) : (
                        <p className="cota">
                            {linhas.length} tarefas · {abertas.length} abertas · {atrasadas.length}{' '}
                            em atraso
                        </p>
                    )
                }
            >
                <FiltroChip
                    premido={actividadeId === null}
                    aoPremir={() => definirActividade(null)}
                    contagem={tarefas.length}
                >
                    Todas
                </FiltroChip>

                {actividades.map((actividade) => (
                    <FiltroChip
                        key={actividade.id}
                        premido={actividadeId === actividade.id}
                        aoPremir={() => definirActividade(actividade.id)}
                        contagem={tarefas.filter((t) => t.actividadeId === actividade.id).length}
                    >
                        {actividade.nome}
                    </FiltroChip>
                ))}
            </FiltrosFolha>

            <FolhaRegistos<Tarefa>
                titulo="Tarefas"
                accoes={
                    <Botao
                        variante="primario"
                        tamanho="sm"
                        onClick={() => definirFichaAberta(true)}
                    >
                        + Nova tarefa
                    </Botao>
                }
                ordem={ordem}
                alternar={alternar}
                colunas={COLUNAS}
                grelha="grid-cols-[minmax(0,1fr)_96px_84px_96px_84px]"
                linhas={linhas}
                chaveDe={(tarefa) => tarefa.id}
                vazio={
                    actividadeId !== null || termo.trim().length > 0
                        ? 'Nenhuma tarefa corresponde a este filtro.'
                        : 'Este projecto ainda não tem tarefas registadas.'
                }
            >
                {(tarefa) => {
                    const responsavel = estado.utilizadores.find(
                        (utilizador) => utilizador.id === tarefa.responsavelId,
                    );
                    const equipa = estado.equipas.find((e) => e.id === tarefa.equipaId);
                    const atrasada = emAtraso(tarefa);

                    return (
                        <div className="grid grid-cols-1 gap-2 px-3 py-3 md:grid-cols-[minmax(0,1fr)_96px_84px_96px_84px] md:items-center md:gap-3">
                            <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <p className="truncate text-sm font-medium text-graphite">
                                        {tarefa.titulo}
                                    </p>
                                    <EstadoSelo estado={tarefa.estado} tamanho="sm" />
                                    {atrasada && (
                                        <span className="cota text-red-pencil">em atraso</span>
                                    )}
                                </div>

                                {tarefa.descricao.length > 0 && (
                                    <TextoLongo
                                        texto={tarefa.descricao}
                                        className="text-xs text-graphite-64"
                                    />
                                )}

                                <p className="cota">
                                    {ROTULOS.prioridade[tarefa.prioridade]}
                                    {tarefa.actividadeId !== null &&
                                        ` · ${
                                            actividades.find((a) => a.id === tarefa.actividadeId)?.nome ??
                                            'actividade'
                                        }`}
                                    {equipa !== undefined && ` · ${equipa.nome}`}
                                    {tarefa.horasEstimadas !== null &&
                                        ` · ${tarefa.horasEstimadas}h estimadas`}
                                </p>
                            </div>

                            <p className="cota truncate">
                                {responsavel?.nome ?? 'Sem responsável'}
                            </p>

<p className="cota md:text-right tabular">
                                    {Math.round(tarefa.percentagemConclusao)}%
                                </p>

                            <p className="cota md:text-right">
                                {tarefa.horasReais !== null ? `${tarefa.horasReais}h` : '—'}
                            </p>

                            <p
                                className={cn(
                                    'cota tabular md:text-right',
                                    atrasada && 'text-red-pencil',
                                )}
                            >
                                {data(tarefa.prazo)}
                            </p>
                        </div>
                    );
                }}
            </FolhaRegistos>

            <ModalTarefa
                aberto={fichaAberta}
                tarefa={null}
                comProjecto={projectoId}
                aoFechar={() => definirFichaAberta(false)}
            />
        </div>
    );
}

const COLUNAS = [
    { chave: 'titulo', cota: 'Tarefa', valor: (tarefa: Tarefa) => tarefa.titulo },
    { chave: 'responsavel', cota: 'Responsável', alinhamento: 'direita' as const },
    { chave: 'progresso', cota: '%', alinhamento: 'direita' as const },
    { chave: 'horas', cota: 'Horas', alinhamento: 'direita' as const },
    { chave: 'prazo', cota: 'Prazo', alinhamento: 'direita' as const },
];

/**
 * A mesma regra que a vista «As minhas tarefas» usa, com as mesmas duas
 * condições: o estado gravado está atrasado, ou o prazo venceu e ninguém
 * fechou a tarefa. Qualquer das duas aparece como atraso na folha, senão a
 * mesma tarefa seria vermelha numa página e cinzenta na outra.
 */
function emAtraso(tarefa: Tarefa): boolean {
    return (
        tarefa.estado === 'atrasada' ||
        (tarefa.estado !== 'concluida' && diaDe(tarefa.prazo) < chaveDia(new Date()))
    );
}
import { Pencil } from 'lucide-react';

import { CarimboFicha, DadoFicha, FichaRegisto, VincoFicha } from '@/Components/brand/ficha-registo';
import { MargemRevisao, useRevisoes } from '@/Components/brand/margem-revisao';
import { EstadoSelo } from '@/Components/ui/badge';
import { Botao } from '@/Components/ui/button';
import { useSgo } from '@/Data/SgoContext';
import type { Actividade } from '@/Data/types';
import { data, percentagem } from '@/lib/format';
import { utilizadorDe } from '@/lib/historico';

/**
 * A ficha de uma actividade.
 *
 * A lista de actividades mostra o que está a acontecer; a ficha mostra o que a
 * actividade é. O que a lista não teve espaço para trazer e aqui tem lugar é o
 * calendário — previsto contra real — porque é a diferença entre as duas datas
 * que explica se uma obra está atrasada, e nenhuma das duas aparece na tabela.
 */
export function FichaActividade({
    actividade,
    aoCorrigir,
    aoFechar,
    className,
}: {
    actividade: Actividade;
    aoCorrigir: (actividade: Actividade) => void;
    aoFechar: () => void;
    className?: string;
}) {
    const { estado } = useSgo();

    const revisoes = useRevisoes('Actividade', actividade.id);
    const actual = revisoes[0];

    const tarefas = estado.tarefas.filter((tarefa) => tarefa.actividadeId === actividade.id);
    const fechadas = tarefas.filter((tarefa) => tarefa.estado === 'concluida').length;
    const subactividades = estado.actividades.filter(
        (outra) => outra.actividadePaiId === actividade.id,
    );

    return (
        <FichaRegisto
            cota={`Actividade · ${estado.projectos.find((p) => p.id === actividade.projectoId)?.nome ?? '—'}`}
            titulo={actividade.nome}
            selo={<EstadoSelo estado={actividade.estado} />}
            aoFechar={aoFechar}
            accoes={
                <Botao variante="contorno" tamanho="sm" onClick={() => aoCorrigir(actividade)}>
                    <Pencil aria-hidden />
                    Corrigir actividade
                </Botao>
            }
            className={className}
        >
            <CarimboFicha
                entidade="Actividade"
                revisao={actual?.revisao ?? '—'}
                linhas={[
                    { chave: 'Exec.', valor: percentagem(actividade.percentagemConclusao) },
                    { chave: 'Tarefas', valor: `${fechadas}/${tarefas.length}` },
                ]}
                rodape={
                    actual ? `${actual.revisao} · ${utilizadorDe(estado, actual.utilizadorId)}` : undefined
                }
            />

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <DadoFicha rotulo="Actividade pai">
                    {actividade.actividadePaiId
                        ? (estado.actividades.find((outra) => outra.id === actividade.actividadePaiId)
                              ?.nome ?? '—')
                        : 'É a actividade raiz'}
                </DadoFicha>

                <DadoFicha rotulo="Subactividades">{subactividades.length}</DadoFicha>

                <DadoFicha rotulo="Início previsto">{data(actividade.dataInicioPrevista)}</DadoFicha>
                <DadoFicha rotulo="Fim previsto">{data(actividade.dataFimPrevista)}</DadoFicha>

                <DadoFicha rotulo="Início real">{data(actividade.dataInicioReal)}</DadoFicha>
                <DadoFicha rotulo="Fim real">{data(actividade.dataFimReal)}</DadoFicha>

                <DadoFicha rotulo="Conclusão">{percentagem(actividade.percentagemConclusao)}</DadoFicha>
                <DadoFicha rotulo="Tarefas fechadas">
                    {tarefas.length === 0 ? 'Sem tarefas' : `${fechadas} de ${tarefas.length}`}
                </DadoFicha>
            </dl>

            {actividade.descricao && (
                <div className="space-y-1.5">
                    <VincoFicha />
                    <p className="cota">Descrição</p>
                    <p className="text-sm whitespace-pre-line text-graphite">{actividade.descricao}</p>
                </div>
            )}

            <MargemRevisao entidade="Actividade" registoId={actividade.id} />
        </FichaRegisto>
    );
}
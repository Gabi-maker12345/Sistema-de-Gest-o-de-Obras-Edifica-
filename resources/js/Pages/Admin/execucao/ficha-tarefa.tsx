import { Pencil } from 'lucide-react';

import { CarimboFicha, DadoFicha, FichaRegisto, VincoFicha } from '@/Components/brand/ficha-registo';
import { MargemRevisao, useRevisoes } from '@/Components/brand/margem-revisao';
import { EstadoSelo, Selo } from '@/Components/ui/badge';
import { Botao } from '@/Components/ui/button';
import { Medidor } from '@/Components/ui/progress';
import { useSgo } from '@/Data/SgoContext';
import type { Tarefa } from '@/Data/types';
import { data, percentagem } from '@/lib/format';
import { ROTULOS } from '@/lib/rotulos';
import { utilizadorDe } from '@/lib/historico';

/**
 * A ficha de uma tarefa.
 *
 * A lista de tarefas é uma folha de execução: título, prazo, estado. A ficha é a
 * folha de horas — estimadas contra reais — porque é esse o número que se
 * descobre tarde e se escreve depressa, e é o registo que mais vezes se corrige.
 * Deixar as horas reais fora da lista é o que faz o histórico valer: quando
 * alguém pergunta porque é que a tarefa aponta para a semana errada, a resposta
 * está na margem e não numa memória de quem a fechou.
 */
export function FichaTarefa({
    tarefa,
    aoCorrigir,
    aoFechar,
    className,
}: {
    tarefa: Tarefa;
    aoCorrigir: (tarefa: Tarefa) => void;
    aoFechar: () => void;
    className?: string;
}) {
    const { estado } = useSgo();

    const revisoes = useRevisoes('Tarefa', tarefa.id);
    const actual = revisoes[0];

    const actividade = estado.actividades.find((outra) => outra.id === tarefa.actividadeId);
    const equipa = estado.equipas.find((outra) => outra.id === tarefa.equipaId);

    return (
        <FichaRegisto
            cota={`Tarefa · ${actividade?.nome ?? estado.projectos.find((p) => p.id === tarefa.projectoId)?.nome ?? '—'}`}
            titulo={tarefa.titulo}
            selo={<EstadoSelo estado={tarefa.estado} />}
            aoFechar={aoFechar}
            accoes={
                <Botao variante="contorno" tamanho="sm" onClick={() => aoCorrigir(tarefa)}>
                    <Pencil aria-hidden />
                    Corrigir tarefa
                </Botao>
            }
            className={className}
        >
            <CarimboFicha
                entidade="Tarefa"
                revisao={actual?.revisao ?? '—'}
                linhas={[
                    { chave: 'Exec.', valor: percentagem(tarefa.percentagemConclusao) },
                    {
                        chave: 'Horas',
                        valor: `${tarefa.horasReais ?? '—'} / ${tarefa.horasEstimadas ?? '—'}`,
                    },
                ]}
                rodape={
                    actual ? `${actual.revisao} · ${utilizadorDe(estado, actual.utilizadorId)}` : undefined
                }
            />

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <DadoFicha rotulo="Prioridade">
                    <Selo
                        tinta={tarefa.prioridade === 'alta' ? 'ambar' : 'grafite'}
                        traco={tarefa.prioridade === 'alta' ? 'firme' : 'medio'}
                    >
                        {ROTULOS.prioridade[tarefa.prioridade]}
                    </Selo>
                </DadoFicha>

                <DadoFicha rotulo="Prazo">{data(tarefa.prazo)}</DadoFicha>

                <DadoFicha rotulo="Responsável">{utilizadorDe(estado, tarefa.responsavelId)}</DadoFicha>
                <DadoFicha rotulo="Equipa">{equipa?.nome ?? '—'}</DadoFicha>

                <DadoFicha rotulo="Horas estimadas">
                    {tarefa.horasEstimadas === null ? '—' : `${tarefa.horasEstimadas}h`}
                </DadoFicha>
                <DadoFicha rotulo="Horas reais">
                    {tarefa.horasReais === null ? '—' : `${tarefa.horasReais}h`}
                </DadoFicha>

                <DadoFicha rotulo="Actividade">{actividade?.nome ?? '—'}</DadoFicha>

                <DadoFicha rotulo="Conclusão">
                    <span className="flex items-center gap-2">
                        <Medidor valor={tarefa.percentagemConclusao} className="w-16" />
                        <span className="cota tabular">{percentagem(tarefa.percentagemConclusao)}</span>
                    </span>
                </DadoFicha>
            </dl>

            {tarefa.descricao && (
                <div className="space-y-1.5">
                    <VincoFicha />
                    <p className="cota">Descrição</p>
                    <p className="text-sm whitespace-pre-line text-graphite">{tarefa.descricao}</p>
                </div>
            )}

            <MargemRevisao entidade="Tarefa" registoId={tarefa.id} />
        </FichaRegisto>
    );
}
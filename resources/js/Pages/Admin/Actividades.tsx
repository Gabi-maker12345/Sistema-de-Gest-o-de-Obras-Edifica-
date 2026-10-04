import { useCallback, useMemo } from 'react';

import type { Medicao } from '@/Components/brand/quadro-medicoes';
import { useSgo } from '@/Data/SgoContext';
import type { Actividade } from '@/Data/types';
import { LayoutAdmin } from '@/Layouts/LayoutAdmin';
import { numero } from '@/lib/format';
import { rotuloPerfil } from '@/lib/rotulos';

import { FolhaActividades } from './execucao/folha-actividades';
import { PaginaModulo } from './execucao/pagina-modulo';

/**
 * `/admin/actividades` — o módulo das actividades, folha a folha de obra.
 *
 * Uma actividade pertence a um projecto, mas quem entra aqui está a perguntar
 * «o que está a ser feito em todas as obras», e não quer abrir seis fichas para
 * o saber. Por isso o módulo abre no índice das obras e a actividade de cada uma
 * lê-se depois de escolher a obra, na mesma folha que o separador da ficha mostra.
 *
 * As actividades não têm sincronização — quem as escreve está no escritório, ao
 * contrário do diário — e por isso as medidas não falam de pendentes.
 */
export default function Actividades() {
    const { estado, projectosVisiveis, perfilEfectivo, utilizadorEfectivo, execucaoFisica } =
        useSgo();

    const contar = useCallback(
        (projectoId: string) => estado.actividades.filter((a) => a.projectoId === projectoId).length,
        [estado.actividades],
    );

    // As quatro medidas da capa. O mesmo dialecto do bloco de título, mas a
    // responder pela obra em vez de pela pasta inteira.
    const leituras = useCallback(
        (projectoId: string): Medicao[] => {
            const actividades = estado.actividades.filter((a) => a.projectoId === projectoId);
            const concluidas = concluidasEm(actividades).length;
            const atrasadas = actividades.filter((a) => a.estado === 'atrasada').length;

            return [
                {
                    rotulo: 'Actividades',
                    valor: numero(actividades.length),
                    nota: 'nesta obra',
                },
                {
                    rotulo: 'Concluídas',
                    valor: numero(concluidas),
                    nota: `${percentagemDe(concluidas, actividades.length)} da obra`,
                },
                {
                    rotulo: 'Atrasadas',
                    valor: numero(atrasadas),
                    critico: atrasadas > 0,
                    nota: atrasadas > 0 ? 'com o prazo estourado' : 'dentro do prazo',
                },
                {
                    rotulo: 'Tarefas',
                    valor: numero(estado.tarefas.filter((t) => t.projectoId === projectoId).length),
                    nota: 'nesta obra',
                },
            ];
        },
        [estado.actividades, estado.tarefas],
    );

    const modulo = useMemo(() => {
        const visiveis = new Set(projectosVisiveis.map((p) => p.id));
        const actividades = estado.actividades.filter((a) => visiveis.has(a.projectoId));
        const tarefas = estado.tarefas.filter((t) => visiveis.has(t.projectoId));
        const concluidas = concluidasEm(actividades).length;
        const atrasadas = actividades.filter((a) => a.estado === 'atrasada').length;
        const media =
            projectosVisiveis.length === 0
                ? 0
                : projectosVisiveis.reduce((soma, p) => soma + execucaoFisica(p.id), 0) /
                  projectosVisiveis.length;

        return {
            medicoes: [
                {
                    rotulo: 'Obras visíveis',
                    valor: numero(projectosVisiveis.length),
                    nota: 'com acesso atribuído',
                },
                {
                    rotulo: 'Actividades',
                    valor: numero(actividades.length),
                    nota: 'em todas as obras',
                },
                {
                    rotulo: 'Concluídas',
                    valor: numero(concluidas),
                    nota: `${percentagemDe(concluidas, actividades.length)} do total`,
                },
                {
                    rotulo: 'Atrasadas',
                    valor: numero(atrasadas),
                    critico: atrasadas > 0,
                    nota: atrasadas > 0 ? 'com prazo estourado' : 'sem atrasos',
                },
                {
                    rotulo: 'Tarefas',
                    valor: numero(tarefas.length),
                    nota: 'em todas as obras',
                },
                {
                    rotulo: 'Execução física',
                    valor: String(Math.round(media)),
                    unidade: '%',
                    nota: 'média das obras',
                },
            ],
            linha: `${numero(actividades.length)} actividades em ${numero(projectosVisiveis.length)} obras visíveis para ${utilizadorEfectivo.nome} · ${rotuloPerfil(perfilEfectivo)}.`,
        };
    }, [
        estado.actividades,
        estado.tarefas,
        projectosVisiveis,
        execucaoFisica,
        utilizadorEfectivo.nome,
        perfilEfectivo,
    ]);

    return (
        <LayoutAdmin>
            <PaginaModulo
                modulo="Execução"
                titulo="Actividades"
                folha="02 / 08"
                linha={modulo.linha}
                anotacao="A actividade pode ter actividade_pai. As filhas descem dentro da mãe, porque é a mãe que diz a que fase da obra pertencem."
                projectos={projectosVisiveis}
                contar={contar}
                medicoes={modulo.medicoes}
                leituras={leituras}
                carimbo="SGO · EXECUÇÃO"
            >
                {(projecto) => <FolhaActividades projectoId={projecto.id} />}
            </PaginaModulo>
        </LayoutAdmin>
    );
}

/**
 * As actividades fechadas. O atraso, pelo contrário, é o estado gravado e não um
 * cálculo: diz-nos alguém que marcou a actividade como atrasada. As tarefas têm
 * regra própria, em `folha-tarefas`.
 */
function concluidasEm(actividades: Actividade[]) {
    return actividades.filter((actividade) => actividade.estado === 'concluida');
}

function percentagemDe(parte: number, todo: number): string {
    return todo === 0 ? '0%' : `${Math.round((parte / todo) * 100)}%`;
}
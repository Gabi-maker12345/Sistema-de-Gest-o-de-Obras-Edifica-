import { Head } from '@inertiajs/react';
import { KanbanSquare, List, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { CabecalhoFolha } from '@/Components/brand/cabecalho-folha';
import { Carimbo } from '@/Components/brand/carimbo';
import { FiltroChip, FiltrosFolha } from '@/Components/brand/filtros-folha';
import { Botao } from '@/Components/ui/button';
import { EstadoSelo, Selo } from '@/Components/ui/badge';
import { Combo } from '@/Components/ui/combobox';
import { useSgo } from '@/Data/SgoContext';
import type { EstadoTarefa, PrioridadeTarefa, Tarefa } from '@/Data/types';
import { LayoutAdmin } from '@/Layouts/LayoutAdmin';
import { chaveDia, diaDe, semanaDoDia } from '@/lib/agenda';
import { data, numero, percentagem } from '@/lib/format';
import { ROTULOS, rotuloPerfil } from '@/lib/rotulos';
import { cn } from '@/lib/utils';

import { ModalTarefa } from './ModalTarefa';

/**
 * `/admin/tarefas` — As minhas tarefas.
 *
 * A folha que responde a uma pergunta que nenhuma outra responde: o que tenho
 * eu personally para entregar, espalhado por obras diferentes. Não é a lista de
 * tarefas de um projecto — essa vive no separador do projecto, com o caderno de
 * obra em volta — e sim o cruzamento: as minhas, de todas as obras, no mesmo
 * lugar e na mesma nota.
 *
 * Por isso o projecto de origem é o que se vê em cada linha. Sem ele, um cartão
 * solto não diz nada: «Subir quadro geral do piso 0» só quer dizer alguma coisa
 * ao lado do nome da obra onde o quadro sobe.
 *
 * O Kanban e a lista são o mesmo conjunto com dois desenhos. Quem entra para
 * fazer escolhe o quadro, porque é a única vista em que «atrasada» se vê ao
 * lado das outras três; quem entra para saber escolhe a lista, porque é a única
 * em que se lê o prazo inteiro de cada linha.
 */

type Filtro = 'todas' | 'atrasadas' | 'hoje' | 'semana';

export default function MinhasTarefas() {
    const { estado, utilizadorEfectivo, perfilEfectivo } = useSgo();

    const [vista, definirVista] = useState<'quadro' | 'lista'>('quadro');
    const [filtro, definirFiltro] = useState<Filtro>('todas');
    const [projectoFiltro, definirProjectoFiltro] = useState<string | null>(null);
    const [ficha, definirFicha] = useState<{ aberta: boolean; tarefa: Tarefa | null }>({
        aberta: false,
        tarefa: null,
    });

    /**
     * As minhas tarefas: as que têm o utilizador simulado como responsável, e
     * só das obras que ele vê. A segunda condição não é redundante — um gestor
     * vê um projecto inteiro, mas a tarefa dele dentro desse projecto é uma só.
     */
    const minhas = useMemo(() => {
        const visiveis = new Set(estado.projectos.map((p) => p.id));

        return estado.tarefas.filter(
            (tarefa) =>
                tarefa.responsavelId === utilizadorEfectivo.id &&
                visiveis.has(tarefa.projectoId),
        );
    }, [estado.tarefas, estado.projectos, utilizadorEfectivo.id]);

    const nomesDeProjecto = useMemo(
        () =>
            Object.fromEntries(estado.projectos.map((p) => [p.id, p.nome])) as Record<
                string,
                string
            >,
        [estado.projectos],
    );

    const nomesDeActividade = useMemo(
        () =>
            Object.fromEntries(estado.actividades.map((a) => [a.id, a.nome])) as Record<
                string,
                string
            >,
        [estado.actividades],
    );

    const filtradas = useMemo(() => {
        const hoje = new Date();
        const chave = chaveDia(hoje);
        const semana = semanaDoDia(hoje);

        return minhas.filter((tarefa) => {
            if (projectoFiltro !== null && tarefa.projectoId !== projectoFiltro) {
                return false;
            }

            const dia = diaDe(tarefa.prazo);

            switch (filtro) {
                case 'atrasadas':
                    return tarefa.estado === 'atrasada';
                case 'hoje':
                    return dia === chave;
                case 'semana':
                    return dia >= semana.inicio && dia <= semana.fim;
                default:
                    return true;
            }
        });
    }, [minhas, filtro, projectoFiltro]);

    /** O prazo que já passou conta como atraso mesmo que o estado ainda não diga. */
    const emAtraso = useCallback(
        (tarefa: Tarefa) =>
            tarefa.estado === 'atrasada' ||
            (tarefa.estado !== 'concluida' && diaDe(tarefa.prazo) < chaveDia(new Date())),
        [],
    );

    const colunas = useMemo(() => {
        const ordenadas = [...filtradas].sort((a, b) => a.prazo.localeCompare(b.prazo));
        const mapa: Record<EstadoTarefa, Tarefa[]> = {
            pendente: [],
            em_curso: [],
            concluida: [],
            atrasada: [],
        };

        for (const tarefa of ordenadas) {
            mapa[tarefa.estado].push(tarefa);
        }

        return mapa;
    }, [filtradas]);

    const contarFiltro = useCallback(
        (alvo: Filtro): number => {
            const hoje = new Date();
            const chave = chaveDia(hoje);
            const semana = semanaDoDia(hoje);

            return minhas.filter((tarefa) => {
                if (projectoFiltro !== null && tarefa.projectoId !== projectoFiltro) {
                    return false;
                }

                const dia = diaDe(tarefa.prazo);

                switch (alvo) {
                    case 'atrasadas':
                        return emAtraso(tarefa);
                    case 'hoje':
                        return dia === chave;
                    case 'semana':
                        return dia >= semana.inicio && dia <= semana.fim;
                    default:
                        return true;
                }
            }).length;
        },
        [minhas, projectoFiltro, emAtraso],
    );

    const atrasadasNoFiltro = filtradas.filter(emAtraso).length;
    const aTratar = filtradas.filter((tarefa) => tarefa.estado !== 'concluida').length;
    const horasFaltam = filtradas
        .filter((tarefa) => tarefa.estado !== 'concluida')
        .reduce((soma, tarefa) => soma + (tarefa.horasEstimadas ?? 0), 0);
    const concluidas = filtradas.filter((tarefa) => tarefa.estado === 'concluida').length;

    return (
        <LayoutAdmin>
            <Head title="As minhas tarefas — SGO">
                <meta
                    name="description"
                    content="As tarefas atribuídas ao utilizador, de todas as obras, em quadro ou em lista."
                />
            </Head>

            <div className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6">
                <div className="space-y-12">
                    <CabecalhoFolha
                        cota="Geral · As minhas tarefas"
                        titulo="As minhas tarefas"
                        linha={
                            <>
                                {minhas.length} tarefas de{' '}
                                {new Set(minhas.map((t) => t.projectoId)).size} obras, atribuídas a{' '}
                                <span className="font-medium text-graphite">
                                    {utilizadorEfectivo.nome}
                                </span>{' '}
                                · {rotuloPerfil(perfilEfectivo)}.
                            </>
                        }
                        anotacao="Cada cartão diz de que obra vem. Fora da obra, uma tarefa é uma frase sem dono; com o nome da obra em cima, é trabalho com prazo."
                        acoes={
                            <div className="flex items-center gap-2">
                                <Alternador vista={vista} aoMudar={definirVista} />
                                <Botao
                                    traco="firme"
                                    onClick={() => definirFicha({ aberta: true, tarefa: null })}
                                >
                                    <Plus aria-hidden />
                                    Nova tarefa
                                </Botao>
                            </div>
                        }
                        medicoes={[
                            { rotulo: 'Minhas tarefas', valor: numero(minhas.length), nota: 'de todas as obras' },
                            {
                                rotulo: 'A tratar',
                                valor: numero(aTratar),
                                nota: 'por entregar',
                            },
                            {
                                rotulo: 'Atrasadas',
                                valor: numero(atrasadasNoFiltro),
                                nota: atrasadasNoFiltro > 0 ? 'prazo vencido' : 'sem atrasos',
                                critico: atrasadasNoFiltro > 0,
                            },
                            {
                                rotulo: 'Concluídas',
                                valor: numero(concluidas),
                                nota: 'fechadas',
                            },
                        ]}
                        folha="04 / 08"
                    />

                    <section aria-labelledby="tarefas" className="space-y-6">
                        <h2 id="tarefas" className="sr-only">
                            Tarefas de {utilizadorEfectivo.nome}
                        </h2>

                        <FiltrosFolha
                            direita={
                                <p className="cota">
                                    {horasFaltam > 0
                                        ? `${horasFaltam} h estimadas por entregar`
                                        : 'nada por entregar'}
                                </p>
                            }
                        >
                            {(
                                [
                                    ['todas', 'Todas', minhas.length],
                                    ['atrasadas', 'Atrasadas', contarFiltro('atrasadas')],
                                    ['hoje', 'Para hoje', contarFiltro('hoje')],
                                    ['semana', 'Esta semana', contarFiltro('semana')],
                                ] as Array<[Filtro, string, number]>
                            ).map(([chave, rotulo, contagem]) => (
                                <FiltroChip
                                    key={chave}
                                    premido={filtro === chave}
                                    aoPremir={() => definirFiltro(chave)}
                                    contagem={contagem}
                                >
                                    {rotulo}
                                </FiltroChip>
                            ))}

                            <Combo
                                className="w-56"
                                valor={projectoFiltro}
                                aoEscolher={definirProjectoFiltro}
                                aoLimpar={() => definirProjectoFiltro(null)}
                                placeholder="Todas as obras"
                                opcoes={estado.projectos.map((p) => ({
                                    valor: p.id,
                                    rotulo: p.nome,
                                }))}
                            />
                        </FiltrosFolha>

                        {filtradas.length === 0 ? (
                            <div className="hachura-90 border border-graphite-20 p-8 text-center">
                                <p className="cota text-graphite-48">
                                    {minhas.length === 0
                                        ? 'Não há tarefas atribuídas a este utilizador.'
                                        : 'Nenhuma tarefa corresponde a estes filtros.'}
                                </p>
                            </div>
                        ) : vista === 'quadro' ? (
                            <Quadro
                                colunas={colunas}
                                projectos={nomesDeProjecto}
                                actividades={nomesDeActividade}
                                emAtraso={emAtraso}
                                aoAbrir={(tarefa) => definirFicha({ aberta: true, tarefa })}
                            />
                        ) : (
                            <Lista
                                tarefas={filtradas}
                                projectos={nomesDeProjecto}
                                actividades={nomesDeActividade}
                                emAtraso={emAtraso}
                                aoAbrir={(tarefa) => definirFicha({ aberta: true, tarefa })}
                            />
                        )}
                    </section>

                    <Carimbo
                        identidade="SGO · TAREFAS"
                        className="w-[280px]"
                        linhas={[
                            { chave: 'Titular', valor: utilizadorEfectivo.nome },
                            { chave: 'Revisão', valor: 'C' },
                            { chave: 'A tratar', valor: `${aTratar} de ${minhas.length}` },
                            { chave: 'Atrasadas', valor: String(atrasadasNoFiltro) },
                        ]}
                        rodado={-2}
                    />
                </div>

                <p className="sr-only" aria-live="polite">
                    {filtradas.length} tarefas em {vista === 'quadro' ? 'quadro' : 'lista'}.
                </p>
            </div>

            <ModalTarefa
                aberto={ficha.aberta}
                tarefa={ficha.tarefa}
                aoFechar={() => definirFicha({ aberta: false, tarefa: null })}
            />
        </LayoutAdmin>
    );
}

/** Quadro ou lista. Uma escolha, não duas acções: o botão é a outra. */
function Alternador({
    vista,
    aoMudar,
}: {
    vista: 'quadro' | 'lista';
    aoMudar: (vista: 'quadro' | 'lista') => void;
}) {
    return (
        <div
            role="group"
            aria-label="Vista das tarefas"
            className="inline-flex overflow-hidden rounded-nib border border-graphite-32"
        >
            {(
                [
                    ['quadro', 'Quadro', KanbanSquare],
                    ['lista', 'Lista', List],
                ] as Array<['quadro' | 'lista', string, typeof List]>
            ).map(([chave, rotulo, Icone], indice) => (
                <button
                    key={chave}
                    type="button"
                    onClick={() => aoMudar(chave)}
                    aria-pressed={vista === chave}
                    className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-2 text-xs transition-colors',
                        'focus-visible:z-10 focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none',
                        indice > 0 && 'border-l border-graphite-32',
                        vista === chave
                            ? 'bg-graphite font-medium text-paper'
                            : 'text-graphite-64 hover:bg-graphite-08 hover:text-graphite',
                    )}
                >
                    <Icone aria-hidden className="size-3.5" />
                    {rotulo}
                </button>
            ))}
        </div>
    );
}

/** As quatro colunas do quadro, pela ordem em que o trabalho anda. */
const COLUNAS: Array<{ estado: EstadoTarefa; legenda: string }> = [
    { estado: 'pendente', legenda: 'A começar' },
    { estado: 'em_curso', legenda: 'A decorrer' },
    { estado: 'concluida', legenda: 'Fechadas' },
    { estado: 'atrasada', legenda: 'Prazo vencido' },
];

function Quadro({
    colunas,
    projectos,
    actividades,
    emAtraso,
    aoAbrir,
}: {
    colunas: Record<EstadoTarefa, Tarefa[]>;
    projectos: Record<string, string>;
    actividades: Record<string, string>;
    emAtraso: (tarefa: Tarefa) => boolean;
    aoAbrir: (tarefa: Tarefa) => void;
}) {
    return (
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-graphite-12 bg-graphite-12 sm:grid-cols-2 xl:grid-cols-4">
            {COLUNAS.map(({ estado, legenda }) => {
                const tarefas = colunas[estado];

                return (
                    <section key={estado} aria-labelledby={`coluna-${estado}`} className="bg-paper">
                        <header className="flex items-baseline justify-between border-b border-graphite-20 px-3 py-2">
                            <h3 id={`coluna-${estado}`} className="text-sm font-semibold text-graphite">
                                {ROTULOS.estadoTarefa[estado]}
                            </h3>
                            <span className="font-mono text-2xs tabular text-graphite-48">
                                {tarefas.length}
                            </span>
                            <span className="sr-only">{legenda}</span>
                        </header>

                        <div className="space-y-2 p-2">
                            {tarefas.length === 0 ? (
                                <p className="p-2 font-mono text-2xs text-graphite-32">vazia</p>
                            ) : (
                                tarefas.map((tarefa) => (
                                    <Cartao
                                        key={tarefa.id}
                                        tarefa={tarefa}
                                        projecto={projectos[tarefa.projectoId]}
                                        actividade={tarefa.actividadeId
                                            ? actividades[tarefa.actividadeId]
                                            : undefined}
                                        atrasada={emAtraso(tarefa)}
                                        aoAbrir={aoAbrir}
                                    />
                                ))
                            )}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

/**
 * O cartão.
 *
 * O nome da obra vem em cima, e não em baixo: é a primeira coisa que se lê e é
 * o que dá sentido à frase. O estado não aparece escrito — a coluna já o disse,
 * e um cartão que repete o título da coluna gasta uma linha sem dizer nada.
 */
function Cartao({
    tarefa,
    projecto,
    actividade,
    atrasada,
    aoAbrir,
}: {
    tarefa: Tarefa;
    projecto: string;
    actividade?: string;
    atrasada: boolean;
    aoAbrir: (tarefa: Tarefa) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => aoAbrir(tarefa)}
            className={cn(
                'block w-full space-y-2 border bg-paper-raised p-3 text-left',
                'transition-colors hover:bg-graphite-04',
                'focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none',
                atrasada ? 'border-red-pencil' : 'border-graphite-20',
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <Selo tinta="carimbo" traco="leve" tamanho="sm" className="min-w-0 truncate">
                    {projecto}
                </Selo>
                <SeloPrioridade prioridade={tarefa.prioridade} />
            </div>

            <p className="text-sm leading-snug text-graphite">{tarefa.titulo}</p>

            {actividade && <p className="anotacao normal-case">{actividade}</p>}

            <div className="flex items-baseline justify-between gap-2 border-t border-graphite-12 pt-2">
                <span
                    className={cn(
                        'font-mono text-2xs tabular',
                        atrasada ? 'text-red-pencil' : 'text-graphite-64',
                    )}
                >
                    {data(tarefa.prazo)}
                </span>
                <span className="font-mono text-2xs tabular text-graphite-48">
                    {tarefa.percentagemConclusao}%
                </span>
            </div>

            {/* A barra vai a hatched quando a tarefa está parada, e é a mesma
                hachura que divide blocos na prancha. */}
            <div
                aria-hidden
                className="h-1 overflow-hidden bg-graphite-12"
                title={`${percentagem(tarefa.percentagemConclusao)} concluído`}
            >
                <div
                    className={cn(
                        'h-full',
                        tarefa.estado === 'concluida' ? 'bg-graphite-48' : 'bg-stamp',
                    )}
                    style={{ width: `${Math.max(2, tarefa.percentagemConclusao)}%` }}
                />
            </div>
        </button>
    );
}

/**
 * A prioridade é o segundo selo do cartão, e o peso do traço é o que a diz:
 * urgente é o único que levanta o grafite cheio, porque é o único que exige
 * acção agora. Não é cor nova — é mais tinta.
 */
function SeloPrioridade({ prioridade }: { prioridade: PrioridadeTarefa }) {
    if (prioridade === 'urgente') {
        return (
            <Selo tinta="grafite" traco="firme" tamanho="sm" className="shrink-0">
                Urgente
            </Selo>
        );
    }

    if (prioridade === 'alta') {
        return (
            <Selo tinta="grafite" traco="medio" tamanho="sm" className="shrink-0">
                Alta
            </Selo>
        );
    }

    return null;
}

/** A lista: o mesmo conjunto, lido a descer, com o prazo inteiro em cada linha. */
function Lista({
    tarefas,
    projectos,
    actividades,
    emAtraso,
    aoAbrir,
}: {
    tarefas: Tarefa[];
    projectos: Record<string, string>;
    actividades: Record<string, string>;
    emAtraso: (tarefa: Tarefa) => boolean;
    aoAbrir: (tarefa: Tarefa) => void;
}) {
    return (
        <div className="overflow-x-auto border border-graphite-12">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="border-b border-graphite-20 bg-graphite-04">
                        <th scope="col" className="cota px-3 py-2 text-left">
                            Obra
                        </th>
                        <th scope="col" className="cota px-3 py-2 text-left">
                            Tarefa
                        </th>
                        <th scope="col" className="cota px-3 py-2 text-left">
                            Estado
                        </th>
                        <th scope="col" className="cota px-3 py-2 text-right">
                            Prazo
                        </th>
                        <th scope="col" className="cota px-3 py-2 text-right">
                            Conclusão
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {tarefas.map((tarefa) => (
                        <tr
                            key={tarefa.id}
                            className="border-b border-graphite-12 last:border-b-0 hover:bg-graphite-04"
                        >
                            <td className="max-w-48 px-3 py-2 align-top">
                                <Selo tinta="carimbo" traco="leve" tamanho="sm">
                                    {projectos[tarefa.projectoId]}
                                </Selo>
                            </td>

                            <td className="px-3 py-2 align-top">
                                <button
                                    type="button"
                                    onClick={() => aoAbrir(tarefa)}
                                    className="text-left text-graphite underline decoration-graphite-32 underline-offset-2 hover:decoration-graphite focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none"
                                >
                                    {tarefa.titulo}
                                </button>
                                {tarefa.actividadeId && (
                                    <p className="anotacao normal-case">
                                        {actividades[tarefa.actividadeId]}
                                    </p>
                                )}
                            </td>

                            <td className="px-3 py-2 align-top">
                                <EstadoSelo estado={tarefa.estado} />
                            </td>

                            <td className="px-3 py-2 text-right align-top">
                                <span
                                    className={cn(
                                        'font-mono text-2xs tabular',
                                        emAtraso(tarefa) ? 'text-red-pencil' : 'text-graphite-64',
                                    )}
                                >
                                    {data(tarefa.prazo)}
                                </span>
                            </td>

                            <td className="px-3 py-2 text-right align-top">
                                <span className="font-mono text-2xs tabular text-graphite-64">
                                    {percentagem(tarefa.percentagemConclusao)}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
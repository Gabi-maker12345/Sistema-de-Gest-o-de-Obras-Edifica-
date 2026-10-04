import { Head } from '@inertiajs/react';
import { CalendarDays, CalendarRange, ChevronLeft, ChevronRight, List, Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { CabecalhoFolha } from '@/Components/brand/cabecalho-folha';
import { Carimbo } from '@/Components/brand/carimbo';
import { FiltroChip, FiltrosFolha } from '@/Components/brand/filtros-folha';
import { VistaMes } from '@/Components/brand/vista-mes';
import { Botao } from '@/Components/ui/button';
import { Selo } from '@/Components/ui/badge';
import { Combo } from '@/Components/ui/combobox';
import { useSgo } from '@/Data/SgoContext';
import type { EventoAgenda, TipoEvento } from '@/Data/types';
import { LayoutAdmin } from '@/Layouts/LayoutAdmin';
import {
    chaveDia,
    diaDe,
    gradeDaSemana,
    rotuloMes,
    rotuloSemana,
    deslocarDias,
} from '@/lib/agenda';
import { dataExtenso, dataHora, hora, numero } from '@/lib/format';
import { ROTULOS, rotuloPerfil } from '@/lib/rotulos';
import { cn } from '@/lib/utils';

import { ModalEvento } from './ModalEvento';
import { ModalTarefa } from './ModalTarefa';

/**
 * `/admin/agenda` — a folha do tempo.
 *
 * É a única folha do produto que se lê no tempo em vez de se ler em lista, e é
 * por isso que tem três vistas em vez de uma tabela: quem gere a semana quer as
 * sete colunas em frente, quem só quer saber o que tem de amanhã quer a lista,
 * e quem olha para o mês quer ver onde é que as coisas se acumulam.
 *
 * As três vistas leem o mesmo conjunto — a agenda não recarrega nada ao trocar
 * de vista, muda é o desenho. E o filtro é o mesmo nas três: estreitar a lista
 * nunca muda o que está a ser comparado.
 */
export default function Agenda() {
    const { estado, utilizadorEfectivo, perfilEfectivo } = useSgo();

    const [vista, definirVista] = useState<'mes' | 'semana' | 'lista'>('mes');
    const [ancora, definirAncora] = useState<Date>(() => new Date());
    const [tipoFiltro, definirTipoFiltro] = useState<'todos' | TipoEvento>('todos');
    const [projectoFiltro, definirProjectoFiltro] = useState<string | null>(null);
    const [ficha, definirFicha] = useState<{
        /** Uma janela de cada vez: o evento ou a tarefa que nasce dele. */
        janela: 'nenhuma' | 'evento' | 'tarefa';
        evento: EventoAgenda | null;
        tarefa: { projectoId: string | null; prazo: string | null } | null;
    }>({ janela: 'nenhuma', evento: null, tarefa: null });

    const fecharFicha = useCallback(
        () => definirFicha({ janela: 'nenhuma', evento: null, tarefa: null }),
        [],
    );

    /** A agenda é de quem se está a ver: os eventos do utilizador simulado. */
    const meusEventos = useMemo(
        () => estado.eventos.filter((evento) => evento.utilizadorId === utilizadorEfectivo.id),
        [estado.eventos, utilizadorEfectivo.id],
    );

    const filtrados = useMemo(
        () =>
            meusEventos.filter((evento) => {
                if (tipoFiltro !== 'todos' && evento.tipo !== tipoFiltro) {
                    return false;
                }

                if (projectoFiltro !== null && evento.projectoId !== projectoFiltro) {
                    return false;
                }

                return true;
            }),
        [meusEventos, tipoFiltro, projectoFiltro],
    );

    const ordenados = useMemo(
        () => [...filtrados].sort((a, b) => a.dataHoraInicio.localeCompare(b.dataHoraInicio)),
        [filtrados],
    );

    const contarPorTipo = useMemo(() => {
        const conta: Partial<Record<TipoEvento, number>> = {};

        for (const evento of meusEventos) {
            conta[evento.tipo] = (conta[evento.tipo] ?? 0) + 1;
        }

        return conta;
    }, [meusEventos]);

    const nomesDeProjecto = useMemo(
        () =>
            Object.fromEntries(estado.projectos.map((p) => [p.id, p.nome])) as Record<
                string,
                string
            >,
        [estado.projectos],
    );

    /**
     * O que está seleccionado. É uma folha, não um modal: clicar num evento
     * escreve-o no canto e a acção fica à mão, sem tirar a pessoa da vista do
     * mês para uma janela que tapa metade do ecrã.
     */
    const [seleccionado, definirSeleccionado] = useState<string | null>(null);

    const eventoSeleccionado = useMemo(
        () => ordenados.find((evento) => evento.id === seleccionado) ?? null,
        [ordenados, seleccionado],
    );

    const escolher = useCallback((_dia: string, evento?: EventoAgenda) => {
        definirSeleccionado(evento ? evento.id : null);
    }, []);

    /** A vista decide para que lado se salta: um mês no mês, sete dias na semana. */
    const passo = vista === 'semana' ? 7 : 0;
    const meses = vista === 'mes' ? 1 : 0;

    function navegar(direccao: -1 | 1) {
        definirAncora((actual) => {
            if (meses !== 0) {
                return new Date(actual.getFullYear(), actual.getMonth() + direccao * meses, 1);
            }

            return deslocarDias(actual, direccao * (passo || 7));
        });
    }

    const tituloPeriodo =
        vista === 'mes' ? rotuloMes(ancora) : rotuloSemana(ancora);

    const todosActivos =
        tipoFiltro === 'todos' && projectoFiltro === null;

    return (
        <LayoutAdmin>
            <Head title="Agenda">
                <meta
                    name="description"
                    content="Agenda de projectos, obra e compromissos pessoais, em vista de mês, semana ou lista."
                />
            </Head>

            <div className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6">
                <div className="space-y-12">
                    <CabecalhoFolha
                        cota="Geral · Agenda"
                        titulo="Agenda"
                        linha={
                            <>
                                {meusEventos.length} compromissos no caderno de{' '}
                                <span className="font-medium text-graphite">
                                    {utilizadorEfectivo.nome}
                                </span>{' '}
                                · {rotuloPerfil(perfilEfectivo)}.
                            </>
                        }
                        anotacao="Um evento sem projecto é um compromisso pessoal; com projecto, é obra. O selo do tipo diz qual dos dois é."
                        acoes={
                            <Botao
                                traco="firme"
                                onClick={() => definirFicha({ janela: 'evento', evento: null, tarefa: null })}
                            >
                                <Plus aria-hidden />
                                Novo evento
                            </Botao>
                        }
                        medicoes={medicoes(meusEventos)}
                        folha="03 / 08"
                    />

                    <section aria-labelledby="calendario" className="space-y-6">
                        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-graphite-32 pb-2">
                            <div>
                                <p className="cota">
                                    {vista === 'mes' ? 'Vista de mês' : `Vista de ${vista}`}
                                </p>
                                <h2 id="calendario" className="text-2xl font-semibold tracking-tight text-graphite">
                                    {tituloPeriodo}
                                </h2>
                            </div>

                            <div className="flex items-center gap-2">
                                <AlternadorVista vista={vista} aoMudar={definirVista} />
                                <Botao
                                    variante="contorno"
                                    tamanho="icone"
                                    onClick={() => navegar(-1)}
                                    aria-label="Período anterior"
                                >
                                    <ChevronLeft aria-hidden />
                                </Botao>
                                <Botao
                                    variante="contorno"
                                    tamanho="icone"
                                    onClick={() => navegar(1)}
                                    aria-label="Período seguinte"
                                >
                                    <ChevronRight aria-hidden />
                                </Botao>
                                <Botao
                                    variante="contorno"
                                    onClick={() => definirAncora(new Date())}
                                >
                                    Hoje
                                </Botao>
                            </div>
                        </div>

                        <FiltrosFolha
                            direita={
                                <p className="cota">
                                    {filtrados.length} de {meusEventos.length} compromissos
                                </p>
                            }
                        >
                            <FiltroChip
                                premido={tipoFiltro === 'todos'}
                                aoPremir={() => definirTipoFiltro('todos')}
                                contagem={meusEventos.length}
                            >
                                Todos
                            </FiltroChip>

                            {(
                                Object.entries(ROTULOS.tipoEvento) as Array<[TipoEvento, string]>
                            ).map(([chave, rotulo]) => (
                                <FiltroChip
                                    key={chave}
                                    premido={tipoFiltro === chave}
                                    aoPremir={() =>
                                        definirTipoFiltro(tipoFiltro === chave ? 'todos' : chave)
                                    }
                                    contagem={contarPorTipo[chave] ?? 0}
                                >
                                    {rotulo}
                                </FiltroChip>
                            ))}

                            <Combo
                                className="w-56"
                                valor={projectoFiltro}
                                aoEscolher={definirProjectoFiltro}
                                aoLimpar={() => definirProjectoFiltro(null)}
                                placeholder="Todos os projectos"
                                opcoes={estado.projectos.map((p) => ({
                                    valor: p.id,
                                    rotulo: p.nome,
                                }))}
                            />
                        </FiltrosFolha>

                        {ordenados.length === 0 ? (
                            <div className="hachura-90 border border-graphite-20 p-8 text-center">
                                <CalendarDays aria-hidden className="mx-auto mb-2 size-6 text-graphite-32" />
                                <p className="cota text-graphite-48">
                                    {todosActivos
                                        ? 'Ainda não há compromissos escritos nesta agenda.'
                                        : 'Nenhum compromisso corresponde a estes filtros.'}
                                </p>
                            </div>
                        ) : vista === 'mes' ? (
                            <VistaMes
                                referencia={ancora}
                                eventos={filtrados}
                                projectos={nomesDeProjecto}
                                aoEscolher={escolher}
                                seleccionado={seleccionado}
                            />
                        ) : vista === 'semana' ? (
                            <VistaSemana
                                referencia={ancora}
                                eventos={ordenados}
                                projectos={nomesDeProjecto}
                                aoEscolher={escolher}
                                seleccionado={seleccionado}
                            />
                        ) : (
                            <ListaAgenda
                                eventos={ordenados}
                                projectos={nomesDeProjecto}
                                aoEscolher={escolher}
                                seleccionado={seleccionado}
                            />
                        )}

                        {eventoSeleccionado && (
                            <DetalheEvento
                                evento={eventoSeleccionado}
                                projecto={nomesDeProjecto}
                                aoFechar={() => definirSeleccionado(null)}
                                aoCorrigir={() =>
                                    definirFicha({
                                        janela: 'evento',
                                        evento: eventoSeleccionado,
                                        tarefa: null,
                                    })
                                }
                                aoNovaTarefa={() =>
                                    definirFicha({
                                        janela: 'tarefa',
                                        evento: null,
                                        tarefa: {
                                            projectoId: eventoSeleccionado.projectoId,
                                            prazo: diaDe(eventoSeleccionado.dataHoraInicio),
                                        },
                                    })
                                }
                            />
                        )}
                    </section>

                    <Carimbo
                        identidade="SGO · AGENDA"
                        className="w-[280px]"
                        linhas={[
                            { chave: 'Emitido', valor: dataExtenso(new Date()) },
                            { chave: 'Revisão', valor: 'C' },
                            { chave: 'Compromissos', valor: `${filtrados.length} de ${meusEventos.length}` },
                            { chave: 'Tipo dominante', valor: tipoDominante(meusEventos) },
                        ]}
                        rodado={2}
                    />
                </div>

                <p className="sr-only" aria-live="polite">
                    {ordenados.length} compromissos em {tituloPeriodo}.
                </p>
            </div>

            <ModalEvento
                aberto={ficha.janela === 'evento'}
                evento={ficha.evento}
                aoFechar={fecharFicha}
            />

            <ModalTarefa
                aberto={ficha.janela === 'tarefa'}
                tarefa={null}
                comProjecto={ficha.tarefa?.projectoId ?? null}
                comPrazo={ficha.tarefa?.prazo ?? null}
                aoFechar={fecharFicha}
            />
        </LayoutAdmin>
    );
}

/** A escolha entre as três vistas. Só uma acção primária por vista: o botão é a outra. */
function AlternadorVista({
    vista,
    aoMudar,
}: {
    vista: 'mes' | 'semana' | 'lista';
    aoMudar: (vista: 'mes' | 'semana' | 'lista') => void;
}) {
    const opcoes: Array<{
        chave: 'mes' | 'semana' | 'lista';
        rotulo: string;
        icone: LucideIcon;
    }> = [
        { chave: 'mes', rotulo: 'Mês', icone: CalendarDays },
        { chave: 'semana', rotulo: 'Semana', icone: CalendarRange },
        { chave: 'lista', rotulo: 'Lista', icone: List },
    ];

    return (
        <div
            role="group"
            aria-label="Vista da agenda"
            className="inline-flex overflow-hidden rounded-nib border border-graphite-32"
        >
            {opcoes.map(({ chave, rotulo, icone: Icone }, indice) => (
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

/** A vista de semana: sete colunas, cada dia com os seus compromissos por hora. */
function VistaSemana({
    referencia,
    eventos,
    projectos,
    aoEscolher,
    seleccionado,
}: {
    referencia: Date;
    eventos: EventoAgenda[];
    projectos: Record<string, string>;
    aoEscolher: (dia: string, evento?: EventoAgenda) => void;
    seleccionado: string | null;
}) {
    const dias = useMemo(() => gradeDaSemana(referencia), [referencia]);

    return (
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-graphite-12 bg-graphite-12 sm:grid-cols-7">
            {dias.map((dia) => {
                const chave = chaveDia(dia);
                const doDia = eventos.filter((evento) => diaDe(evento.dataHoraInicio) === chave);
                const hoje = chaveDia(dia) === chaveDia(new Date());

                return (
                    <div key={chave} className="min-h-32 bg-paper p-2">
                        <p
                            className={cn(
                                'cota mb-2 flex items-baseline justify-between',
                                hoje && 'text-amber-ink',
                            )}
                        >
                            <span>
                                {['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'][
                                    (dia.getDay() + 6) % 7
                                ]}{' '}
                                {dia.getDate()}/{String(dia.getMonth() + 1).padStart(2, '0')}
                            </span>
                            {hoje && <span className="text-2xs">hoje</span>}
                        </p>

                        <div className="space-y-1">
                            {doDia.length === 0 ? (
                                <p className="font-mono text-2xs text-graphite-32">—</p>
                            ) : (
                                doDia.map((evento) => (
                                    <button
                                        key={evento.id}
                                        type="button"
                                        onClick={() => aoEscolher(chave, evento)}
                                        className={cn(
                                            'w-full rounded-nib border-l-2 px-1.5 py-1 text-left',
                                            'focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none',
                                            seleccionado === evento.id
                                                ? 'bg-graphite-08 ring-1 ring-graphite'
                                                : 'bg-paper-raised hover:bg-graphite-08',
                                            evento.tipo === 'obra' && 'border-stamp',
                                            evento.tipo === 'profissional' && 'border-graphite-48',
                                            evento.tipo === 'pessoal' && 'border-amber',
                                        )}
                                    >
                                        <span className="block font-mono text-2xs tabular text-graphite-64">
                                            {hora(evento.dataHoraInicio)}
                                        </span>
                                        <span className="block truncate text-2xs text-graphite">
                                            {evento.titulo}
                                        </span>
                                        {evento.projectoId && (
                                            <span className="block truncate text-2xs text-stamp">
                                                {projectos[evento.projectoId]}
                                            </span>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/** A vista de lista: o tempo a descer, do mais antigo para o mais próximo. */
function ListaAgenda({
    eventos,
    projectos,
    aoEscolher,
    seleccionado,
}: {
    eventos: EventoAgenda[];
    projectos: Record<string, string>;
    aoEscolher: (dia: string, evento?: EventoAgenda) => void;
    seleccionado: string | null;
}) {
    const porDia = useMemo(() => {
        const mapa = new Map<string, EventoAgenda[]>();

        for (const evento of eventos) {
            const chave = diaDe(evento.dataHoraInicio);
            const actuais = mapa.get(chave) ?? [];

            actuais.push(evento);
            mapa.set(chave, actuais);
        }

        return mapa;
    }, [eventos]);

    return (
        <div className="space-y-6">
            {[...porDia.entries()].map(([chave, doDia]) => (
                <section key={chave}>
                    <div className="flex items-baseline justify-between border-b border-graphite-20 pb-1">
                        <h3 className="text-xl font-semibold tracking-tight text-graphite">
                            {dataExtenso(chave)}
                        </h3>
                        <p className="cota">
                            {doDia.length} {doDia.length === 1 ? 'compromisso' : 'compromissos'}
                        </p>
                    </div>

                    <ul className="mt-2 space-y-px">
                        {doDia.map((evento) => (
                            <li key={evento.id}>
                                <button
                                    type="button"
                                    onClick={() => aoEscolher(chave, evento)}
                                    className={cn(
                                        'grid w-full grid-cols-[auto_1fr] items-baseline gap-4 border-l-2 bg-paper px-3 py-2 text-left',
                                        'focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none',
                                        seleccionado === evento.id
                                            ? 'bg-graphite-08'
                                            : 'hover:bg-graphite-04',
                                        evento.tipo === 'obra' && 'border-stamp',
                                        evento.tipo === 'profissional' && 'border-graphite-48',
                                        evento.tipo === 'pessoal' && 'border-amber',
                                    )}
                                >
                                    <span className="font-mono text-2xs tabular text-graphite-64">
                                        {hora(evento.dataHoraInicio)}
                                        {evento.dataHoraFim && `–${hora(evento.dataHoraFim)}`}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-sm text-graphite">
                                            {evento.titulo}
                                        </span>
                                        {evento.descricao && (
                                            <span className="anotacao normal-case">
                                                {evento.descricao}
                                            </span>
                                        )}
                                        <span className="mt-1 flex items-center gap-1.5">
                                            <Selo tinta={tipoTinta(evento.tipo)} traco="leve" tamanho="sm">
                                                {ROTULOS.tipoEvento[evento.tipo]}
                                            </Selo>
                                            {evento.projectoId && (
                                                <Selo tinta="carimbo" traco="leve" tamanho="sm">
                                                    {projectos[evento.projectoId]}
                                                </Selo>
                                            )}
                                        </span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}

/**
 * O evento seleccionado, escrito no canto. Mostra o que o evento é e dá as duas
 * acções que dele saem: corrigir, ou abrir uma tarefa com a data já escrita.
 */
function DetalheEvento({
    evento,
    projecto,
    aoFechar,
    aoCorrigir,
    aoNovaTarefa,
}: {
    evento: EventoAgenda;
    projecto: Record<string, string>;
    aoFechar: () => void;
    aoCorrigir: () => void;
    aoNovaTarefa: () => void;
}) {
    return (
        <aside
            aria-label="Compromisso seleccionado"
            className="space-y-3 border border-graphite-32 bg-paper-raised p-5 shadow-folha"
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="cota">Compromisso seleccionado</p>
                    <h3 className="text-2xl font-semibold tracking-tight text-graphite">
                        {evento.titulo}
                    </h3>
                </div>
                <button
                    type="button"
                    onClick={aoFechar}
                    className="cota text-graphite-64 underline underline-offset-2 hover:text-graphite focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none"
                >
                    fechar
                </button>
            </div>

            {evento.descricao && <p className="anotacao normal-case">{evento.descricao}</p>}

            <div className="flex flex-wrap items-center gap-1.5">
                <Selo tinta={tipoTinta(evento.tipo)} traco="medio" tamanho="sm">
                    {ROTULOS.tipoEvento[evento.tipo]}
                </Selo>
                {evento.projectoId && (
                    <Selo tinta="carimbo" traco="medio" tamanho="sm">
                        {projecto[evento.projectoId]}
                    </Selo>
                )}
            </div>

            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt className="cota">Quando</dt>
                <dd className="font-mono tabular text-graphite">
                    {dataHora(evento.dataHoraInicio)}
                    {evento.dataHoraFim && ` – ${hora(evento.dataHoraFim)}`}
                </dd>

                {evento.local && (
                    <>
                        <dt className="cota">Onde</dt>
                        <dd className="text-graphite">{evento.local}</dd>
                    </>
                )}

                {evento.lembreteMinutosAntes !== null && (
                    <>
                        <dt className="cota">Lembrete</dt>
                        <dd className="text-graphite-64">
                            {rotuloLembrete(evento.lembreteMinutosAntes)} antes
                        </dd>
                    </>
                )}
            </dl>

            <div className="flex flex-wrap gap-2 border-t border-graphite-12 pt-3">
                <Botao variante="contorno" onClick={aoCorrigir}>
                    Corrigir evento
                </Botao>
                <Botao variante="carimbo" onClick={aoNovaTarefa}>
                    <Plus aria-hidden />
                    Nova tarefa a partir daqui
                </Botao>
            </div>
        </aside>
    );
}

function rotuloLembrete(minutos: number): string {
    if (minutos < 60) {
        return `${minutos} minutos`;
    }

    if (minutos < 1440) {
        return `${minutos / 60} hora${minutos === 60 ? '' : 's'}`;
    }

    return `${minutos / 1440} dia${minutos === 1440 ? '' : 's'}`;
}

function tipoTinta(tipo: TipoEvento): 'carimbo' | 'grafite' | 'ambar' {
    if (tipo === 'obra') {
        return 'carimbo';
    }

    return tipo === 'profissional' ? 'grafite' : 'ambar';
}

function tipoDominante(eventos: EventoAgenda[]): string {
    if (eventos.length === 0) {
        return '—';
    }

    const conta: Record<string, number> = {};

    for (const evento of eventos) {
        conta[evento.tipo] = (conta[evento.tipo] ?? 0) + 1;
    }

    const [tipo] = Object.entries(conta).sort((a, b) => b[1] - a[1])[0];

    return ROTULOS.tipoEvento[tipo as TipoEvento];
}

function medicoes(eventos: EventoAgenda[]) {
    const obra = eventos.filter((evento) => evento.tipo === 'obra').length;
    const pessoal = eventos.filter((evento) => evento.tipo === 'pessoal').length;
    const hoje = chaveDia(new Date());
    const noDia = eventos.filter((evento) => diaDe(evento.dataHoraInicio) === hoje).length;

    return [
        { rotulo: 'Compromissos', valor: numero(eventos.length), nota: 'no caderno' },
        { rotulo: 'De obra', valor: numero(obra), nota: 'ligados a projecto' },
        { rotulo: 'Pessoais', valor: numero(pessoal), nota: 'sem projecto' },
        { rotulo: 'Hoje', valor: numero(noDia), nota: 'a resolver' },
    ];
}
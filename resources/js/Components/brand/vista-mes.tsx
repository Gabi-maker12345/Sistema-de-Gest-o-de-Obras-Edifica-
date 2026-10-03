import { useMemo, useState } from 'react';

import type { EventoAgenda } from '@/Data/types';
import { DIAS_SEMANA, chaveDia, diaDe, gradeDoMes } from '@/lib/agenda';
import { cn } from '@/lib/utils';

/**
 * A vista de mês.
 *
 * A grade é uma grelha HTML, não um gráfico. Chegou aqui como `ScatterChart`
 * do Recharts com uma `shape` por célula, e era a decisão errada: o Recharts
 * desenhava a hachura e os eventosVINham por cima, numa camada absoluta — duas
 * geometrias a concordar ao píxel, mantidas por dois números escritos à mão.
 * Quando um dia e um evento se desalinham, a falha é silenciosa e parece um
 * defeito de CSS.
 *
 * Numa grelha só não há o que desalinhar: o browser resolve a largura, a
 * altura e as quebras, e o evento vive dentro da sua própria célula. O Recharts
 * continua no Dashboard, onde é a ferramenta certa.
 *
 * Os dias do mês vizinho entram esbatidos porque é assim que se lê a semana
 * que atravessa a virada do mês, e o dia de hoje leva o traço de acção — o âmbar
 * a dizer «aqui».
 */

/** Altura mínima de uma célula. Alto o suficiente para três barras de evento. */
const ALTURA_MINIMA = 'min-h-[108px]';

/** Quantos eventos cabem antes de a célula dizer que há mais. */
const CABEM = 3;

export function VistaMes({
    referencia,
    eventos,
    projectos,
    aoEscolher,
    seleccionado,
}: {
    referencia: Date;
    /** Eventos já filtrados pelo que o utilizador pode ver. */
    eventos: EventoAgenda[];
    /** Nome do projecto por id, para a pista do evento. */
    projectos: Record<string, string>;
    /** Recebe o dia e, se o clique foi num evento, o evento. */
    aoEscolher: (dia: string, evento?: EventoAgenda) => void;
    seleccionado: string | null;
}) {
    const dias = useMemo(() => gradeDoMes(referencia), [referencia]);
    const hoje = chaveDia(new Date());

    const porDia = useMemo(() => {
        const mapa = new Map<string, EventoAgenda[]>();

        for (const evento of eventos) {
            const chave = diaDe(evento.dataHoraInicio);
            const actuais = mapa.get(chave) ?? [];

            actuais.push(evento);
            mapa.set(chave, actuais);
        }

        for (const lista of mapa.values()) {
            lista.sort((a, b) => a.dataHoraInicio.localeCompare(b.dataHoraInicio));
        }

        return mapa;
    }, [eventos]);

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-7 border-b border-graphite-32 pb-1">
                {DIAS_SEMANA.map((dia, indice) => (
                    <p
                        key={dia}
                        className={cn('cota text-center', indice > 4 && 'text-graphite-48')}
                    >
                        {dia}
                    </p>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-px overflow-hidden border border-graphite-12 bg-graphite-12">
                {dias.map((dia) => {
                    const chave = chaveDia(dia);
                    const doMes = dia.getMonth() === referencia.getMonth();

                    return (
                        <div
                            key={chave}
                            className={cn(
                                ALTURA_MINIMA,
                                'flex flex-col gap-1 bg-paper p-1.5',
                                chave === hoje && 'bg-amber-08',
                            )}
                        >
                            <NumeroDoDia
                                chave={chave}
                                doMes={doMes}
                                hoje={chave === hoje}
                            />

                            <EventosDoDia
                                chave={chave}
                                eventos={porDia.get(chave) ?? []}
                                projectos={projectos}
                                aoEscolher={aoEscolher}
                                seleccionado={seleccionado}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * O número do dia. Hoje é o único com âmbar: é a acção, não um destaque, e é
 * o que diz ao olho onde estamos dentro do mês.
 */
function NumeroDoDia({
    chave,
    doMes,
    hoje,
}: {
    chave: string;
    doMes: boolean;
    hoje: boolean;
}) {
    return (
        <span
            aria-current={hoje ? 'date' : undefined}
            className={cn(
                'flex h-5 items-center justify-end rounded-nib px-1 font-mono text-2xs tabular',
                hoje && 'bg-amber font-semibold text-graphite',
                !hoje && doMes && 'text-graphite',
                !hoje && !doMes && 'text-graphite-32',
            )}
        >
            {Number(chave.slice(8))}
        </span>
    );
}

/**
 * Os eventos de uma célula.
 *
 * Cabem três. O que sobra diz-se na última linha («+2») em vez de espremer o
 * sétimo compromisso numa barra de seis pixels: um dia com sete compromissos é
 * um dia para ler, não para espremer.
 *
 * O dia inteiro também é clicável, e é o alvo grande — quem tem um evento na
 * cabeça e só quer a data não tem de acertar numa barra de 20px.
 */
function EventosDoDia({
    chave,
    eventos,
    projectos,
    aoEscolher,
    seleccionado,
}: {
    chave: string;
    eventos: EventoAgenda[];
    projectos: Record<string, string>;
    aoEscolher: (dia: string, evento?: EventoAgenda) => void;
    seleccionado: string | null;
}) {
    const [expandido, definirExpandido] = useState(false);

    if (eventos.length === 0) {
        return null;
    }

    const visiveis = expandido ? eventos : eventos.slice(0, CABEM);
    const restantes = eventos.length - visiveis.length;

    return (
        <div className="flex flex-col gap-px">
            {visiveis.map((evento) => (
                <button
                    key={evento.id}
                    type="button"
                    onClick={() => aoEscolher(chave, evento)}
                    title={pista(evento, projectos)}
                    className={cn(
                        'flex items-center gap-1 rounded-nib px-1 py-px text-left text-2xs',
                        'focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none',
                        seleccionado === evento.id
                            ? 'bg-graphite-08 text-graphite ring-1 ring-graphite'
                            : 'text-graphite-64 hover:bg-graphite-08',
                    )}
                >
                    <span
                        aria-hidden
                        className={cn('size-1.5 shrink-0', pontoDoTipo(evento.tipo))}
                    />
                    <span className="truncate">{horaCurta(evento.dataHoraInicio)}</span>
                    <span className="truncate">{evento.titulo}</span>
                </button>
            ))}

            {restantes > 0 && (
                <button
                    type="button"
                    onClick={() => definirExpandido(!expandido)}
                    aria-expanded={expandido}
                    className={cn(
                        'cota px-1 text-left text-graphite-48',
                        'focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none',
                    )}
                >
                    +{restantes}
                </button>
            )}
        </div>
    );
}

/**
 * O ponto do tipo: a cor é a única codificação do tipo na vista de mês, e é
 * legível porque o tipo também se lê pelo texto ao lado. `obra` é carimbo — é
 * identidade; profissional é grafite; pessoal é âmbar, e o âmbar aqui é o traço
 * de acção sobre o dia, não um enfeite.
 */
function pontoDoTipo(tipo: EventoAgenda['tipo']): string {
    if (tipo === 'obra') {
        return 'bg-stamp';
    }

    return tipo === 'profissional' ? 'bg-graphite-48' : 'bg-amber';
}

function pista(evento: EventoAgenda, projectos: Record<string, string>): string {
    const partes = [
        `${horaCurta(evento.dataHoraInicio)} · ${evento.titulo}`,
        evento.local || null,
        evento.projectoId ? projectos[evento.projectoId] : null,
    ];

    return partes.filter(Boolean).join(' · ');
}

function horaCurta(iso: string): string {
    return iso.slice(11, 16);
}
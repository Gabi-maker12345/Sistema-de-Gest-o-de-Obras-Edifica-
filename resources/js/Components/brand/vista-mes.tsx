import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis } from 'recharts';

import type { EventoAgenda } from '@/Data/types';
import { chaveDia, diaDe, gradeDoMes } from '@/lib/agenda';
import { cn } from '@/lib/utils';

/**
 * A vista de mês.
 *
 * A grade é desenhada no Recharts como um `ScatterChart` sem eixos: cada ponto
 * é um dia e a forma de cada ponto é a célula. Não é o uso óbvio da biblioteca —
 * aqui não há série a medir, há uma grelha a desenhar — mas é o que dá a escala
 * e o redimensionamento sem escrever a medida à mão, e o `shape` deixa a célula
 * ser a prancha: hairline, o dia em mono tabular e hoje com o traço de acção.
 *
 * O que o gráfico não faz é mostrar os eventos. Quem os escreve é a camada HTML
 * por cima, porque um `<button>` dentro de um `shape` não é focável, e um evento
 * que não se abre ao teclado não é um evento: é uma imagem.
 */

/** Altura de uma faixa do mês. O número aparece duas vezes e tem de ser o mesmo. */
const ALTURA = 108;
const FAIXAS = 6;

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
    /** Nome do projecto por id, para o badge do evento. */
    projectos: Record<string, string>;
    /** `dia` ao clicar no dia, `dia` + `evento` ao clicar num evento. */
    aoEscolher: (dia: string, evento?: EventoAgenda) => void;
    seleccionado: string | null;
}) {
    const [largura, definirLargura] = useState(0);
    const caixa = useRef<HTMLDivElement>(null);

    // A largura da célula vem do contentor medido, não de `window`: o mês vive
    // dentro de uma folha que muda com a janela e com a barra de revisão.
    useEffect(() => {
        const elemento = caixa.current;

        if (!elemento) {
            return;
        }

        const medir = () => definirLargura(elemento.clientWidth);

        medir();

        const observador = new ResizeObserver(medir);

        observador.observe(elemento);

        return () => observador.disconnect();
    }, []);

    const dias = useMemo(() => gradeDoMes(referencia), [referencia]);

    /**
     * Cada dia vira um ponto: coluna 0–6, linha 0–5. O Recharts dá as
     * coordenadas do ponto em píxeis e a forma desenha a célula à volta delas.
     */
    const pontos = useMemo(
        () =>
            dias.map((dia, indice) => ({
                x: indice % 7,
                y: Math.floor(indice / 7),
                chave: chaveDia(dia),
                doMes: dia.getMonth() === referencia.getMonth(),
                hoje: chaveDia(dia) === chaveDia(new Date()),
            })),
        [dias, referencia],
    );

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

    const celula = largura / 7;

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-7 border-b border-graphite-32 pb-1">
                {['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'].map((dia, indice) => (
                    <p key={dia} className={cn('cota text-center', indice > 4 && 'text-graphite-48')}>
                        {dia}
                    </p>
                ))}
            </div>

            <div ref={caixa} className="relative">
                {largura > 0 && (
                    <>
                        <ResponsiveContainer width={largura} height={ALTURA * FAIXAS}>
                            <ScatterChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                <XAxis
                                    type="number"
                                    dataKey="x"
                                    domain={[0, 6]}
                                    hide
                                    allowDecimals={false}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="y"
                                    domain={[0, 5]}
                                    reversed
                                    hide
                                    allowDecimals={false}
                                />
                                <Scatter
                                    data={pontos}
                                    isAnimationActive={false}
                                    shape={(bruto: unknown) => {
                                        const { cx, cy, payload } = bruto as {
                                            cx: number;
                                            cy: number;
                                            payload: (typeof pontos)[number];
                                        };

                                        return (
                                            <rect
                                                x={cx - celula / 2}
                                                y={cy - ALTURA / 2}
                                                width={celula}
                                                height={ALTURA}
                                                fill="transparent"
                                                stroke={
                                                    payload.hoje
                                                        ? 'var(--amber)'
                                                        : 'var(--graphite-12)'
                                                }
                                                strokeWidth={1}
                                            />
                                        );
                                    }}
                                />
                            </ScatterChart>
                        </ResponsiveContainer>

                        <div className="pointer-events-none absolute inset-0 grid grid-cols-7 grid-rows-6">
                            {pontos.map((ponto) => (
                                <div key={ponto.chave} className="pointer-events-auto">
                                    <EventosDoDia
                                        ponto={ponto}
                                        eventos={porDia.get(ponto.chave) ?? []}
                                        projectos={projectos}
                                        aoEscolher={aoEscolher}
                                        seleccionado={seleccionado}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/**
 * Os eventos de um dia, por cima da célula.
 *
 * Só entra o que cabe: 108px de faixa comportam três barras e o número do dia.
 * O que sobra diz-se na última linha («+2»), porque um dia com sete compromissos
 * é um dia para ler, não para espremer.
 */
function EventosDoDia({
    ponto,
    eventos,
    projectos,
    aoEscolher,
    seleccionado,
}: {
    ponto: { chave: string; doMes: boolean; hoje: boolean };
    eventos: EventoAgenda[];
    projectos: Record<string, string>;
    aoEscolher: (dia: string, evento?: EventoAgenda) => void;
    seleccionado: string | null;
}) {
    const [expandido, definirExpandido] = useState(false);
    const visiveis = expandido ? eventos : eventos.slice(0, 3);
    const restantes = eventos.length - visiveis.length;

    const abrirDia = useCallback(() => {
        definirExpandido(!expandido);
    }, [expandido]);

    return (
        <div className="flex h-full flex-col gap-px p-1">
            <button
                type="button"
                onClick={abrirDia}
                aria-expanded={expandido}
                aria-label={`${ponto.chave}${eventos.length > 0 ? `, ${eventos.length} eventos` : ''}`}
                className={cn(
                    'flex h-5 items-center justify-end rounded-nib px-1 font-mono text-2xs tabular',
                    'focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none',
                    ponto.hoje
                        ? 'bg-amber font-semibold text-graphite'
                        : ponto.doMes
                          ? 'text-graphite hover:bg-graphite-08'
                          : 'text-graphite-32',
                )}
            >
                {Number(ponto.chave.slice(8))}
            </button>

            {visiveis.map((evento) => (
                <button
                    key={evento.id}
                    type="button"
                    onClick={() => aoEscolher(ponto.chave, evento)}
                    title={`${horaCurta(evento.dataHoraInicio)} · ${evento.titulo}${
                        evento.projectoId ? ` · ${projectos[evento.projectoId] ?? ''}` : ''
                    }`}
                    className={cn(
                        'flex items-center gap-1 rounded-nib px-1 text-left text-2xs',
                        'focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none',
                        seleccionado === evento.id
                            ? 'bg-graphite-08 text-graphite ring-1 ring-graphite'
                            : 'text-graphite-64 hover:bg-graphite-08',
                    )}
                >
                    <span
                        aria-hidden
                        className={cn(
                            'size-1.5 shrink-0 rounded-full',
                            evento.tipo === 'obra'
                                ? 'bg-stamp'
                                : evento.tipo === 'profissional'
                                  ? 'bg-graphite-64'
                                  : 'bg-amber',
                        )}
                    />
                    <span className="truncate">
                        {horaCurta(evento.dataHoraInicio)} {evento.titulo}
                    </span>
                </button>
            ))}

            {restantes > 0 && (
                <button
                    type="button"
                    onClick={abrirDia}
                    className="cota px-1 text-left text-graphite-48 focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none"
                >
                    +{restantes}
                </button>
            )}
        </div>
    );
}

function horaCurta(iso: string): string {
    return iso.slice(11, 16);
}
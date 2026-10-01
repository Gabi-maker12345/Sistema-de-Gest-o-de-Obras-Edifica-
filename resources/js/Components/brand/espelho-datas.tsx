import { Link } from '@inertiajs/react';
import { useCallback, useMemo, useState, type ReactNode } from 'react';

import { EstadoSelo } from '@/Components/ui/badge';
import { data } from '@/lib/format';
import { cn } from '@/lib/utils';

import { hoje } from '@/lib/espelho';
import { dominioDe, largura, numeroDoMes, posicao, reguaDeHoje } from '@/lib/espelho';
import type { Dominio, Janela } from '@/lib/espelho';

/**
 * O espelho de datas: o registo dos projectos lido contra o calendário.
 *
 * Não é um cronograma. A janela de cada obra é uma cota com traços de extremo,
 * o enchimento é o medidor do painel esticado sobre o eixo das datas — sólido
 * o que está construído, hachurado o que está aprovado — e a régua de hoje é a
 * linha que separa o que ainda tem prazo do que já não tem. Os números ficam
 * numa margem tabular à direita, porque uma medição que só se lê por forma não
 * serve a quem tem de comparar dois projectos.
 *
 * A única zona a lápis vermelho é a janela cujo prazo fechou sem o trabalho
 * ter chegado ao fim, e o desvio de 10 pp ou mais entre as duas execuções.
 */
const GRELHA =
    'grid grid-cols-1 gap-x-4 gap-y-2 lg:grid-cols-[14rem_minmax(0,1fr)_14rem] lg:items-center';

export function EspelhoDeDatas({
    janelas,
    dominio,
    referencia = hoje(),
    numeroDe,
    areas,
    vazio,
    className,
}: {
    janelas: Janela[];
    dominio?: Dominio;
    referencia?: Date;
    /** A numeração da folha, na ordem em que a lista foi filtrada. */
    numeroDe: (projectoId: string) => number;
    areas: Record<string, string>;
    /** O texto do estado sem registo, já distinguindo filtro de vazio de sessão. */
    vazio: string;
    className?: string;
}) {
    const casa = dominio ?? dominioDe(janelas, referencia);

    if (janelas.length === 0) {
        return (
            <p className={cn('border border-dashed border-graphite-32 p-6 text-sm text-graphite-64', className)}>
                {vazio}
            </p>
        );
    }

    return (
        <div className={className}>
            <Eixo casa={casa} referencia={referencia} />

            <ul>
                {janelas.map((janela) => (
                    <Linha
                        key={janela.projecto.id}
                        janela={janela}
                        casa={casa}
                        referencia={referencia}
                        numero={numeroDe(janela.projecto.id)}
                        area={areas[janela.projecto.areaId ?? ''] ?? null}
                    />
                ))}
            </ul>
        </div>
    );
}

/** A largura de uma etiqueta de mês da régua, em pixéis. */
const LARGURA_ETIQUETA = 34;

/** A régua dos meses, com a de hoje a atravessá-la. */
function Eixo({ casa, referencia }: { casa: Dominio; referencia: Date }) {
    const hojeX = reguaDeHoje(casa, referencia);
    const [trilho, medirTrilho] = useMedir();

    // A etiqueta é posicionada em percentagem do trilho, mas a largura dela é
    // fixa em pixéis. As duas coisas só concordam enquanto os meses ficam
    // longe uns dos outros — e decidir isso por `indice % 2` assumia um
    // espaçamento uniforme que o ecrã estreito deixa de ter. Com a largura real
    // do trilho, cada mês pergunta se ainda há espaço até ao vizinho.
    const cabem = useMemo(
        () => cabemOsMeses(casa, trilho),
        [casa, trilho],
    );

    return (
        <div className={cn(GRELHA, 'border-b border-graphite-32 pb-2')}>
            <p className="cota text-graphite">Projecto · uma linha por obra</p>

            <div className="flex items-baseline justify-between gap-2">
                {/* O ano fica na linha da cota, fora do trilho. Dentro do trilho
                    ficava a 28px do primeiro mês e batia-lhe, porque o trilho
                    começa na margem esquerda da grelha e não da etiqueta. */}
                <p className="cota text-graphite-48">{casa.de.getFullYear()}</p>
                <p className="cota text-graphite-48">{casa.meses.length} meses em obra</p>
            </div>

            <div className="relative h-7" ref={medirTrilho}>

                {casa.meses.map((mes, indice) => (
                    <div
                        key={mes.de.toISOString()}
                        className="absolute top-0 bottom-0"
                        style={{ left: `${posicao(mes.de, casa)}%` }}
                    >
                        <span aria-hidden className="absolute top-0 h-2 w-px bg-graphite-32" />
                        <span
                            className="cota absolute top-2.5 whitespace-nowrap"
                            hidden={!cabem[indice]}
                        >
                            {mes.rotulo} {numeroDoMes(mes.de)}
                        </span>
                    </div>
                ))}

                <div className="absolute top-0 bottom-0" style={{ left: `${hojeX}%` }}>
                    <span aria-hidden className="absolute inset-y-0 w-px bg-graphite-64" />
                    <span
                        className={cn(
                            'cota absolute -top-0.5 whitespace-nowrap text-graphite',
                            hojeX > 78 ? 'right-1' : 'left-1',
                        )}
                    >
                        hoje
                    </span>
                </div>
            </div>

            <div className="hidden justify-end lg:flex">
                <p className="cota">Fís. · Fin. · Desvio</p>
            </div>
        </div>
    );
}

/** A largura do trilho das datas, em pixéis, reavaliada quando muda. */
function useMedir() {
    const [largura, definirLargura] = useState(0);

    const medir = useCallback((el: HTMLDivElement | null) => {
        if (!el) {
            return;
        }

        const observacao = new ResizeObserver(([entrada]) => {
            definirLargura(Math.round(entrada.contentRect.width));
        });

        observacao.observe(el);
    }, []);

    return [largura, medir] as const;
}

/**
 * Que meses da régua cabem, sem se sobreporem.
 *
 * A etiqueta «fev 2» mede ~28px. Só entra se o espaço até ao mês seguinte for
 * maior do que isso; caso contrário é omitida e fica o traço, que sozinho já
 * marca a posição. Preferimos uma régua com menos nomes a uma régua em que os
 * nomes se atravessam — o traço continua a dizer quando é, o nome ilegível não
 * diz nada.
 */
function cabemOsMeses(casa: Dominio, trilho: number) {
    const cabem = casa.meses.map(() => true);

    if (trilho === 0) {
        return cabem;
    }

    for (let i = 1; i < casa.meses.length; i++) {
        const distancia =
            ((posicao(casa.meses[i].de, casa) - posicao(casa.meses[i - 1].de, casa)) / 100) *
            trilho;

        if (distancia < LARGURA_ETIQUETA) {
            cabem[i - 1] = false;
            cabem[i] = false;
        }
    }

    // O primeiro e o último nunca são omitidos: são as pontas da régua, e é
    // eles que dizem onde a obra começa e onde acaba.
    cabem[0] = true;
    cabem[cabem.length - 1] = true;

    return cabem;
}

function Linha({
    janela,
    casa,
    referencia,
    numero,
    area,
}: {
    janela: Janela;
    casa: Dominio;
    referencia: Date;
    numero: number;
    area: string | null;
}) {
    const { projecto } = janela;
    const inicioX = posicao(janela.inicio, casa);
    const fimX = posicao(janela.fim, casa);
    const hojeX = reguaDeHoje(casa, referencia);
    const larguraJanela = Math.max(largura(janela, casa), 0.4);
    const desvioFirme = janela.desvio >= 10;
    const traco = janela.prazoEstourado ? 'var(--color-red-pencil)' : 'var(--color-graphite-32)';
    const atraso = Math.max(0, hojeX - fimX);

    return (
        <li className="border-b border-graphite-20">
            <Link
                href={route('admin.projectos.mostrar', { projecto: projecto.id })}
                className={cn(
                    GRELHA,
                    'py-3 transition-colors hover:bg-graphite-04 lg:py-2.5',
                    'focus-visible:bg-graphite-04',
                )}
            >
                <div className="min-w-0 space-y-1">
                    <p className="truncate font-medium text-graphite">
                        <span className="font-mono text-2xs text-graphite-64 lg:hidden">
                            {String(numero).padStart(2, '0')}{' '}
                        </span>
                        {projecto.nome}
                    </p>

                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <EstadoSelo estado={projecto.estadoGeral} />
                        <span className="truncate text-xs text-graphite-64">
                            {projecto.cliente}
                            {area && <span className="cota ml-2">{area}</span>}
                        </span>
                    </p>

                    <p className="cota truncate">
                        {data(projecto.dataInicio)} →{' '}
                        {data(projecto.dataFimReal ?? projecto.dataFimPrevista)}
                        {projecto.dataFimReal && <span className="ml-1">real</span>}
                    </p>
                </div>

                {/*
                 * A área de plotação. A régua de hoje é repetida em cada linha
                 * em vez de ser uma camada única: as linhas são contíguas, pelo
                 * que a soma lê-se como uma só linha contínua, e cada uma sabe
                 * calcular a sua posição sem depender da largura em píxeis de um
                 * contentor que ainda não mediu.
                 */}
                <div className="relative h-12">
                    <span
                        aria-hidden
                        className="absolute inset-y-0 w-px bg-graphite-64"
                        style={{ left: `${hojeX}%` }}
                    />

                    {/* O que ficou por construir depois de o prazo ter fechado. */}
                    {janela.prazoEstourado && atraso > 0 && (
                        <span
                            aria-hidden
                            className="absolute inset-y-1"
                            style={{
                                left: `${fimX}%`,
                                width: `${atraso}%`,
                                backgroundImage:
                                    'repeating-linear-gradient(45deg, var(--color-red-pencil-32) 0 1px, transparent 1px 6px)',
                            }}
                        />
                    )}

                    <span
                        role="img"
                        aria-label={`Janela de ${data(projecto.dataInicio)} a ${data(
                            projecto.dataFimReal ?? projecto.dataFimPrevista,
                        )}. Execução física ${Math.round(janela.fisica)}%, execução financeira ${Math.round(
                            janela.financeira,
                        )}%.${janela.prazoEstourado ? ' Prazo fechado com trabalho por concluir.' : ''}`}
                        className="absolute top-2 bottom-2 border-y"
                        style={{
                            left: `${inicioX}%`,
                            width: `${larguraJanela}%`,
                            minWidth: '2px',
                            borderColor: traco,
                            borderStyle: projecto.estadoGeral === 'suspenso' ? 'dashed' : 'solid',
                            backgroundColor: 'var(--color-paper-sunken)',
                            backgroundImage:
                                projecto.estadoGeral === 'cancelado'
                                    ? 'repeating-linear-gradient(90deg, var(--color-graphite-16) 0 1px, transparent 1px 6px)'
                                    : undefined,
                        }}
                    >
                        {/* Os traços de extremo da cota. */}
                        <span
                            aria-hidden
                            className="absolute inset-y-[-3px] left-0 w-px"
                            style={{ backgroundColor: traco }}
                        />
                        <span
                            aria-hidden
                            className="absolute inset-y-[-3px] right-0 w-px"
                            style={{ backgroundColor: traco }}
                        />

                        {/* Físico sólido: o que está erguido, um facto. */}
                        <span
                            aria-hidden
                            className="absolute top-[4px] bottom-[15px] left-0"
                            style={{
                                width: `${Math.max(0, Math.min(100, janela.fisica))}%`,
                                backgroundColor: 'var(--color-graphite)',
                            }}
                        />

                        {/* Financeiro hachurado: o que está aprovado, um cálculo. */}
                        <span
                            aria-hidden
                            className="absolute top-[19px] bottom-[4px] left-0"
                            style={{
                                width: `${Math.max(0, Math.min(100, janela.financeira))}%`,
                                backgroundImage:
                                    'repeating-linear-gradient(45deg, var(--color-graphite-64) 0 1px, transparent 1px 4px)',
                            }}
                        />
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-x-3 border-t border-graphite-12 pt-1.5 lg:grid-cols-1 lg:border-0 lg:pt-0 lg:text-right">
                    <CotaMargem rotulo="Fís." valor={`${Math.round(janela.fisica)}%`} />
                    <CotaMargem
                        rotulo="Fin."
                        valor={`${Math.round(janela.financeira)}%`}
                        derivado
                    />
                    <CotaMargem
                        rotulo="Desvio"
                        valor={`${janela.desvio >= 0 ? '+' : '−'}${Math.abs(
                            Math.round(janela.desvio),
                        )} pp`}
                        critico={desvioFirme}
                    />
                </div>
            </Link>
        </li>
    );
}

function CotaMargem({
    rotulo,
    valor,
    critico = false,
    derivado = false,
}: {
    rotulo: string;
    valor: string;
    critico?: boolean;
    derivado?: boolean;
}) {
    return (
        <span className="flex items-baseline justify-between gap-1 lg:justify-end">
            <span className="cota lg:sr-only">{rotulo}</span>
            <span
                title={derivado ? 'Despesas aprovadas ÷ valor contratual' : 'Média da % de conclusão das actividades'}
                className={cn(
                    'font-mono text-xs tabular lg:text-sm',
                    critico ? 'font-semibold text-red-pencil' : 'text-graphite',
                )}
            >
                {valor}
            </span>
        </span>
    );
}

/** A legenda da folha: como se lê o enchimento e o que é a zona vermelha. */
export function LegendaEspelho({ className }: { className?: string }) {
    return (
        <div className={cn('flex flex-wrap items-center gap-x-6 gap-y-2', className)}>
            <ItemLegenda
                texto="Execução física — o que está construído"
                amostra={<span className="h-2 w-8 bg-graphite" />}
            />
            <ItemLegenda
                texto="Execução financeira — o que está aprovado"
                amostra={
                    <span
                        className="h-2 w-8"
                        style={{
                            backgroundImage:
                                'repeating-linear-gradient(45deg, var(--color-graphite-64) 0 1px, transparent 1px 4px)',
                        }}
                    />
                }
            />
            <ItemLegenda
                texto="Prazo fechado com obra por fazer"
                amostra={
                    <span
                        className="h-2 w-8"
                        style={{
                            backgroundImage:
                                'repeating-linear-gradient(45deg, var(--color-red-pencil-32) 0 1px, transparent 1px 6px)',
                        }}
                    />
                }
            />
        </div>
    );
}

function ItemLegenda({ texto, amostra }: { texto: string; amostra: ReactNode }) {
    return (
        <span className="flex items-center gap-2">
            <span aria-hidden className="shrink-0 border border-graphite-32">
                {amostra}
            </span>
            <span className="anotacao normal-case">{texto}</span>
        </span>
    );
}

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { data as formatarData } from '@/lib/format';
import { dataLocal } from '@/lib/espelho';
import { cn } from '@/lib/utils';

import { Bolha, BolhaConteudo } from './popover';

/**
 * O calendário: um mês desenhado como a grade de um gabarito.
 *
 * A biblioteca de calendário traria um mês de outra casa — cantos redondos,
 * sombra desfocada, azul de sistema. Este é o mês do registo: a semana em cota,
 * os dias em mono tabular, hoje com o traço de acção e o escolhido com o
 * grafite cheio, e a navegação com os mesmos traços de extremo da linha de
 * cota. É a data como a prancha a escreve: `14/03/2026`.
 */
const DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
const MESES = new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' });

function chave(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate(),
    ).padStart(2, '0')}`;
}

function deslocar(d: Date, dias: number): Date {
    const novo = new Date(d);

    novo.setDate(novo.getDate() + dias);

    return novo;
}

function deslocarMes(d: Date, meses: number): Date {
    const novo = new Date(d.getFullYear(), d.getMonth() + meses, 1);

    return novo;
}

/** A segunda-feira da semana de `d`. */
function inicioDaSemana(d: Date): Date {
    const novo = new Date(d);
    const dia = (novo.getDay() + 6) % 7;

    return deslocar(novo, -dia);
}

export function Calendario({
    id,
    valor,
    aoEscolher,
    vazio = 'Sem data',
    desactivado = false,
    minimo,
    maximo,
    className,
}: {
    id?: string;
    valor: string | null;
    aoEscolher: (iso: string) => void;
    vazio?: string;
    desactivado?: boolean;
    minimo?: string;
    maximo?: string;
    className?: string;
}) {
    const [aberto, definirAberto] = useState(false);
    const [foco, definirFoco] = useState<Date>(() => dataLocal(valor) ?? new Date());
    const limites = useRef({ minimo, maximo });
    const gradeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        limites.current = { minimo, maximo };
    });

    useEffect(() => {
        if (aberto) {
            definirFoco(dataLocal(valor) ?? new Date());
        }
    }, [aberto, valor]);

    /*
     * O foco anda com as setas, mas o que o leitor de ecrã anuncia é o elemento
     * com o foco do teclado — e o `tabIndex` não o move. Sem isto, quem navega
     * por teclado continua a ouvir o dia em que entrou no mês enquanto o desenho
     * já vai noutro. Mover o foco a sério é a diferença entre um calendário
     * navegável e um que parece navegável.
     */
    useEffect(() => {
        if (!aberto) {
            return;
        }

        const alvo = gradeRef.current?.querySelector<HTMLElement>('[data-foco="sim"]');

        if (alvo && alvo !== document.activeElement) {
            alvo.focus();
        }
    }, [aberto, foco]);

    const escolhida = dataLocal(valor);
    const hoje = new Date();
    const mesActual = new Date(foco.getFullYear(), foco.getMonth(), 1);
    const primeiro = inicioDaSemana(mesActual);
    const dias: Date[] = Array.from({ length: 42 }, (_, i) => deslocar(primeiro, i));

    function bloqueado(d: Date): boolean {
        const minima = dataLocal(limites.current.minimo);
        const maxima = dataLocal(limites.current.maximo);

        if (minima && d < minima) {
            return true;
        }

        return Boolean(maxima && d > maxima);
    }

    function escolher(d: Date) {
        if (bloqueado(d)) {
            return;
        }

        aoEscolher(chave(d));
        definirAberto(false);
    }

    function aoTeclar(evento: React.KeyboardEvent) {
        const movimentos: Record<string, number> = {
            ArrowLeft: -1,
            ArrowRight: 1,
            ArrowUp: -7,
            ArrowDown: 7,
        };

        if (evento.key in movimentos) {
            evento.preventDefault();
            definirFoco((actual) => deslocar(actual, movimentos[evento.key]));
        } else if (evento.key === 'PageUp') {
            evento.preventDefault();
            definirFoco((actual) => deslocarMes(actual, -1));
        } else if (evento.key === 'PageDown') {
            evento.preventDefault();
            definirFoco((actual) => deslocarMes(actual, 1));
        } else if (evento.key === 'Enter' || evento.key === ' ') {
            evento.preventDefault();
            escolher(foco);
        }
    }

    return (
        <Bolha open={aberto} onOpenChange={definirAberto}>
            <PopoverPrimitive.Trigger
                id={id}
                disabled={desactivado}
                className={cn(
                    'flex h-10 w-full items-center justify-between gap-2 rounded-nib border border-graphite-32 bg-paper-raised px-3 py-2 text-left text-sm',
                    'transition-colors hover:border-graphite-48',
                    'focus-visible:border-amber focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none',
                    'aria-invalid:border-red-pencil',
                    'disabled:cursor-not-allowed disabled:bg-graphite-04 disabled:text-graphite-32',
                    className,
                )}
            >
                <span className={cn('tabular', !escolhida && 'text-graphite-32')}>
                    {escolhida ? formatarData(escolhida) : vazio}
                </span>
                <CalendarDays aria-hidden className="size-4 shrink-0 text-graphite-48" />
            </PopoverPrimitive.Trigger>

            <BolhaConteudo align="start" className="w-72 p-0" onKeyDown={aoTeclar}>
                <div className="flex items-center justify-between border-b border-graphite-12 px-2 py-2">
                    <button
                        type="button"
                        onClick={() => definirFoco((actual) => deslocarMes(actual, -1))}
                        className="grid size-7 place-items-center text-graphite-64 transition-colors hover:bg-graphite-08 hover:text-graphite"
                    >
                        <ChevronLeft aria-hidden className="size-4" />
                        <span className="sr-only">Mês anterior</span>
                    </button>

                    <p aria-live="polite" className="cota text-graphite">
                        {MESES.format(mesActual)}
                    </p>

                    <button
                        type="button"
                        onClick={() => definirFoco((actual) => deslocarMes(actual, 1))}
                        className="grid size-7 place-items-center text-graphite-64 transition-colors hover:bg-graphite-08 hover:text-graphite"
                    >
                        <ChevronRight aria-hidden className="size-4" />
                        <span className="sr-only">Mês seguinte</span>
                    </button>
                </div>

                <div className="px-2 py-2">
                    <div aria-hidden className="grid grid-cols-7 gap-px">
                        {DIAS.map((dia) => (
                            <span key={dia} className="cota py-1 text-center">
                                {dia}
                            </span>
                        ))}
                    </div>

                    <div
                        ref={gradeRef}
                        role="grid"
                        aria-label={MESES.format(mesActual)}
                        className="mt-1 grid grid-cols-7 gap-px"
                    >
                        {dias.map((dia) => {
                            const diaIso = chave(dia);
                            const foraDoMes = dia.getMonth() !== mesActual.getMonth();
                            const eEscolhida = escolhida ? diaIso === chave(escolhida) : false;
                            const eHoje = diaIso === chave(hoje);
                            const bloqueada = bloqueado(dia);
                            const noFoco = chave(foco) === diaIso;

                            return (
                                <button
                                    key={diaIso}
                                    type="button"
                                    role="gridcell"
                                    data-foco={noFoco ? 'sim' : undefined}
                                    tabIndex={noFoco ? 0 : -1}
                                    disabled={bloqueada}
                                    aria-selected={eEscolhida}
                                    aria-label={formatarData(dia)}
                                    onClick={() => escolher(dia)}
                                    onFocus={() => definirFoco(dia)}
                                    className={cn(
                                        'relative grid h-8 place-items-center border text-xs tabular',
                                        eEscolhida
                                            ? 'border-graphite bg-graphite font-semibold text-paper'
                                            : 'border-transparent text-graphite hover:border-graphite-32 hover:bg-graphite-04',
                                        foraDoMes && !eEscolhida && 'text-graphite-32',
                                        bloqueada && 'cursor-not-allowed opacity-40',
                                        // O dia de hoje é o traço de acção, não uma cor.
                                        eHoje &&
                                            !eEscolhida &&
                                            'font-semibold text-graphite after:absolute after:inset-x-1 after:bottom-0.5 after:h-px after:bg-amber-ink',
                                    )}
                                >
                                    {dia.getDate()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </BolhaConteudo>
        </Bolha>
    );
}

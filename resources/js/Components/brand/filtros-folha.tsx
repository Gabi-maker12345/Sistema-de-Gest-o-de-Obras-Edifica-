import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * A linha de filtros: a folha estreita-se em vez de encolher o conteúdo.
 *
 * Um filtro que espreme a lista para duas linhas muda o desenho debaixo dos
 * olhos de quem está a ler; por isso os filtros vivem numa tira própria, com a
 * cota à esquerda e o que está seleccionado a grafite cheio. O que está escrito
 * mas não é filtro — a contagem, a legenda — fica à direita, fora do peso.
 */
export function FiltrosFolha({
    children,
    direita,
    className,
}: {
    children: ReactNode;
    direita?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-graphite-20 pb-2',
                className,
            )}
        >
            <p className="cota shrink-0">Filtros</p>

            {children}

            {direita && <div className="ml-auto">{direita}</div>}
        </div>
    );
}

/**
 * Um filtro premível. Premido é o que está seleccionado — grafite cheio, que é a
 * mesma gramática do carimbo e da folha activa no índice. As Pastas não mudam de
 * cor quando se abre, e o grafite é a tinta que diz «isto conta».
 */
export function FiltroChip({
    premido,
    aoPremir,
    children,
    contagem,
}: {
    premido: boolean;
    aoPremir: () => void;
    children: ReactNode;
    /** A contagem ao lado do nome, quando o número ajuda a escolher. */
    contagem?: number;
}) {
    return (
        <button
            type="button"
            onClick={aoPremir}
            aria-pressed={premido}
            className={cn(
                'inline-flex items-center gap-1.5 rounded-selo border px-2 py-0.5 text-xs transition-colors',
                premido
                    ? 'border-graphite bg-graphite font-medium text-paper'
                    : 'border-graphite-32 text-graphite-64 hover:border-graphite-64 hover:text-graphite',
            )}
        >
            {children}
            {contagem !== undefined && (
                <span
                    className={cn(
                        'font-mono text-2xs tabular',
                        premido ? 'text-paper' : 'text-graphite-48',
                    )}
                >
                    {contagem}
                </span>
            )}
        </button>
    );
}
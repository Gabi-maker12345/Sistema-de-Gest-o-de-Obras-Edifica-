import { cn } from '@/lib/utils';

/**
 * A marca. SGO em letra de dibujante, com o quadrante do carimbo ao lado:
 * a mesma marca no cabecalho, no rodape e no ecra de entrada.
 */
export function Marca({
    className,
    compacta = false,
}: {
    className?: string;
    compacta?: boolean;
}) {
    return (
        <span className={cn('inline-flex items-center gap-2', className)}>
            <span
                aria-hidden
                className={cn(
                    'grid place-items-center border border-graphite bg-amber font-mono font-bold leading-none text-graphite',
                    compacta ? 'size-6 text-xs' : 'size-8 text-sm',
                )}
            >
                S
            </span>
            <span
                className={cn(
                    'font-semibold tracking-[0.18em] text-graphite uppercase',
                    compacta ? 'text-sm' : 'text-lg',
                )}
            >
                SGO
            </span>
        </span>
    );
}

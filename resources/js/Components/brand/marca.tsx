import { cn } from '@/lib/utils';

/**
 * A marca. SGO em letra de dibujante, com o quadrante do carimbo ao lado:
 * a mesma marca no cabecalho, no rodape e no ecrã de entrada.
 *
 * O quadrante é âmbar em todos os ecrãs — a marca é a única excepção à regra
 * do âmbar, porque não é uma acção: é a assinatura. Sobre a tábua usa a
 * pressão de cima, que é o mesmo âmbar iluminado pela luminária da mesa.
 */
export function Marca({
    className,
    compacta = false,
    sobreTabua = false,
}: {
    className?: string;
    compacta?: boolean;
    /** A marca está pousada no grafite e não no papel. */
    sobreTabua?: boolean;
}) {
    return (
        <span className={cn('inline-flex items-center gap-2', className)}>
            <span
                aria-hidden
                className={cn(
                    'grid place-items-center border font-mono font-bold leading-none',
                    sobreTabua ? 'border-amber-alto bg-amber-alto' : 'border-graphite bg-amber',
                    compacta ? 'size-6 text-xs' : 'size-8 text-sm',
                )}
            >
                S
            </span>
            <span
                className={cn(
                    'font-semibold tracking-[0.18em] uppercase',
                    sobreTabua ? 'text-tinta' : 'text-graphite',
                    compacta ? 'text-sm' : 'text-lg',
                )}
            >
                SGO
            </span>
        </span>
    );
}

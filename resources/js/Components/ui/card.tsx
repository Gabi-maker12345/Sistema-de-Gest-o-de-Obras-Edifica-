import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/**
 * A folha: a superficie onde o registo e desenhado. A variacao `vinco` marca
 * um bloco de anotacao de prancha — um campo derivado, uma nota, uma legenda.
 */
const variantes = cva('bg-paper', {
    variants: {
        traco: {
            liso: 'border border-graphite-12',
            vincado: 'hachura-45 border border-graphite-12 bg-paper-raised',
            carimbado: 'border border-graphite-32',
            sem: '',
        },
    },
    defaultVariants: {
        traco: 'liso',
    },
});

type FolhaProps = ComponentProps<'div'> & VariantProps<typeof variantes>;

export function Folha({ className, traco, ...props }: FolhaProps) {
    return <div data-slot="folha" className={cn(variantes({ traco }), className)} {...props} />;
}

export function FolhaCabecalho({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            data-slot="folha-cabecalho"
            className={cn(
                'flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-graphite-12 px-4 py-2.5',
                className,
            )}
            {...props}
        />
    );
}

export function FolhaCorpo({ className, ...props }: ComponentProps<'div'>) {
    return <div data-slot="folha-corpo" className={cn('px-4 py-4', className)} {...props} />;
}

export function FolhaRodape({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            data-slot="folha-rodape"
            className={cn(
                'flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-graphite-12 px-4 py-2.5',
                className,
            )}
            {...props}
        />
    );
}

/** A cota: a legenda de uma linha de chamada ou o titulo de um bloco. */
export function Cota({ className, ...props }: ComponentProps<'p'>) {
    return <p data-slot="cota" className={cn('cota', className)} {...props} />;
}

export { variantes as folhaVariantes };

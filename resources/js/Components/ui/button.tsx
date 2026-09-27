import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/**
 * A accao e ambar. O contorno e estrutura. O perigo e lapis vermelho, e so
 * aparece quando a accao e mesmo de perigo (eliminar, rejeitar).
 */
const variantes = cva(
    [
        'inline-flex items-center justify-center gap-2 whitespace-nowrap',
        'font-medium tracking-tight transition-[background-color,color,box-shadow]',
        'disabled:pointer-events-none disabled:opacity-40',
        '[&_svg]:shrink-0 [&_svg]:size-4',
    ].join(' '),
    {
        variants: {
            variante: {
                primario:
                    'bg-amber text-graphite shadow-levantada hover:bg-amber-64 active:translate-y-px active:shadow-none',
                contorno:
                    'border border-graphite-32 bg-transparent text-graphite hover:border-graphite hover:bg-graphite-04',
                subtil:
                    'bg-transparent text-graphite-64 hover:bg-graphite-08 hover:text-graphite',
                carimbo:
                    'border border-stamp text-stamp hover:bg-stamp-08 active:bg-stamp-16',
                perigo:
                    'border border-red-pencil bg-transparent text-red-pencil hover:bg-red-pencil-08',
            },
            tamanho: {
                sm: 'h-8 px-3 text-xs [&_svg]:size-3.5',
                md: 'h-10 px-4 text-sm',
                lg: 'h-12 px-6 text-base',
                icone: 'size-9 [&_svg]:size-4',
            },
            traco: {
                firme: 'border-2',
                medio: 'border',
            },
        },
        defaultVariants: {
            variante: 'primario',
            tamanho: 'md',
            traco: 'medio',
        },
    },
);

type BotaoProps = ComponentProps<'button'> &
    VariantProps<typeof variantes> & {
        asChild?: boolean;
    };

export function Botao({
    className,
    variante,
    tamanho,
    traco,
    asChild = false,
    ...props
}: BotaoProps) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="botao"
            className={cn(variantes({ variante, tamanho, traco }), className)}
            {...props}
        />
    );
}

export { variantes as botaoVariantes };

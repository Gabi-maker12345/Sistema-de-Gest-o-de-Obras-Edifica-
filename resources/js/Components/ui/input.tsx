import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/**
 * O campo e a moldura de um dado na prancha: fundo levemente rebaixado, linha
 * de grafite, e o foco em ambar porque o foco e accao.
 */
export function Input({ className, type, ...props }: ComponentProps<'input'>) {
    return (
        <input
            type={type}
            data-slot="campo"
            className={cn(
                'flex h-10 w-full rounded-nib border border-graphite-32 bg-paper-raised px-3 py-2 text-sm',
                'text-graphite transition-colors',
                'hover:border-graphite-48',
                'focus-visible:border-amber focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none',
                'aria-invalid:border-red-pencil aria-invalid:ring-red-pencil',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'file:mr-0 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-graphite',
                className,
            )}
            {...props}
        />
    );
}

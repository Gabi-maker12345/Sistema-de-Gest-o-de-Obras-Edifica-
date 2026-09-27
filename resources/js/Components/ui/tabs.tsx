import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

const Abas = TabsPrimitive.Root;

function lista({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
    return (
        <TabsPrimitive.List
            className={cn(
                'flex flex-wrap items-stretch gap-0 border-b border-graphite-20',
                className,
            )}
            {...props}
        />
    );
}

function aba({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
    return (
        <TabsPrimitive.Trigger
            className={cn(
                '-mb-px border-b-2 border-transparent px-3 py-2 text-sm text-graphite-64 transition-colors',
                'hover:text-graphite',
                'data-[state=active]:border-amber data-[state=active]:font-medium data-[state=active]:text-graphite',
                className,
            )}
            {...props}
        />
    );
}

function painel({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
    return <TabsPrimitive.Content className={cn('outline-none', className)} {...props} />;
}

export { Abas, aba as Aba, lista as AbaLista, painel as AbaPainel };

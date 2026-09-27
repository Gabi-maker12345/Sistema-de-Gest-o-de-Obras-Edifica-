import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

const Seletor = SelectPrimitive.Root;
const SeletorGrupo = SelectPrimitive.Group;
const SeletorValor = SelectPrimitive.Value;

function disparador({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Trigger>) {
    return (
        <SelectPrimitive.Trigger
            className={cn(
                'flex h-10 w-full items-center justify-between gap-2 rounded-nib border border-graphite-32 bg-paper-raised px-3 py-2 text-sm',
                'transition-colors hover:border-graphite-48',
                'focus-visible:border-amber focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none',
                'aria-invalid:border-red-pencil aria-invalid:ring-red-pencil',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'data-[placeholder]:text-graphite-32',
                className,
            )}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon asChild>
                <ChevronDown aria-hidden className="size-4 text-graphite-48" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    );
}

function conteudo({ className, children, position = 'popper', ...props }: ComponentProps<typeof SelectPrimitive.Content>) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                position={position}
                className={cn(
                    'relative z-50 max-h-80 min-w-[8rem] overflow-hidden border border-graphite-32 bg-paper-raised text-graphite shadow-folha',
                    position === 'popper' && 'w-full min-w-[var(--radix-select-trigger-width)]',
                    className,
                )}
                {...props}
            >
                <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
}

function item({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Item>) {
    return (
        <SelectPrimitive.Item
            className={cn(
                'relative flex w-full cursor-pointer items-center gap-2 py-1.5 pr-7 pl-2 text-sm outline-none select-none',
                'focus:bg-amber focus:text-graphite',
                'data-disabled:pointer-events-none data-disabled:opacity-40',
                className,
            )}
            {...props}
        >
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
            <span className="absolute right-2 flex size-3.5 items-center justify-center">
                <SelectPrimitive.ItemIndicator>
                    <Check aria-hidden className="size-3.5" strokeWidth={3} />
                </SelectPrimitive.ItemIndicator>
            </span>
        </SelectPrimitive.Item>
    );
}

function grupo({ className, ...props }: ComponentProps<typeof SelectPrimitive.Label>) {
    return <SelectPrimitive.Label className={cn('cota px-2 py-1.5', className)} {...props} />;
}

function separador({ className, ...props }: ComponentProps<typeof SelectPrimitive.Separator>) {
    return <SelectPrimitive.Separator className={cn('-mx-1 my-1 h-px bg-graphite-12', className)} {...props} />;
}

export {
    conteudo as SeletorConteudo,
    grupo as SeletorGrupoRotulo,
    item as SeletorItem,
    separador as SeletorSeparador,
    Seletor,
    SeletorGrupo,
    SeletorValor,
    disparador as SeletorDisparador,
};

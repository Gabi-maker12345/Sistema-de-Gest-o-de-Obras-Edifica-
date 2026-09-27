import * as PopoverPrimitive from '@radix-ui/react-popover';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

const Bolha = PopoverPrimitive.Root;
const BolhaDisparador = PopoverPrimitive.Trigger;
const BolhaFechar = PopoverPrimitive.Close;

function BolhaConteudo({
    className,
    align = 'start',
    sideOffset = 6,
    ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
    return (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
                align={align}
                sideOffset={sideOffset}
                className={cn(
                    'z-50 w-72 border border-graphite-32 bg-paper-raised p-3 text-graphite shadow-folha outline-none',
                    className,
                )}
                {...props}
            />
        </PopoverPrimitive.Portal>
    );
}

export { Bolha, BolhaConteudo, BolhaDisparador, BolhaFechar };

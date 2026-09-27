import * as SwitchPrimitive from '@radix-ui/react-switch';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/**
 * O interruptor: liga e desliga. Ligado leva ambar, porque e accao; desligado
 * e so contorno de grafite.
 */
export function Interruptor({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
    return (
        <SwitchPrimitive.Root
            className={cn(
                'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center border border-graphite-32 bg-paper-sunken',
                'transition-colors focus-visible:border-amber focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none',
                'data-[state=checked]:border-amber data-[state=checked]:bg-amber',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        >
            <SwitchPrimitive.Thumb
                className={cn(
                    'pointer-events-none block size-3.5 bg-graphite transition-transform',
                    'data-[state=checked]:translate-x-4.5 data-[state=unchecked]:translate-x-0.5',
                )}
            />
        </SwitchPrimitive.Root>
    );
}

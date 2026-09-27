import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export function Checkbox({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) {
    return (
        <CheckboxPrimitive.Root
            data-slot="caixa"
            className={cn(
                'peer size-4 shrink-0 rounded-nib border border-graphite-48 bg-paper-raised',
                'transition-colors hover:border-graphite',
                'focus-visible:border-amber focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none',
                'data-[state=checked]:border-amber data-[state=checked]:bg-amber',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator className="flex items-center justify-center text-graphite">
                <Check aria-hidden className="size-3" strokeWidth={3} />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}

import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
    return (
        <textarea
            data-slot="area-texto"
            className={cn(
                'flex min-h-24 w-full rounded-nib border border-graphite-32 bg-paper-raised px-3 py-2 text-sm',
                'text-graphite transition-colors',
                'hover:border-graphite-48',
                'focus-visible:border-amber focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none',
                'aria-invalid:border-red-pencil aria-invalid:ring-red-pencil',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        />
    );
}

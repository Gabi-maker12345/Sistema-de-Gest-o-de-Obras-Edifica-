import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * A estação em que estamos é a folha mais escura do tabuleiro. O Inertia 2
 * já não aceita `className` como função, por isso a comparação é feita aqui.
 */
export function useEstacaoActiva(href: string): boolean {
    const { url } = usePage();

    const actual = url.split('?')[0].split('#')[0];
    const alvo = href.split('?')[0];

    return actual === alvo;
}

export function LinkEstacao({
    href,
    children,
    className,
    onClick,
}: {
    href: string;
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}) {
    const activa = useEstacaoActiva(href);

    return (
        <Link
            href={href}
            onClick={onClick}
            aria-current={activa ? 'page' : undefined}
            className={cn(
                'block px-3 py-2 text-sm transition-colors',
                'hover:bg-graphite-04 hover:text-graphite',
                activa ? 'linha-activa font-semibold text-graphite' : 'text-graphite-64',
                className,
            )}
        >
            {children}
        </Link>
    );
}

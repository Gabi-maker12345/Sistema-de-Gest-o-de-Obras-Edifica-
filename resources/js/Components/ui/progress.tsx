import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/**
 * O medidor de execucao: duas barras separadas, uma para a execucao fisica e
 * outra para a execucao financeira. Nunca fundidas num unico valor.
 */
export function Medidor({
    valor,
    className,
    rotulo,
}: {
    valor: number;
    className?: string;
    rotulo?: string;
}) {
    const limitado = Math.max(0, Math.min(100, valor));

    return (
        <div
            role="progressbar"
            aria-valuenow={Math.round(limitado)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={rotulo}
            className={cn('medidor', className)}
            style={{ '--medidor-preenchimento': `${limitado}%` } as React.CSSProperties}
        >
            <span />
        </div>
    );
}

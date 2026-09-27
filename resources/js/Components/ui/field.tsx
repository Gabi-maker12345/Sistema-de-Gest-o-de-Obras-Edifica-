import { AlertCircle } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { Label } from '@/Components/ui/label';

/**
 * O campo de prancha: rotulo, valor e a anotacao ligada por linha de chamada.
 * O erro e a unica coisa do produto que pode usar o lapis vermelho.
 */
export function Campo({
    className,
    rotulo,
    htmlFor,
    obrigatorio,
    erro,
    ajuda,
    classNameControl,
    children,
}: {
    className?: string;
    rotulo: ReactNode;
    htmlFor: string;
    obrigatorio?: boolean;
    erro?: string;
    ajuda?: ReactNode;
    classNameControl?: string;
    children: ReactNode;
}) {
    return (
        <div data-slot="campo-bloco" className={cn('flex flex-col gap-1.5', className)}>
            <Label htmlFor={htmlFor}>
                {rotulo}
                {obrigatorio && (
                    <span aria-hidden className="text-amber">
                        *
                    </span>
                )}
            </Label>

            <div className={cn('relative', classNameControl)}>{children}</div>

            {erro ? (
                <p
                    role="alert"
                    className="flex items-start gap-1.5 font-mono text-2xs tracking-normal text-red-pencil normal-case"
                >
                    <AlertCircle aria-hidden className="mt-px size-3 shrink-0" />
                    {erro}
                </p>
            ) : (
                ajuda && <p className="anotacao normal-case">{ajuda}</p>
            )}
        </div>
    );
}

/** Campo derivdo: so se lê, nunca se escreve. Vive num vinco. */
export function CampoDerivado({
    rotulo,
    children,
    nota,
    className,
}: {
    rotulo: ReactNode;
    children: ReactNode;
    nota?: ReactNode;
    className?: string;
}) {
    return (
        <div data-slot="campo-derivado" className={cn('flex flex-col gap-1.5', className)}>
            <p className="cota">{rotulo}</p>
            <div className="hachura-45 border border-graphite-12 bg-paper-raised px-3 py-2 text-sm text-graphite-64">
                {children}
            </div>
            {nota && <p className="anotacao normal-case">{nota}</p>}
        </div>
    );
}

export function ErroDeFormulario({ children }: ComponentProps<'div'>) {
    if (!children) {
        return null;
    }

    return (
        <div
            role="alert"
            className="flex items-start gap-2 border border-red-pencil-32 bg-red-pencil-08 px-3 py-2 text-sm text-red-pencil"
        >
            <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-0.5">{children}</div>
        </div>
    );
}

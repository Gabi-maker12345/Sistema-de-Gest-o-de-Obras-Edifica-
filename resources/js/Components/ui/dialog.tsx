import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X as IconeFechar } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

const Janela = DialogPrimitive.Root;
const JanelaDisparador = DialogPrimitive.Trigger;
const JanelaFechar = DialogPrimitive.Close;

function Conteudo({
    className,
    children,
    ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
    return (
        <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-graphite/40" />
            <DialogPrimitive.Content
                className={cn(
                    'fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
                    'flex flex-col border border-graphite-32 bg-paper shadow-folha',
                    className,
                )}
                {...props}
            >
                {children}
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
    );
}

function Cabecalho({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            className={cn(
                'flex items-center justify-between gap-4 border-b border-graphite-12 px-4 py-3',
                className,
            )}
            {...props}
        />
    );
}

function Rodape({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            className={cn(
                'flex items-center justify-end gap-2 border-t border-graphite-12 px-4 py-3',
                className,
            )}
            {...props}
        />
    );
}

function Titulo({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
    return (
        <DialogPrimitive.Title
            className={cn('text-base font-semibold tracking-tight', className)}
            {...props}
        />
    );
}

function Descricao({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
    return (
        <DialogPrimitive.Description className={cn('anotacao normal-case', className)} {...props} />
    );
}

function Fechar({ className, ...props }: ComponentProps<typeof DialogPrimitive.Close>) {
    return (
        <DialogPrimitive.Close
            className={cn(
                'rounded-nib p-1 text-graphite-48 transition-colors hover:bg-graphite-08 hover:text-graphite',
                className,
            )}
            {...props}
        >
            <IconeFechar aria-hidden className="size-4" />
            <span className="sr-only">Fechar</span>
        </DialogPrimitive.Close>
    );
}

export {
    Cabecalho as JanelaCabecalho,
    Conteudo as JanelaConteudo,
    Descricao as JanelaDescricao,
    Fechar as JanelaX,
    Janela,
    JanelaDisparador,
    JanelaFechar,
    Rodape as JanelaRodape,
    Titulo as JanelaTitulo,
};

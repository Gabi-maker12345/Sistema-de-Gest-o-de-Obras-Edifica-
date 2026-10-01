import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/**
 * A pista: o rótulo que explica um controlo ao passar por cima.
 *
 * Existe para os botões que são só ícone. Um ícone de 16px não diz o que faz, e
 * sem pista o utilizador tem de o passar a todos para adivinhar — ou, pior, para
 * não tocar nele. A pista é a legenda do controlo, não um extras: entra no
 * contrato de cor e de sombra do resto, sem inventar um cinzento novo.
 *
 * `title` do browser não chega: demora um segundo a aparecer, não se consegue
 * estilizar, e não aparece ao foco do teclado. Isto aparece logo, segue o
 * cursor e abre com Tab.
 *
 * Para texto que a coluna corta e o leitor precisa de ler inteiro, isto não
 * chega — ver `TextoLongo`, que abre uma janela.
 */
const DicaProvedor = TooltipPrimitive.Provider;
const Dica = TooltipPrimitive.Root;
const DicaDisparador = TooltipPrimitive.Trigger;

function DicaConteudo({
    className,
    sideOffset = 6,
    ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
    return (
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
                sideOffset={sideOffset}
                className={cn(
                    'z-50 max-w-xs border border-graphite-32 bg-paper-raised px-2.5 py-1.5 text-2xs leading-snug text-graphite shadow-selo',
                    className,
                )}
                {...props}
            />
        </TooltipPrimitive.Portal>
    );
}

/**
 * O contentor de uma pista, já com o texto. Envolve um só elemento —
 * `disparador={(p) => <Botao {...p} />}` — porque o Radix precisa de estar
 * dentro de um Provider para funcionar.
 */
export function ComDica({
    children,
    texto,
    ...props
}: {
    texto: string;
    children: React.ReactNode;
} & ComponentProps<typeof Dica>) {
    return (
        <DicaProvedor delayDuration={200} skipDelayDuration={300}>
            <Dica {...props}>
                <DicaDisparador asChild>{children}</DicaDisparador>
                <DicaConteudo>{texto}</DicaConteudo>
            </Dica>
        </DicaProvedor>
    );
}

export { Dica, DicaConteudo, DicaDisparador, DicaProvedor };
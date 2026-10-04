import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * O título da linha como botão de escolher o registo.
 *
 * A pergunta que traz a pessoa à margem é «o que é este registo e quem mexeu
 * nele?», e o alvo natural para essa pergunta é o nome do registo — não uma
 * coluna nova com uma seta e mais uma coluna de cabeçalho.
 *
 * É um botão de verdade e não um `div` com `onClick`: a lista tem de ser
 * alcançável pelo teclado, e uma linha clicável que só o rato encontra falha
 * nisso. `aria-pressed` diz se a linha é a que está aberta, e `aria-controls`
 * aponta para a ficha, que é o que a pessoa vai ler a seguir.
 *
 * O título não muda de cor ao passar o rato — o sublinhado diz que é control —
 * mas fica a carimbo quando a linha é a escolhida: a cor de identidade é a do
 * carimbo, e o âmbar fica para a acção.
 */
export function TituloSelecao({
    chave,
    seleccionado,
    aoEscolher,
    children,
    className,
}: {
    chave: string;
    seleccionado: boolean;
    aoEscolher: (chave: string) => void;
    children: ReactNode;
    className?: string;
}) {
    return (
        <button
            type="button"
            aria-pressed={seleccionado}
            aria-controls={seleccionado ? 'ficha-registo' : undefined}
            onClick={() => aoEscolher(chave)}
            className={cn(
                'block max-w-full truncate text-left transition-colors',
                'underline decoration-transparent decoration-1 underline-offset-[3px]',
                'hover:decoration-current focus-visible:decoration-current',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber',
                seleccionado ? 'text-stamp' : 'text-graphite',
                className,
            )}
        >
            {children}
        </button>
    );
}
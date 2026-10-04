import { useEffect, useRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { MargemSemFicha } from './margem-revisao';

/**
 * A prancha com a margem: a lista à esquerda, a ficha do registo à direita.
 *
 * A ficha não é um ecrã nem um separador — é a margem da folha, onde a
 * informação do registo e o seu histórico vivem ao lado da lista que os originou.
 * Ao contrário de um painel com janela, não tapa a lista: a pergunta que traz a
 * pessoa aqui é sobre *esta* linha, e a resposta tem de continuar a poder ler-se
 * com a lista ao lado.
 *
 * A margem é `sticky` a partir de `lg` porque é longa e a lista é longa: sem
 * isso, abrir a ficha de um registo no fim da grelha obriga a voltar ao topo
 * para ver o registo seguinte. O `top` é a altura do cabeçalho do painel, para a
 * ficha não passar por baixo dele.
 */
export function GrelhaComMargem({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn('grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]', className)}>
            {children}
        </div>
    );
}

/**
 * A margem onde a ficha entra.
 *
 * Em ecrã estreito não há margem: a ficha desce para debaixo da lista, porque
 * um bloco estreito ao lado da grelha não tem largura para o carimbo e para o
 * texto. E quando isso acontece a lista continua a ficar no topo do que se lê:
 * por isso escolher uma linha traz a ficha para o ecrã — num ecrã largo isso é
 * silencioso (a ficha já está ao lado), num estreito é o que evita que a pessoa
 * toque numa linha e não veja nada acontecer.
 */
export function MargemFicha({
    comFicha,
    children,
    className,
}: {
    /** `false` quando não há registo escolhido: a margem explica o que fazer. */
    comFicha: boolean;
    children: ReactNode;
    className?: string;
}) {
    const margem = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!comFicha || window.matchMedia('(min-width: 1024)').matches) {
            return;
        }

        const alvo = margem.current;

        if (!alvo) {
            return;
        }

        alvo.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'auto'
                : 'smooth',
            block: 'start',
        });
    }, [comFicha]);

    return (
        <aside
            ref={margem}
            id="ficha-registo"
            aria-label="Ficha do registo"
            className={cn('scroll-mt-[4.5rem] lg:sticky lg:top-[4.5rem] lg:self-start', className)}
        >
            {comFicha ? children : <MargemSemFicha />}
        </aside>
    );
}
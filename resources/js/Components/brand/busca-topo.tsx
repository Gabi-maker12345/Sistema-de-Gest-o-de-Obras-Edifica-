import { Search } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { useBusca } from './contexto-busca';

/**
 * A busca é o focinho de um campo: escreve-se sempre. `/` leva o cursor para
 * aqui, `Esc` larga o que estiver escrito — como se fecha uma folha. A folha
 * diz em baixo quantas linhas sobreviveram ao filtro.
 *
 * Sobre a tábua o campo é um canal rebaixado no grafite, não uma caixa clara
 * a flutuar: a barra de ferramentas é parte da mesa, e só o que escreve é
 * papel. A borda é grafite levantado para o campo ler-se cavado, e o foco
 * continua a ser âmbar, à pressão que se lê na tábua.
 */
export function BuscaTopo() {
    const { termo, definirTermo } = useBusca();
    const referencia = useRef<HTMLInputElement>(null);

    useEffect(() => {
        function aoTeclar(evento: KeyboardEvent) {
            const alvo = evento.target as HTMLElement | null;
            const aEscrever =
                alvo instanceof HTMLInputElement ||
                alvo instanceof HTMLTextAreaElement ||
                alvo?.isContentEditable;

            if (evento.key === '/' && !aEscrever) {
                evento.preventDefault();
                referencia.current?.focus();
            }
        }

        document.addEventListener('keydown', aoTeclar);

        return () => document.removeEventListener('keydown', aoTeclar);
    }, []);

    return (
        <label className="relative block min-w-0 flex-1 sm:max-w-sm">
            <span className="sr-only">Filtrar a folha por nome, cliente ou estado</span>
            <Search
                aria-hidden
                strokeWidth={1.5}
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-tinta-32"
            />
            <input
                ref={referencia}
                type="search"
                value={termo}
                onChange={(evento) => definirTermo(evento.target.value)}
                placeholder="Filtrar esta folha…"
                className="h-9 w-full border border-regua-20 bg-placa pr-3 pl-8 font-mono text-2xs tracking-[0.04em] text-tinta placeholder:text-tinta-32 focus:border-amber-alto focus-visible:outline-none"
            />
        </label>
    );
}

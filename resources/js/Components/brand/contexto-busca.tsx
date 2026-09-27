import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface ContextoBusca {
    termo: string;
    definirTermo: (termo: string) => void;
    limpar: () => void;
}

const Contexto = createContext<ContextoBusca | null>(null);

/**
 * A busca do topo pertence à casca, mas filtra a folha que está em baixo. Por
 * isso vive num contexto e não num estado de cada página: escrever no campo
 * repete a folha de cotas já ordenada, sem navegação e sem filtro escondido.
 */
export function ProvedorBusca({ children }: { children: ReactNode }) {
    const [termo, definirEstadoTermo] = useState('');

    const valor = useMemo<ContextoBusca>(
        () => ({
            termo,
            definirTermo: definirEstadoTermo,
            limpar: () => definirEstadoTermo(''),
        }),
        [termo],
    );

    return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useBusca(): ContextoBusca {
    const contexto = useContext(Contexto);

    if (!contexto) {
        throw new Error('useBusca precisa de ProvedorBusca por cima.');
    }

    return contexto;
}

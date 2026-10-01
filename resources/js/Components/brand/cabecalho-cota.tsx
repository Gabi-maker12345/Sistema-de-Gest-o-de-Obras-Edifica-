import { ArrowDown, ArrowUp } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { cn } from '@/lib/utils';
import { ComDica } from '@/Components/ui/dica';

/**
 * A cabeça da folha de cota: as colunas que a linha de cota mede, e que aqui
 * também são a ordenação.
 *
 * Tocar numa cota inverte a ordem da folha — é o mesmo gesto do painel, pelo
 * mesmo motivo: quem procura «o que está pior» não quer descer a lista, quer
 * trocar o eixo da leitura. E porque a ordenação é uma propriedade da folha e
 * não da tabela, o estado vive no hook `useOrdem` e a cabeça só o reflecte.
 */
export interface ColunaOrdenavel<L> {
    chave: string;
    cota: string;
    alinhamento?: 'direita';
    /**
     * Só é preciso quando a folha usa `useOrdem` e ordena os dados. Uma folha que
     * chega ao ecrã já ordenada por outro sítio — o painel, por exemplo — só
     * precisa da cota para a desenhar e do nome para a ordenação invertida.
     */
    valor?: (linha: L) => number | string;
}

export type Ordem = { coluna: string; sentido: 'asc' | 'desc' };

/**
 * A ordenação da folha. Ao escolher uma coluna nova começa pelo lado que o
 * desenho esconde — o maior — para que o primeiro toque já mostre o que o
 * gestor procura.
 */
export function useOrdem<L>(colunas: Array<ColunaOrdenavel<L>>, inicial: string) {
    const [ordem, definirOrdem] = useState<Ordem>({ coluna: inicial, sentido: 'desc' });

    const alternar = useCallback((coluna: string) => {
        definirOrdem((actual) =>
            actual.coluna === coluna
                ? { coluna, sentido: actual.sentido === 'desc' ? 'asc' : 'desc' }
                : { coluna, sentido: 'desc' },
        );
    }, []);

    const ordenar = useCallback(
        <T extends L>(linhas: T[]): T[] => {
            const coluna = colunas.find((c) => c.chave === ordem.coluna);

            if (!coluna?.valor) {
                return linhas;
            }

            const direccao = ordem.sentido === 'asc' ? 1 : -1;

            return [...linhas].sort((a, b) => {
                const va = coluna.valor!(a);
                const vb = coluna.valor!(b);

                if (typeof va === 'number' && typeof vb === 'number') {
                    return (va - vb) * direccao;
                }

                return String(va).localeCompare(String(vb), 'pt') * direccao;
            });
        },
        [colunas, ordem],
    );

    return useMemo(() => ({ ordem, alternar, ordenar }), [ordem, alternar, ordenar]);
}

/**
 * A grelha de uma folha de registos, com o que faz as colunas baterem certo.
 *
 * Duas regras, ambas aprendidas com ecrãs brancos e números fora do sítio:
 *
 *  1. `gap-x` e `gap-y` vivem aqui e não nas linhas. Se cada elemento que
 *     recebe a grelha acrescentar o seu próprio `gap`, a cabeça e a cota
 *     herdam a medida e as linhas não — e a diferença de um `gap` por coluna
 *     empurra todas as colunas para a direita, uma a uma, ao longo da folha.
 *     A grelha tem de ser a mesma nas três, sem ninguém a corrigir.
 *
 *  2. As colunas de números alinham à direita e as de texto à esquerda, e o
 *     que decide isso é a coluna, não o tipo de conteúdo que calhou a cada
 *     linha. Uma célula que encolhe ao conteúdo (`justify-self-end`) põe o
 *     número em sítios diferentes conforme o número é mais ou menos largo —
 *     é o desalinhamento que se vê quando os números são `+9 pp` e `−2 pp`.
 *     `w-full` mais `text-right` dá sempre a mesma origem ao texto.
 */
export const GRELHA_REGISTOS =
    'grid grid-cols-1 gap-x-4 gap-y-1 px-3 py-2.5 md:items-center';

export function CabecalhoCota<L>({
    colunas,
    ordem,
    alternar,
    grelha,
    className,
}: {
    colunas: Array<ColunaOrdenavel<L>>;
    ordem: Ordem;
    alternar: (coluna: string) => void;
    grelha: string;
    className?: string;
}) {
    return (
        <div className={cn(grelha, 'border-b border-graphite-20 pb-1.5', className)}>
            {colunas.map((coluna) =>
                coluna.cota ? (
                    <OrdenarColuna
                        key={coluna.chave}
                        coluna={coluna}
                        ordem={ordem}
                        alternar={alternar}
                    />
                ) : (
                    // A coluna das acções por linha não se ordena, por isso não é
                    // botão: é o lugar onde a cota fica vazia.
                    <div key={coluna.chave} />
                ),
            )}
        </div>
    );
}

function OrdenarColuna<L>({
    coluna,
    ordem,
    alternar,
}: {
    coluna: ColunaOrdenavel<L>;
    ordem: Ordem;
    alternar: (coluna: string) => void;
}) {
    const activa = ordem.coluna === coluna.chave;
    const Icone = activa && ordem.sentido === 'asc' ? ArrowUp : ArrowDown;

    return (
        <ComDica
            texto={
                activa
                    ? `Ordenado por ${coluna.cota.toLowerCase()}, ${
                          ordem.sentido === 'asc' ? 'crescente' : 'decrescente'
                      }. Premir para inverter.`
                    : `Premir para ordenar por ${coluna.cota.toLowerCase()}.`
            }
        >
            <button
                type="button"
                onClick={() => alternar(coluna.chave)}
                aria-label={
                    activa
                        ? `${coluna.cota}. Folha ordenada por ${coluna.cota}, ${
                              ordem.sentido === 'asc' ? 'crescente' : 'decrescente'
                          }. Premir para inverter.`
                        : `${coluna.cota}. Premir para ordenar a folha por esta coluna.`
                }
                className={cn(
                    'flex min-w-0 items-center gap-1 font-mono text-2xs tracking-[0.08em] uppercase',
                    coluna.alinhamento === 'direita' ? 'justify-end' : 'justify-start',
                    activa ? 'text-graphite' : 'text-graphite-64 hover:text-graphite',
                )}
            >
                {coluna.cota}
                {activa && <Icone aria-hidden className="size-3 shrink-0" />}
            </button>
        </ComDica>
    );
}
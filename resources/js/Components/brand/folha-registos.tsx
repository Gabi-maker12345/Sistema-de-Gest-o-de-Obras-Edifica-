import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { CabecalhoCota, type ColunaOrdenavel, type Ordem } from './cabecalho-cota';
import { LinhaCota } from './linha-cota';

/**
 * A folha de registos: a grelha que o painel usa para as suas linhas, sem o
 * eixo do tempo.
 *
 * Projectos tem o espelho de datas e a sua própria forma de linha. Estes três
 * módulos — utilizadores, áreas, equipas — são a mesma coisa escrita três
 * vezes: a cota por cima das colunas, uma linha por registo, o mesmo carimbo.
 * O que muda entre elas é a cotação, não a gramática, por isso a casca vive
 * aqui e cada folha só escreve as suas colunas e as suas linhas.
 *
 * A lista não é paginada: são seis linhas no seed e a paginação seria um
 * mecanismo para esconder o que cabe. A folha é curta por desenho, e o que
 * cresce com o tempo é o número de folhas, não o de linhas.
 */
export function FolhaRegistos<L>({
    titulo,
    colunas,
    ordem,
    alternar,
    grelha,
    linhas,
    chaveDe,
    children,
    vazio,
    contagem,
    className,
}: {
    titulo: string;
    colunas: Array<ColunaOrdenavel<L>>;
    ordem: Ordem;
    alternar: (coluna: string) => void;
    /** A mesma grelha da cabeça e das linhas, para as três nunca dessincronizarem. */
    grelha: string;
    linhas: L[];
    chaveDe: (linha: L) => string;
    children: (linha: L, indice: number) => ReactNode;
    /** O texto do estado sem registo, já distinguindo filtro de sessão vazia. */
    vazio: string;
    contagem?: ReactNode;
    className?: string;
}) {
    return (
        <section className={cn('space-y-2', className)}>
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-graphite-32 pb-2">
                <h2 className="cota text-graphite">{titulo}</h2>
                {contagem && <p className="cota">{contagem}</p>}
            </div>

            {linhas.length === 0 ? (
                <p className="border border-dashed border-graphite-32 p-6 text-sm text-graphite-64">
                    {vazio}
                </p>
            ) : (
                <>
                    <LinhaCota
                        colunas={colunas.map((coluna) => coluna.cota)}
                        grelha={grelha}
                        className="hidden md:grid"
                    />

                    <CabecalhoCota
                        colunas={colunas}
                        ordem={ordem}
                        alternar={alternar}
                        grelha={grelha}
                        className="hidden md:grid"
                    />

                    <ul className="border-x border-b border-graphite-32">
                        {linhas.map((linha, indice) => (
                            <li key={chaveDe(linha)} className="border-b border-graphite-20 last:border-0">
                                {children(linha, indice)}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </section>
    );
}
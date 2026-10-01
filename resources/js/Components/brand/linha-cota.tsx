import { cn } from '@/lib/utils';

/**
 * A linha de cota: a medicao que atravessa as colunas de uma folha, com os
 * traços de extremo em cada separador. E o elemento que distingue esta folha
 * de uma tabela: as colunas nao sao apenas rotuladas, sao cotadas.
 *
 * Recebe a mesma grelha da tabela que mede, para as duas nunca dessincronizarem.
 */
export function LinhaCota({
    colunas,
    grelha,
    className,
}: {
    colunas: string[];
    grelha: string;
    className?: string;
}) {
    return (
        <div aria-hidden className={cn(grelha, className)}>
            {colunas.map((coluna, indice) => (
                <div
                    key={`${coluna}-${indice}`}
                    className={cn(
                        'relative min-w-0 pr-2 last:pr-0',
                        // Uma coluna sem cota — a das acções por linha — não recebe
                        // traços de extremo: a cota mede, e uma cota vazia não
                        // mede nada.
                        coluna && 'border-t border-graphite-32 pt-1',
                    )}
                >
                    {coluna && (
                        <>
                            <span className="absolute -top-[3px] left-0 h-[6px] w-px bg-graphite-32" />
                            <span className="absolute -top-[3px] right-0 h-[6px] w-px bg-graphite-32" />
                            <span className="cota block truncate">{coluna}</span>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

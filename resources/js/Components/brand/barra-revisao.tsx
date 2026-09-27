import { cn } from '@/lib/utils';

/**
 * A barra de revisao: a margem lateral onde a prancha acumula as alteracoes.
 * Em vez de historico em lista, o registo le-se de baixo para cima — a ultima
 * revisao e a folha mais escura do tabuleiro.
 */
export function BarraRevisao({
    revisoes,
    className,
}: {
    revisoes: Array<{ revisao: string; nota: string }>;
    className?: string;
}) {
    const total = revisoes.length;
    const actual = total - 1;

    return (
        <div
            aria-hidden
            className={cn('hidden select-none flex-col items-end gap-2 lg:flex', className)}
        >
            <span className="cota">Rev.</span>
            <span aria-hidden className="h-full w-px bg-graphite-20" />
            <ul className="flex flex-col gap-3">
                {revisoes.map((revisao, indice) => (
                    <li
                        key={revisao.revisao}
                        className="flex items-center gap-1.5"
                        title={revisao.nota}
                    >
                        <span
                            className={cn(
                                'font-mono text-2xs tracking-[0.08em] uppercase',
                                indice === actual
                                    ? 'font-semibold text-graphite'
                                    : 'text-graphite-32',
                            )}
                        >
                            {revisao.revisao}
                        </span>
                        <span
                            className={cn(
                                'block h-2.5 w-2.5',
                                indice === actual
                                    ? 'bg-graphite'
                                    : 'border border-graphite-32 bg-transparent',
                            )}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

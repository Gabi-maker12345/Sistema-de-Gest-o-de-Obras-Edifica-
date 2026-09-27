import { cn } from '@/lib/utils';

/**
 * O carimbo. E a identidade do registo: quem e, em que folha, com que estado.
 * Vive em tinta de carimbo, rodado de leve como um carimbo batido a mao, e
 * nunca e decoracao — cada ecra mostra o carimbo do registo em que esta.
 */
export function Carimbo({
    identidade,
    linhas = [],
    rodape,
    className,
    traco = 'medio',
    rodado = -2.5,
}: {
    identidade: string;
    linhas?: Array<{ chave: string; valor: string }>;
    rodape?: string;
    className?: string;
    traco?: 'firme' | 'medio' | 'leve';
    rodado?: number;
}) {
    return (
        <div
            className={cn(
                'matriz inline-block rotate-[var(--rodado)] px-2.5 py-1.5 text-stamp',
                traco === 'firme' ? 'border-2' : traco === 'leve' ? 'border-dashed' : 'border',
                className,
            )}
            style={{ '--rodado': `${rodado}deg` } as React.CSSProperties}
        >
            <p className="font-mono text-2xs leading-none font-semibold tracking-[0.14em] uppercase">
                {identidade}
            </p>

            {linhas.length > 0 && (
                <dl className="mt-1 space-y-px font-mono text-2xs leading-none tracking-[0.04em] text-stamp">
                    {linhas.map((linha) => (
                        <div key={linha.chave} className="flex gap-1.5">
                            <dt className="shrink-0 text-stamp-64 uppercase">{linha.chave}</dt>
                            <dd className="truncate border-b border-dotted border-stamp-32">
                                {linha.valor}
                            </dd>
                        </div>
                    ))}
                </dl>
            )}

            {rodape && (
                <p className="mt-1 border-t border-stamp-32 pt-1 font-mono text-2xs leading-none tracking-[0.08em] uppercase">
                    {rodape}
                </p>
            )}
        </div>
    );
}

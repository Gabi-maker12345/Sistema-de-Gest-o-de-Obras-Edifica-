import { cn } from '@/lib/utils';

/**
 * O medidor de execucao: a barra de um valor derivado, com a malha de 6px do
 * gabarito por baixo. Nunca funde fisica e financeira num unico valor — sao
 * duas barras, e a `marca` diz onde esta o outro numero sem o escrever.
 */
export function Medidor({
    valor,
    className,
    rotulo,
    marca,
    marcaRotulo,
}: {
    valor: number;
    className?: string;
    rotulo?: string;
    /**Segundo valor, marcado como testemunha dentro da barra. */
    marca?: number;
    marcaRotulo?: string;
}) {
    const limitado = Math.max(0, Math.min(100, valor));
    const marcaLimitada = marca === undefined ? undefined : Math.max(0, Math.min(100, marca));

    return (
        <div
            role="progressbar"
            aria-valuenow={Math.round(limitado)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={marcaRotulo ? `${rotulo} · ${marcaRotulo}` : rotulo}
            className={cn('medidor', className)}
            style={
                {
                    '--medidor-preenchimento': `${limitado}%`,
                    '--medidor-marca':
                        marcaLimitada === undefined ? undefined : `${marcaLimitada}%`,
                } as React.CSSProperties
            }
        >
            <span />
            {marcaLimitada !== undefined && (
                <span
                    aria-hidden
                    data-slot="medidor-marca"
                    title={marcaRotulo}
                    className="medidor-marca"
                />
            )}
        </div>
    );
}

import { cn } from '@/lib/utils';

/**
 * O bloco de titulo: a caixa impressa no canto do desenho onde o SGO escreve
 * o que e, a escala e a data. Nas paginas publicas e onde a promessa do
 * produto fica escrita a lapis, como quem preenche um documento.
 */
export function BlocoTitulo({
    folha,
    escala,
    revisao,
    emitidoEm,
    className,
}: {
    folha: string;
    escala: string;
    revisao: string;
    emitidoEm: string;
    className?: string;
}) {
    const campos = [
        { chave: 'Folha', valor: folha },
        { chave: 'Escala', valor: escala },
        { chave: 'Rev.', valor: revisao },
        { chave: 'Emitido', valor: emitidoEm },
    ];

    return (
        <dl
            className={cn(
                'grid w-full grid-cols-2 gap-px border border-graphite-32 bg-graphite-20 font-mono text-2xs tracking-[0.06em] uppercase sm:grid-cols-4',
                className,
            )}
        >
            {campos.map((campo) => (
                <div key={campo.chave} className="bg-paper px-2.5 py-1.5">
                    <dt className="text-graphite-64">{campo.chave}</dt>
                    <dd className="truncate font-medium text-graphite">{campo.valor}</dd>
                </div>
            ))}
        </dl>
    );
}

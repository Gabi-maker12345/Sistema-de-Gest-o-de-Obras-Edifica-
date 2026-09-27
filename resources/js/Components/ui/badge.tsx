import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';
import { estadoEhCritico, rotuloEstado, tracoEstado } from '@/lib/rotulos';

/**
 * O selo: um estado escrito a carimbo. O peso do traco diz o estado, a cor
 * apenas confirma — e o lapis vermelho fica reservado a atraso, erro e
 * rejeicao.
 */
const variantes = cva(
    'inline-flex items-center gap-1.5 rounded-selo whitespace-nowrap align-middle',
    {
        variants: {
            tinta: {
                carimbo: 'border-stamp text-stamp',
                ambar: 'border-amber text-amber-ink',
                lapis: 'border-red-pencil text-red-pencil',
                grafite: 'border-graphite-32 text-graphite-64',
                neutro: 'border-graphite-20 text-graphite-48',
                // A pasta: o cartao manila. Texto na pressao escura do cartao,
                // nunca o cartao em si — 0,53:1 sobre papel.
                pasta: 'border-pasta bg-pasta text-pasta-ink',
                // Para o que vive na tábua, onde o grafite em alfa desaparece.
                tinta: 'border-tinta-32 text-tinta-72',
            },
            traco: {
                firme: 'border-2 font-semibold',
                medio: 'border font-medium',
                leve: 'border font-normal',
                pontilhado: 'border border-dashed font-normal',
            },
            tamanho: {
                sm: 'px-1.5 py-px text-2xs',
                md: 'px-2 py-0.5 text-xs',
            },
        },
        defaultVariants: {
            tinta: 'neutro',
            traco: 'medio',
            tamanho: 'sm',
        },
    },
);

type SeloProps = ComponentProps<'span'> & VariantProps<typeof variantes>;

export function Selo({ className, tinta, traco, tamanho, ...props }: SeloProps) {
    return (
        <span
            data-slot="selo"
            className={cn(variantes({ tinta, traco, tamanho }), className)}
            {...props}
        />
    );
}

/**
 * O unico selo de estado do produto, e a unica forma de mostrar estado.
 * Recebe o valor interno (`em_execucao`) e devolve o rotulo em extenso
 * com o peso de traco correspondente — nunca um valor cru, nunca so cor.
 *
 * O peso do traco e a codificacao: `medio` e `leve` diferem so nisso, e e
 * isso que os separa. A tinta de carimbo fica de fora de propósito, porque no
 * contrato ela e identidade e nao estado; so o lapis vermelho entra aqui, e so
 * para atraso, erro e rejeicao.
 *
 * Os ecras passam `estado={projeto.estadoGeral}`, nunca
 * `<Selo>{projeto.estadoGeral}</Selo>`.
 */
export function EstadoSelo({
    estado,
    className,
    tamanho,
}: {
    estado: string;
    className?: string;
    tamanho?: VariantProps<typeof variantes>['tamanho'];
}) {
    const traco = tracoEstado(estado);
    const critico = estadoEhCritico(estado);

    return (
        <Selo
            tinta={critico ? 'lapis' : 'grafite'}
            traco={traco}
            tamanho={tamanho}
            className={className}
        >
            {critico && (
                <span aria-hidden className="inline-block size-1.5 rounded-full bg-red-pencil" />
            )}
            {rotuloEstado(estado)}
        </Selo>
    );
}

export { variantes as seloVariantes };

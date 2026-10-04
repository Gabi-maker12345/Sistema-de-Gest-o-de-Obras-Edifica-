import type { ReactNode } from 'react';
import { X } from 'lucide-react';

import { ComDica } from '@/Components/ui/dica';
import { Folha, FolhaCabecalho, FolhaCorpo, FolhaRodape } from '@/Components/ui/card';

import { Carimbo } from './carimbo';
import { cn } from '@/lib/utils';

/**
 * A ficha do registo: a folha que a margem de revisão acompanha.
 *
 * É a peça que faz de uma linha da tabela um registo com passado: a identidade
 * no carimbo, os valores que a lista não teve espaço para mostrar, e a margem
 * onde está quem mudou o quê. Vive na margem da prancha em vez de ser um ecrã
 * próprio porque a pergunta que traz — «o que é isto e quem mexeu?» — é a
 * segunda leitura de quem já está a ler a lista, não uma navegação nova.
 *
 * A acção de corrigir não é primária: o primário do ecrã é o botão de criar, no
 * topo da folha. Um ecrã com dois botões âmbar obriga o olho a decidir entre
 * acções que não são do mesmo peso — criar é começar um registo, corrigir é
 * mexer num que já existe.
 */
export function FichaRegisto({
    cota,
    titulo,
    selo,
    carimbo,
    children,
    accoes,
    aoFechar,
    className,
}: {
    /** A proveniência: que folha é esta e que registo. */
    cota: string;
    titulo: string;
    selo?: ReactNode;
    carimbo?: ReactNode;
    children: ReactNode;
    accoes?: ReactNode;
    aoFechar: () => void;
    className?: string;
}) {
    return (
        <Folha traco="carimbado" className={className}>
            <FolhaCabecalho>
                <div className="min-w-0">
                    <p className="cota">{cota}</p>
                    <h2 className="mt-0.5 truncate text-sm font-medium text-graphite">{titulo}</h2>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {selo}

                    <ComDica texto="Fechar a ficha">
                        <button
                            type="button"
                            onClick={aoFechar}
                            className="grid size-7 place-items-center border border-graphite-32 text-graphite-64 transition-colors hover:border-graphite hover:text-graphite focus-visible:border-amber focus-visible:outline-none"
                        >
                            <X aria-hidden className="size-3.5" />
                            <span className="sr-only">Fechar a ficha</span>
                        </button>
                    </ComDica>
                </div>
            </FolhaCabecalho>

            <FolhaCorpo className="space-y-6">
                {carimbo}
                {children}
            </FolhaCorpo>

            {accoes && <FolhaRodape className="justify-end">{accoes}</FolhaRodape>}
        </Folha>
    );
}

/**
 * A identidade do registo, na matriz do carimbo.
 *
 * A ficha repete o carimbo de propósito: a margem é a parte da prancha que fica
 * longe do canto, e é o carimbo que diz a que folha e a que registo se pertence
 * o que está a ser lido. A revisão vai na primeira linha porque é a revisão que
 * está em vigor que interessa, e a letra é a mesma que a margem desenha.
 */
export function CarimboFicha({
    entidade,
    revisao,
    linhas,
    rodape,
}: {
    entidade: string;
    revisao: string;
    linhas: Array<{ chave: string; valor: string }>;
    rodape?: string;
}) {
    return (
        <Carimbo
            identidade={`SGO · ${entidade}`}
            linhas={[{ chave: 'Revisão', valor: revisao }, ...linhas]}
            rodape={rodape}
            rodado={-1.5}
        />
    );
}

/** Uma cota e o seu valor: a mesma linha de dado em toda a ficha. */
export function DadoFicha({
    rotulo,
    children,
    className,
}: {
    rotulo: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <dt className="cota">{rotulo}</dt>
            <dd className="mt-0.5 text-sm text-graphite">{children}</dd>
        </div>
    );
}

/** O traço que divide duas zonas da ficha — divisória de bloco, hachura a 90º. */
export function VincoFicha({ className }: { className?: string }) {
    return <div className={cn('hachura-90 h-px w-full', className)} aria-hidden />;
}
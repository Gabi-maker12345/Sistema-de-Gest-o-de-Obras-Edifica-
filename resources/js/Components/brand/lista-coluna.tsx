import { useState } from 'react';

import { Janela, JanelaConteudo, JanelaTitulo } from '@/Components/ui/dialog';
import { cn } from '@/lib/utils';

/**
 * O plural escrito no código não sobrevive à flexão: «projectos» no singular é
 * «projecto», e cortar o `s` daria «projecto» — que Happens to work here, but
 * «papéis» daria «papíe». Por isso a flexão é uma palavra, não um corte.
 */
function singular(plural: string): string {
    const irregulares: Record<string, string> = {
        projectos: 'projecto',
        papeis: 'papel',
        responsaveis: 'responsável',
        reunioes: 'reunião',
        decisoes: 'decisão',
    };

    if (irregulares[plural]) {
        return irregulares[plural];
    }

    if (plural.endsWith('ões')) {
        return `${plural.slice(0, -3)}ão`;
    }
    if (plural.endsWith('ães')) {
        return `${plural.slice(0, -3)}ão`;
    }
    if (plural.endsWith('eis')) {
        return `${plural.slice(0, -3)}el`;
    }

    return plural.replace(/s$/, '');
}

/**
 * A lista que não cabe na coluna.
 *
 * Uma folha de obra tem colunas de largura fixa — a cota mede — e há
 * informação que não cabe nelas: os papéis de um utilizador, as frentes de uma
 * área. Duas saídas, e as duas têm de existir:
 *
 *  1. o `title` no elemento, para quem passa o rato e não quer clicar;
 *  2. esta janela, para quem clica e precisa de ler a lista inteira.
 *
 * A pista é o próprio número: quantos. Quem não clica lê o número, que é a
 * resposta para a pergunta que a coluna faz. Quem clica lê os nomes.
 */
export function ListaColuna({
    contagem,
    descricao,
    itens,
    vazio = '—',
    className,
}: {
    /** O número que a coluna anuncia. */
    contagem: number;
    /** O plural, como se escreve na legenda: «papéis», «frentes». */
    descricao: string;
    /** Os nomes, por ordem de leitura. */
    itens: string[];
    /** O que fica no lugar da coluna quando não há nada. */
    vazio?: string;
    className?: string;
}) {
    const [aberto, definirAberto] = useState(false);

    if (contagem === 0) {
        return (
            <span aria-hidden className={cn('font-mono text-sm text-graphite-32', className)}>
                {vazio}
            </span>
        );
    }

    const quantos = contagem === 1 ? singular(descricao) : descricao;

    return (
        <>
            <button
                type="button"
                title={`${contagem} ${quantos}: ${itens.join(' · ')}`}
                onClick={() => definirAberto(true)}
                className="group inline-flex items-baseline gap-1.5 font-mono text-sm tabular text-graphite transition-colors hover:text-graphite focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber"
            >
                {contagem}
                <span className="cota underline decoration-dotted decoration-graphite-48 underline-offset-[3px] transition-colors group-hover:decoration-graphite">
                    {quantos}
                </span>
            </button>

            <Janela open={aberto} onOpenChange={(estado) => !estado && definirAberto(false)}>
                <JanelaConteudo className="max-w-sm">
                    <JanelaTitulo>
                        {contagem} {quantos}
                    </JanelaTitulo>

                    <ul className="max-h-80 divide-y divide-graphite-12 overflow-y-auto border-y border-graphite-20 px-4">
                        {itens.map((item) => (
                            <li key={item} className="py-2 text-sm text-graphite">
                                {item}
                            </li>
                        ))}
                    </ul>

                    <div className="px-4 py-3">
                        <button
                            type="button"
                            onClick={() => definirAberto(false)}
                            className="cota text-graphite-64 underline underline-offset-2 transition-colors hover:text-graphite focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber"
                        >
                            fechar
                        </button>
                    </div>
                </JanelaConteudo>
            </Janela>
        </>
    );
}

/**
 * O número sozinho, com o detalhe inteiro no `title`. Para as folhas em que a
 * coluna é larga e o nome também caberia — aqui a lista não justifica uma
 * janela, e abrir uma modal para ler dois nomes seriaumpeso a mais.
 */
export function NumeroComDetalhe({
    contagem,
    descricao,
    itens,
    className,
}: {
    contagem: number;
    descricao: string;
    itens: string[];
    className?: string;
}) {
    if (contagem === 0) {
        return (
            <span aria-hidden className={cn('font-mono text-sm text-graphite-32', className)}>
                —
            </span>
        );
    }

    const quantos = contagem === 1 ? singular(descricao) : descricao;

    return (
        <span
            title={`${contagem} ${quantos}: ${itens.join(' · ')}`}
            className={cn('font-mono text-sm tabular text-graphite', className)}
        >
            {contagem}
        </span>
    );
}
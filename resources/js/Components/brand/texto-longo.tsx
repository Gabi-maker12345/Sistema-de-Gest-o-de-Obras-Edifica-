import { Asterisk } from 'lucide-react';
import { useState } from 'react';
import { Link } from '@inertiajs/react';

import { Janela, JanelaConteudo, JanelaDescricao, JanelaTitulo } from '@/Components/ui/dialog';
import { ComDica } from '@/Components/ui/dica';
import { cn } from '@/lib/utils';

/**
 * O texto que não cabe na coluna.
 *
 * Uma folha de obra tem colunas de largura fixa — a cota mede — e quase todo o
 * texto cabe. Cortar sempre, sem aviso, rouba ao leitor a informação sem lhe
 * dar forma de a recuperar. Mas um modal em cada célula é o outro extremo: onde
 * cabe, é só ruído.
 *
 * A regra é o comprimento, porque é o único sinal disponível antes de medir: a
 * partir de `LIMITE_JANELA` caracteres a célula passa a ser um botão com o
 * texto inteiro na pista e numa janela. Abaixo disso o texto sai como texto,
 * cortado em silêncio quando não couber.
 *
 * O limite é alto de propósito. A janela só entra quando o texto deixou de ser
 * um rótulo e passou a ser assunto de janela — uma descrição de âmbito, um plano
 * de manutenção. Um rótulo de 30 caracteres lê-se de relance; abrir-lhe um
 * diálogo é mais lento do que ler.
 */
export const LIMITE_JANELA = 100;

export function TextoLongo({
    texto,
    limite = LIMITE_JANELA,
    className,
    vazio = '—',
    href,
}: {
    texto: string;
    /** A partir deste número de caracteres, a célula abre janela. */
    limite?: number;
    className?: string;
    /** O que fica no lugar da célula quando não há texto. */
    vazio?: string;
    /**
     * Quando o texto também é um destino — o nome de uma equipa abre a equipa —
     * o link fica e a janela abre ao lado. Um botão dentro de um `<a>` não é
     * HTML válido, e trocar a navegação por uma janela seria pior defeito do
     * que o corte que se quer resolver.
     */
    href?: string;
}) {
    if (!texto) {
        return (
            <span aria-hidden className={cn('text-graphite-32', className)}>
                {vazio}
            </span>
        );
    }

    if (texto.length <= limite) {
        if (href) {
            return (
                <Link
                    href={href}
                    className={cn(
                        'block truncate underline decoration-graphite-32 underline-offset-[3px] transition-colors hover:decoration-graphite focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber',
                        className,
                    )}
                >
                    {texto}
                </Link>
            );
        }

        return <span className={cn('truncate', className)}>{texto}</span>;
    }

    return <TextoEmJanela texto={texto} className={className} href={href} />;
}

function TextoEmJanela({
    texto,
    className,
    href,
}: {
    texto: string;
    className?: string;
    href?: string;
}) {
    const [aberto, definirAberto] = useState(false);

    return (
        <>
            <span className="flex min-w-0 items-baseline gap-1">
                {href ? (
                    <ComDica texto={texto}>
                        <Link
                            href={href}
                            className={cn(
                                'min-w-0 truncate underline decoration-graphite-32 underline-offset-[3px] transition-colors hover:decoration-graphite focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber',
                                className,
                            )}
                        >
                            {texto}
                        </Link>
                    </ComDica>
                ) : (
                    <ComDica texto={texto}>
                        <button
                            type="button"
                            onClick={() => definirAberto(true)}
                            className={cn(
                                'min-w-0 truncate text-left underline decoration-dotted decoration-graphite-48 underline-offset-[3px] transition-colors hover:decoration-graphite focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber',
                                className,
                            )}
                        >
                            {texto}
                        </button>
                    </ComDica>
                )}

                {/* A pista de que o texto continua: o mesmo ponto que a cota
                    usa, aqui a dizer que há mais por ler. */}
                <ComDica texto={texto}>
                    <button
                        type="button"
                        aria-label={`Ler o texto completo: ${texto}`}
                        onClick={() => definirAberto(true)}
                        className="shrink-0 text-graphite-48 transition-colors hover:text-graphite focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber"
                    >
                        <Asterisk aria-hidden className="size-3" />
                    </button>
                </ComDica>
            </span>

            <Janela open={aberto} onOpenChange={(estado) => !estado && definirAberto(false)}>
                <JanelaConteudo className="max-w-md">
                    <JanelaTitulo>{texto}</JanelaTitulo>

                    <div className="px-4 py-3">
                        <JanelaDescricao className="cota">
                            {texto.length} caracteres — o texto completo, que a coluna
                            corta.
                        </JanelaDescricao>
                    </div>

                    <div className="px-4 pb-3">
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
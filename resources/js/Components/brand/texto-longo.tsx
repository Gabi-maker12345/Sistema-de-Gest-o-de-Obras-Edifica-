import { Asterisk } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';

import { Janela, JanelaConteudo, JanelaDescricao, JanelaTitulo } from '@/Components/ui/dialog';
import { ComDica } from '@/Components/ui/dica';
import { cn } from '@/lib/utils';

/**
 * A partir deste número de caracteres a célula abre janela em vez de mostrar só
 * o texto. Alto de propósito: a janela é para o texto que deixou de ser um
 * rótulo e passou a ser assunto de janela.
 */
export const LIMITE_JANELA = 100;

/**
 * O texto que a coluna corta.
 *
 * Uma folha tem colunas de largura fixa e quase todo o texto cabe. Cortar em
 * silêncio rouba ao leitor a informação sem lhe dar forma de a recuperar.
 *
 * A pista decide-se por **medição**, não por contagem de caracteres. A primeira
 * versão contava, e falhava nos dois sentidos: «Fiscal/Responsável de Obra»
 * (26 caracteres) era cortado numa coluna de 140px e não abria janela, enquanto
 * um âmbito de 45 caracteres numa coluna larga saía inteiro e abria. A régua não
 * é o número de letras — é quantos pixéis a coluna tem, e isso só se sabe
 * depois de pintar.
 *
 * Por isso a célula lê o próprio corte (`scrollWidth` contra `clientWidth`) e
 * só depois decide: cortada ganha asterisco e pista; a janela entra acima de
 * `LIMITE_JANELA`. Sem corte, sai como texto, sem nada que pareça clicável.
 *
 * O `truncate` está sempre no elemento — é ele que produz o corte que medimos.
 * Sem ele o texto transbordaria para a célula vizinha em vez de se cortar, que
 * é a colisão que o leitor via.
 */
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
    const [caixa, corte] = useCorte();

    if (!texto) {
        return (
            <span aria-hidden className={cn('text-graphite-32', className)}>
                {vazio}
            </span>
        );
    }

    // Texto que cabe: sai como texto. Nem pista, nem sublinhado, porque nada
    // sugere que haja mais a ler — e um sublinhado pontilhado num texto inteiro
    // é pior que não dar pista nenhuma.
    if (!corte) {
        const conteudo = (
            <span
                ref={caixa}
                className={cn(
                    'block truncate',
                    href &&
                        'underline decoration-graphite-32 underline-offset-[3px] transition-colors hover:decoration-graphite',
                    className,
                )}
            >
                {texto}
            </span>
        );

        // O link é o que dá o sentido de destino; a caixa que mede o corte é
        // sempre a mesma, para que a medição não dependa do ramo que o render
        // escolheu.
        return href ? <Link href={href}>{conteudo}</Link> : conteudo;
    }

    return (
        <TextoCortado
            texto={texto}
            className={className}
            href={href}
            caixa={caixa}
            abrirJanela={texto.length > limite}
        />
    );
}

/**
 * Diz se a caixa está a cortar o texto, e reavalia quando a coluna muda de
 * largura — a folha é responsiva, e o texto que cabia a 1600px não cabe a 380px.
 *
 * A medição vive numa ref de callback e não num efeito porque o elemento muda
 * de identidade: quando o corte passa a falso, o texto passa de `<span>` para
 * `<Link>` e o outro botão. Com um efeito que só corre no mount, a caixa nova
 * nunca era medida e a pista não aparecia nunca — que foi o primeiro defeito
 * desta componente.
 */
function useCorte() {
    const [corte, definirCorte] = useState(false);
    const elemento = useRef<HTMLElement | null>(null);
    const observador = useRef<ResizeObserver | null>(null);

    const medir = useCallback(() => {
        const el = elemento.current;

        if (!el) {
            return;
        }

        const medido = el.scrollWidth - el.clientWidth > 1;

        // Devolve o valor anterior quando é o mesmo: sem isto, cada render
        // dispara outro render.
        definirCorte((anterior) => (anterior === medido ? anterior : medido));
    }, []);

    const ligar = useCallback(
        (el: HTMLElement | null) => {
            observador.current?.disconnect();
            elemento.current = el;

            if (!el) {
                return;
            }

            medir();

            const observacao = new ResizeObserver(medir);
            observacao.observe(el);
            observador.current = observacao;
        },
        [medir],
    );

    useEffect(() => () => observador.current?.disconnect(), []);

    return [ligar, corte] as const;
}

function TextoCortado({
    texto,
    className,
    href,
    caixa,
    abrirJanela,
}: {
    texto: string;
    className?: string;
    href?: string;
    caixa: (el: HTMLElement | null) => void;
    /** Acima do limite, a janela é a forma de ler tudo. */
    abrirJanela: boolean;
}) {
    const [aberto, definirAberto] = useState(false);

    return (
        <>
            <span className="flex min-w-0 items-baseline gap-1">
                <ComDica texto={texto}>
                    <span
                        ref={caixa}
                        className={cn(
                            'min-w-0 truncate underline decoration-dotted decoration-graphite-48 underline-offset-[3px]',
                            href &&
                                'transition-colors hover:decoration-graphite focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber',
                            className,
                        )}
                    >
                        {href ? <Link href={href}>{texto}</Link> : texto}
                    </span>
                </ComDica>

                {/* O asterisco diz que o texto continua. Clicar só abre a janela
                    quando ela existe — abaixo do limite a pista já entregou o
                    texto todo, e um botão que não faz nada seria pior. */}
                <ComDica texto={abrirJanela ? texto : `${texto} — a coluna corta aqui`}>
                    <button
                        type="button"
                        aria-label={`Ler o texto completo: ${texto}`}
                        onClick={() => abrirJanela && definirAberto(true)}
                        className={cn(
                            'shrink-0 text-graphite-48 transition-colors hover:text-graphite focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber',
                            !abrirJanela && 'cursor-default hover:text-graphite-48',
                        )}
                    >
                        <Asterisk aria-hidden className="size-3" />
                    </button>
                </ComDica>
            </span>

            {abrirJanela && (
                <Janela
                    open={aberto}
                    onOpenChange={(estado) => !estado && definirAberto(false)}
                >
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
            )}
        </>
    );
}
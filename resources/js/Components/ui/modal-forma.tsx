import { Loader2, TriangleAlert } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { Botao } from '@/Components/ui/button';
import { ErroDeFormulario } from '@/Components/ui/field';
import {
    Janela,
    JanelaCabecalho,
    JanelaConteudo,
    JanelaDescricao,
    JanelaRodape,
    JanelaTitulo,
    JanelaX,
} from '@/Components/ui/dialog';

/**
 * A janela de formulário.
 *
 * Todos os cadastros desta fase abrem a mesma coisa: uma ficha pousada sobre a
 * mesa, com a accção a âmbar no canto inferior direito e o botão de fechar que
 * nunca perde trabalho. Se há escrita por guardar, fechar passa por uma
 * pergunta — não por um `alert()`, que é do sistema, não desta folha.
 */
export function ModalForma({
    aberto,
    aoFechar,
    titulo,
    descricao,
    notaCabecalho,
    largura = 'md',
    sujo = false,
    pendente = false,
    accao = 'Guardar',
    accaoDesactivada = false,
    erro,
    children,
    rodapeNota,
    aoGuardar,
}: {
    aberto: boolean;
    aoFechar: () => void;
    titulo: string;
    descricao?: string;
    /** A cota do canto: o que esta ficha é, no mesmo registo da folha. */
    notaCabecalho?: ReactNode;
    largura?: 'sm' | 'md' | 'lg';
    sujo?: boolean;
    pendente?: boolean;
    accao?: string;
    accaoDesactivada?: boolean;
    erro?: ReactNode;
    children: ReactNode;
    rodapeNota?: ReactNode;
    aoGuardar: () => void;
}) {
    const [aConfirmar, definirAConfirmar] = useState(false);

    // Reabrir a mesma ficha nunca pode herdar a pergunta do último fecho.
    useEffect(() => {
        if (aberto) {
            definirAConfirmar(false);
        }
    }, [aberto]);

    function pedirSaida(abertoAgora: boolean) {
        if (abertoAgora) {
            return;
        }

        // A guardar não se sai: a escrita está a caminho e fechar agora abriria
        // uma ficha nova por cima da que ainda não terminou de gravar.
        if (pendente) {
            return;
        }

        if (sujo) {
            definirAConfirmar(true);

            return;
        }

        aoFechar();
    }

    const larguras = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl',
    } as const;

    return (
        <Janela open={aberto} onOpenChange={pedirSaida}>
            <JanelaConteudo className={cn('p-0', larguras[largura])}>
                <form
                    noValidate
                    // `flex` aqui é o que faz o corpo rolar sozinho: sem ele, o
                    // formulário cresce para fora do `max-h` da janela e o rodapé
                    // — a accção — sai do ecrã num formulário comprido.
                    className="flex min-h-0 flex-1 flex-col"
                    aria-busy={pendente}
                    onSubmit={(evento) => {
                        evento.preventDefault();
                        aoGuardar();
                    }}
                >
                    <JanelaCabecalho>
                        <div className="min-w-0">
                            <JanelaTitulo>{titulo}</JanelaTitulo>
                            {descricao && <JanelaDescricao>{descricao}</JanelaDescricao>}
                            {notaCabecalho && (
                                <p className="cota mt-1 text-graphite-64">{notaCabecalho}</p>
                            )}
                        </div>

                        <JanelaX type="button" disabled={pendente} onClick={() => pedirSaida(false)} />
                    </JanelaCabecalho>

                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                        <div className="space-y-4">
                            {erro && <ErroDeFormulario>{erro}</ErroDeFormulario>}
                            {children}
                        </div>
                    </div>

                    <JanelaRodape className="flex-wrap justify-between gap-3">
                        {aConfirmar ? (
                            <div className="flex w-full flex-wrap items-center justify-between gap-3">
                                <p className="flex items-center gap-2 text-sm text-amber-ink">
                                    <TriangleAlert aria-hidden className="size-4 shrink-0" />
                                    Há escrita por guardar. Descartar?
                                </p>

                                <div className="flex items-center gap-2">
                                    <Botao
                                        variante="contorno"
                                        type="button"
                                        onClick={() => definirAConfirmar(false)}
                                    >
                                        Continuar a escrever
                                    </Botao>
                                    <Botao type="button" onClick={aoFechar}>
                                        Descartar a escrita
                                    </Botao>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="min-w-0 flex-1 text-xs text-graphite-64">
                                    {rodapeNota}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Botao
                                        variante="contorno"
                                        type="button"
                                        onClick={() => pedirSaida(false)}
                                        disabled={pendente}
                                    >
                                        Cancelar
                                    </Botao>
                                    <Botao type="submit" disabled={pendente || accaoDesactivada}>
                                        {pendente ? (
                                            <>
                                                <Loader2
                                                    aria-hidden
                                                    className="size-4 animate-spin motion-reduce:animate-none"
                                                />
                                                A guardar…
                                            </>
                                        ) : (
                                            accao
                                        )}
                                    </Botao>
                                </div>
                            </>
                        )}
                    </JanelaRodape>

                {/* O nome do botão muda de «Registar» para «A guardar…» sem que
                    o foco se mexa, e isso por si só não é anunciado. */}
                <span aria-live="polite" className="sr-only">
                    {pendente ? 'A guardar as alterações.' : ''}
                </span>
            </form>
            </JanelaConteudo>
        </Janela>
    );
}

/**
 * Leva o foco ao primeiro campo que a validação reprovou. Uma ficha que abre
 * com o erro no fundo obriga a reler tudo para o encontrar; o lápis vermelho
 * aponta, mas não grita.
 */
export function focarPrimeiroInvalido(): boolean {
    const janela = document.querySelector<HTMLElement>('[role="dialog"]');

    if (!janela) {
        return false;
    }

    const primeiro = janela.querySelector<HTMLElement>('[aria-invalid="true"]:not([disabled])');

    if (!primeiro) {
        return false;
    }

    primeiro.focus();

    if (primeiro instanceof HTMLInputElement || primeiro instanceof HTMLTextAreaElement) {
        primeiro.select();
    }

    return true;
}

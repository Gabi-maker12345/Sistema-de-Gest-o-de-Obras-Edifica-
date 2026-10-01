import { TriangleAlert } from 'lucide-react';

import { Botao } from '@/Components/ui/button';
import {
    Janela,
    JanelaCabecalho,
    JanelaConteudo,
    JanelaDescricao,
    JanelaRodape,
    JanelaTitulo,
} from '@/Components/ui/dialog';

/**
 * A confirmação de eliminação (spec §174).
 *
 * Uma folha de obra não apaga nada por um clique: retirar um acesso ou um membro
 * tira a pessoa de onde ela vai trabalhar, e desfazer isso não é um «Ctrl+Z».
 * Por isso a pergunta vive numa janela própria, em `sm`, com o nome do que
 * desaparece escrito no corpo — «retirar o acesso de X desta obra» e não
 * «tem a certeza?».
 *
 * A acção é âmbar, que é a cor das acções nesta folha; o lápis vermelho fica
 * para o aviso e a rejeição, não para um botão de fechar.
 */
export function Confirmacao({
    aberto,
    titulo,
    descricao,
    accao = 'Retirar',
    aoFechar,
    aoConfirmar,
}: {
    aberto: boolean;
    titulo: string;
    descricao: string;
    /** O verbo do botão: «Retirar», «Eliminar», «Cancelar o registo». */
    accao?: string;
    aoFechar: () => void;
    aoConfirmar: () => void;
}) {
    return (
        <Janela open={aberto} onOpenChange={(estado) => !estado && aoFechar()}>
            <JanelaConteudo className="max-w-md">
                <JanelaCabecalho>
                    <div className="min-w-0">
                        <JanelaTitulo>{titulo}</JanelaTitulo>
                    </div>
                </JanelaCabecalho>

                <div className="flex items-start gap-3 px-4 py-4">
                    <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-amber" />
                    <p className="text-sm text-graphite">
                        <JanelaDescricao asChild>
                            <span>{descricao}</span>
                        </JanelaDescricao>
                    </p>
                </div>

                <JanelaRodape>
                    <Botao variante="contorno" type="button" onClick={aoFechar}>
                        Deixar como está
                    </Botao>
                    <Botao type="button" onClick={aoConfirmar}>
                        {accao}
                    </Botao>
                </JanelaRodape>
            </JanelaConteudo>
        </Janela>
    );
}
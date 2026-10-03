/**
 * O botão que desfaz uma busca.
 *
 * Existe em todas as folhas que pesquisam, e é sempre a mesma coisa: sai do contexto
 * para uma palavra em vez de a apagar tecla a tecla. Vive aqui porque não é
 * propriedade de nenhuma folha — importá-lo de uma delas faria com que o
 * diário dependesse das actividades para mostrar «limpar».
 */
export function BotaoLimpar({ aoLimpar }: { aoLimpar: () => void }) {
    return (
        <button
            type="button"
            onClick={aoLimpar}
            className="font-sans text-xs text-graphite underline underline-offset-2 hover:text-graphite-64 focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none"
        >
            limpar
        </button>
    );
}
import { Selo } from '@/Components/ui/badge';

/**
 * O estado de sincronização de um registo (spec §6).
 *
 * Diário de obra, Fotografias e Despesas são preenchidos no terreno, onde a rede
 * falha. O registo guarda-se na mesma e fica à espera de subir, e quem abre o
 * painel no escritório precisa de saber de relance o que ainda não subiu — um
 * relatório de obra sem a entrada de ontem é um relatório errado, mesmo que
 * pareça completo.
 *
 * É só o estado visual: não há fila, nem tentativas, nem relógio. A spec pede
 * explicitamente que não se simule rede, e um badge que fingisse estar a tentar
 * sincronizar seria uma promessa que o código não cumpre.
 *
 * O âmbar é a cor de «pendente» no produto (spec §11), por isso o registo por
 * sincronizar é âmbar e não vermelho: nada correu mal, só ainda não subiu. O
 * vermelho fica reservado para atraso e rejeição.
 */
export function SeloSincronizacao({
    sincronizado,
    className,
}: {
    sincronizado: boolean;
    className?: string;
}) {
    return (
        <Selo
            tinta={sincronizado ? 'grafite' : 'ambar'}
            traco={sincronizado ? 'leve' : 'pontilhado'}
            tamanho="sm"
            className={className}
            title={
                sincronizado
                    ? 'Sincronizado'
                    : 'Pendente de sincronização — registado no terreno, ainda não subiu'
            }
        >
            {sincronizado ? (
                'Sincronizado'
            ) : (
                <>
                    <NuvemCortada />
                    Pendente de sincronização
                </>
            )}
        </Selo>
    );
}

/**
 * A nuvem cortada (spec §6 pede «ícone de nuvem cortada»).
 *
 * A linha atravessa a nuvem, não a apaga: o registo existe e está guardado, o
 * que falta é a viagem. Desenhada com o traço actual do selo para não pesar o
 * texto pequeno a que pertence.
 */
export function NuvemCortada() {
    return (
        <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="size-3 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4.6 12.5a2.9 2.9 0 0 1-.5-5.75 3.9 3.9 0 0 1 7.5-1.1 3 3 0 0 1 1.4 6.85" />
            <path d="M2.5 13.5 13.5 2.5" />
        </svg>
    );
}
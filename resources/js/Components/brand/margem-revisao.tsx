import { useMemo } from 'react';

import { useSgo } from '@/Data/SgoContext';
import { dataHora } from '@/lib/format';
import { dePara, revisoesDoRegisto, rotuloCampo, utilizadorDe } from '@/lib/historico';
import { cn } from '@/lib/utils';

/**
 * A margem de revisão: o histórico do registo como a prancha o acumula.
 *
 * A barra de revisão que corre pela prancha era decorativa — letras e quadrados
 * a dizer que ali houve uma correcção. Aqui as letras são as revisões a sério:
 * `A` é a primeira alteração que o registo teve, a última é a que está em vigor,
 * e a margem lê-se de cima para baixo porque a pergunta de quem abre um
 * histórico é o que mudou agora.
 *
 * A entrada de criação não tem `campo`: é a linha que diz «isto passou a
 * existir». Escrevê-la com o mesmo formato das outras esconderia o facto de que
 * foi um registo novo e não uma correcção — e num caderno de obra a diferença
 * entre as duas coisas é a diferença entre «começou» e «mudou».
 *
 * A última revisão é a de maior pressão de tinta: é o peso do traço a dizer qual
 * é a folha vigente, exactamente como na barra da prancha, agora com conteúdo.
 */
/**
 * As revisões de um registo, da mais recente para a mais antiga.
 *
 * A criação entra por dois valores e não por um objecto: um objecto literal
 * seria um registo novo a cada render e a memoização nunca segurava.
 */
export function useRevisoes(
    entidade: string,
    registoId: string,
    criadoPor?: string,
    criadoEm?: string,
) {
    const { estado } = useSgo();

    return useMemo(
        () =>
            revisoesDoRegisto(
                estado,
                entidade,
                registoId,
                criadoPor !== undefined && criadoEm !== undefined
                    ? { utilizadorId: criadoPor, criadoEm }
                    : null,
            ),
        [estado, entidade, registoId, criadoPor, criadoEm],
    );
}

export function MargemRevisao({
    entidade,
    registoId,
    criadoPor,
    criadoEm,
    className,
}: {
    /** O nome da entidade, tal como a spec a escreve: `Projecto`, `Tarefa`. */
    entidade: string;
    registoId: string;
    /**
     * A criação vinda do próprio registo, para quem a sabe e ainda não a
     * escreveu no histórico. É o caso do documento, que sabe quando e por quem
     * foi anexado.
     */
    criadoPor?: string;
    criadoEm?: string;
    className?: string;
}) {
    const revisoes = useRevisoes(entidade, registoId, criadoPor, criadoEm);
    const { estado } = useSgo();

    const vigente = revisoes[0];

    return (
        <section className={cn('space-y-3', className)}>
            <div className="flex items-baseline justify-between gap-3 border-b border-graphite-12 pb-2">
                <h3 className="cota text-graphite">Revisão</h3>
                <p className="cota tabular">
                    {revisoes.length === 0
                        ? '—'
                        : `${revisoes.length} ${revisoes.length === 1 ? 'entrada' : 'entradas'}`}
                </p>
            </div>

            {revisoes.length === 0 ? (
                <p className="anotacao normal-case">
                    Este registo ainda não foi corrigido depois de criado.
                </p>
            ) : (
                <ol className="border-l border-graphite-20 pl-5">
                    {revisoes.map((entrada) => {
                        const emVigor = entrada.id === vigente.id;

                        return (
                            <li key={entrada.id} className="relative pb-4 last:pb-0">
                                <span
                                    className={cn(
                                        'absolute top-0 -left-1 font-mono text-2xs leading-none tracking-[0.08em]',
                                        emVigor ? 'font-semibold text-graphite' : 'text-graphite-64',
                                    )}
                                >
                                    {entrada.revisao}
                                </span>

                                <p className="font-mono text-2xs tracking-[0.04em] text-graphite-64 tabular">
                                    {dataHora(entrada.criadoEm)}
                                </p>

                                <p
                                    className={cn(
                                        'mt-1 text-xs',
                                        emVigor ? 'font-medium text-graphite' : 'text-graphite',
                                    )}
                                >
                                    {utilizadorDe(estado, entrada.utilizadorId)}
                                </p>

                                {entrada.campo === null ? (
                                    <p className="anotacao normal-case">criou o registo</p>
                                ) : (
                                    <p className="anotacao normal-case">
                                        <span className="text-graphite">
                                            {rotuloCampo(entrada.campo)}
                                        </span>
                                        <span className="text-graphite-64">
                                            {' · '}
                                            {dePara(entrada.de, entrada.para)}
                                        </span>
                                    </p>
                                )}
                            </li>
                        );
                    })}
                </ol>
            )}

            <p className="anotacao normal-case text-graphite-64">
                Da mais recente para a mais antiga. A letra é a ordem em que a
                correcção foi escrita, não a ordem em que aparece.
            </p>
        </section>
    );
}

/**
 * O que a margem diz quando ainda não há registo escolhido.
 *
 * A margem não é um espaço vazio à espera de conteúdo: é a parte da prancha que
 * explica o que se pode fazer ali. Escrever o convite nela é melhor do que
 * repetir a instrução em cada linha da tabela.
 */
export function MargemSemFicha({ className }: { className?: string }) {
    return (
        <div className={cn('space-y-3', className)}>
            <p className="cota text-graphite">Revisão</p>

            <p className="hachura-90 border border-graphite-20 p-4 text-sm text-graphite-64">
                Escolha uma linha para abrir a ficha do registo e a margem onde
                está quem mudou o quê.
            </p>

            <p className="anotacao normal-case">
                Nenhum registo seleccionado. A lista da esquerda é a do módulo
                inteiro; a ficha é de uma linha só.
            </p>
        </div>
    );
}
import { useMemo } from 'react';

import { FolhaRegistos } from '@/Components/brand/folha-registos';
import { useSgo } from '@/Data/SgoContext';
import type { EntradaHistorico } from '@/Data/types';
import { dataExtenso, dataHora, normalizar } from '@/lib/format';
import { useBusca } from '@/Components/brand/contexto-busca';

/**
 * O histórico de um registo.
 *
 * Sete entidades têm esta aba (spec §13, fase 6 do painel): Projecto,
 * Actividade, Tarefa, Despesa, Pagamento, Documento e Decisão. Todas mostram a
 * mesma coisa — quem mudou o quê, quando, e o que passou a valer — por isso a
 * folha vive aqui e cada entidade passa só o seu nome e o seu id.
 *
 * A entrada de criação não tem `campo`: é a linha que diz «isto passou a
 * existir», e escrevê-la com o mesmo formato das outras esconderia o facto de
 * que foi um registo novo e não uma correcção.
 *
 * A ordenação é por data descendente e não por ordem de inserção: quem abre o
 * histórico quer a última alteração no topo, não a primeira a ser registada.
 */
/**
 * As três colunas do histórico: quando, quem, o que mudou.
 *
 * A ordenação é pelo instante e não pela ordem de inserção: quem abre o
 * histórico quer a última alteração no topo, não a primeira a ser registada. E
 * não há botão de ordenação — uma folha com uma coluna possível não tem o que
 * inverter, e um cabeçalho clicável que não muda nada é pior do que texto.
 */
const COLUNAS = [
    { chave: 'quando', cota: 'Quando' },
    { chave: 'quem', cota: 'Quem' },
    { chave: 'oQue', cota: 'O que mudou' },
];

export function FolhaHistorico({
    entidade,
    registoId,
    className,
}: {
    /** O nome da entidade, tal como a spec a escreve: `Projecto`, `Tarefa`. */
    entidade: string;
    registoId: string;
    className?: string;
}) {
    const { estado } = useSgo();
    const { termo, limpar } = useBusca();

    const entradas = useMemo(() => {
        const alvo = normalizar(termo.trim());

        return estado.historico
            .filter(
                (entrada) =>
                    entrada.entidade === entidade && entrada.registoId === registoId,
            )
            .filter((entrada) => {
                if (alvo.length === 0) {
                    return true;
                }

                const pessoa = estado.utilizadores.find(
                    (utilizador) => utilizador.id === entrada.utilizadorId,
                );

                return normalizar(
                    `${pessoa?.nome ?? ''} ${entrada.campo ?? ''} ${entrada.de ?? ''} ${
                        entrada.para ?? ''
                    }`,
                ).includes(alvo);
            })
            .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    }, [estado.historico, estado.utilizadores, entidade, registoId, termo]);

    if (estado.historico.length === 0) {
        return null;
    }

    return (
        <FolhaRegistos<EntradaHistorico>
            titulo="Histórico · quem mudou o quê"
            contagem={
                termo.trim().length > 0 ? (
                    <button
                        type="button"
                        onClick={limpar}
                        className="font-sans text-xs text-graphite underline underline-offset-2 hover:text-graphite-64 focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none"
                    >
                        limpar
                    </button>
                ) : (
                    `${entradas.length} ${entradas.length === 1 ? 'entrada' : 'entradas'}`
                )
            }
            ordem={{ coluna: 'quando', sentido: 'desc' }}
            alternar={() => undefined}
            colunas={COLUNAS}
            grelha="grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)]"
            linhas={entradas}
            chaveDe={(entrada) => entrada.id}
            vazio={
                termo.trim().length > 0
                    ? 'Nenhuma entrada corresponde a esta busca.'
                    : 'Este registo ainda não foi corrigido depois de criado.'
            }
            className={className}
        >
            {(entrada) => (
                <div className="grid grid-cols-1 gap-1 px-3 py-2 md:grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)] md:items-baseline md:gap-3">
                    <p className="cota flex items-baseline gap-2">
                        <span>{dataHora(entrada.criadoEm)}</span>
                        <span className="hidden text-graphite-48 md:inline">
                            {dataExtenso(entrada.criadoEm)}
                        </span>
                    </p>

                    <p className="text-sm text-graphite">
                        {nomeDe(estado.utilizadores, entrada.utilizadorId)}
                    </p>

                    <p className="text-sm">
                        {entrada.campo === null ? (
                            <span className="text-graphite-64">
                                criou o registo
                            </span>
                        ) : (
                            <span className="text-graphite-64">
                                <span className="font-mono text-2xs text-graphite">
                                    {entrada.campo}
                                </span>{' '}
                                {dePara(entrada.de, entrada.para)}
                            </span>
                        )}
                    </p>
                </div>
            )}
        </FolhaRegistos>
    );
}

/**
 * A alteração, escrita como se lê: `estadoGeral: Em execução → Suspenso`.
 *
 * Um valor que não mudou de facto não entra: a entrada que diz que o campo foi
 * gravado com o que já tinha não é uma alteração, é um clique.
 */
function dePara(de: string | null, para: string | null): string {
    if (de === null && para === null) {
        return 'actualizado';
    }

    if (de === null) {
        return `passou a ${para}`;
    }

    if (para === null) {
        return `passou de ${de} a vazio`;
    }

    return `${de} → ${para}`;
}

function nomeDe(utilizadores: Array<{ id: string; nome: string }>, id: string): string {
    return utilizadores.find((utilizador) => utilizador.id === id)?.nome ?? 'Utilizador removido';
}
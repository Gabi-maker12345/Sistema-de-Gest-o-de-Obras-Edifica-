import { useCallback, useEffect, useState } from 'react';

import { Campo } from '@/Components/ui/field';
import { Input } from '@/Components/ui/input';
import { ModalForma } from '@/Components/ui/modal-forma';
import { Combo } from '@/Components/ui/combobox';
import { Calendario } from '@/Components/ui/calendario';
import { useSgo } from '@/Data/SgoContext';
import type { MembroEquipa } from '@/Data/types';
import { hoje } from '@/lib/espelho';
import { dataIso } from '@/lib/format';

import { REGRAS, useFicha } from './formulario-local';

/**
 * A janela de membros de uma equipa (spec §303), em `sm` e sempre aberta a
 * partir da equipa, nunca pelo botão «+ Novo» do menu.
 *
 * A lista de membros é uma tabela de junção com chave composta — equipa e
 * utilizador — e por isso não tem `id` nem passa pelos utilitários de
 * registo. É a ficha que a escreve por inteiro de uma vez, que é a única forma
 * de trocar o par sem deixar o mesmo utilizador duas vezes na mesma equipa.
 *
 * A data de saída é o que distingue uma equipa que está a trabalhar de uma
 * equipa que já trabalhou noutra obra: o membro sai com data, não desaparece.
 */
type DadosMembro = {
    utilizadorId: string | null;
    funcao: string;
    dataEntrada: string;
    dataSaida: string;
};

const VAZIO: DadosMembro = {
    utilizadorId: null,
    funcao: '',
    dataEntrada: dataIso(new Date()),
    dataSaida: '',
};

export function ModalMembro({
    aberto,
    equipaId,
    membros,
    aoFechar,
}: {
    aberto: boolean;
    equipaId: string;
    /** Quem já está na equipa: quem não pode entrar outra vez. */
    membros: MembroEquipa[];
    aoFechar: () => void;
}) {
    const { estado, definirMembros } = useSgo();

    const gravar = useCallback(
        (dados: DadosMembro) => {
            definirMembros(equipaId, [
                ...membros,
                {
                    equipaId,
                    utilizadorId: dados.utilizadorId ?? '',
                    funcao: dados.funcao.trim(),
                    dataEntrada: dados.dataEntrada,
                    dataSaida: dados.dataSaida || null,
                },
            ]);
        },
        [definirMembros, equipaId, membros],
    );

    const nomeDe = useCallback(
        (utilizadorId: string) =>
            estado.utilizadores.find((utilizador) => utilizador.id === utilizadorId)?.nome ??
            utilizadorId,
        [estado.utilizadores],
    );

    const ficha = useFicha<DadosMembro>({
        vazio: VAZIO,
        validar: (dados) =>
            REGRAS.juntar(
                [
                    'utilizadorId',
                    REGRAS.seleccionado(dados.utilizadorId, 'a pessoa a juntar'),
                ],
                ['dataEntrada', REGRAS.obrigatorio(dados.dataEntrada, 'A data de entrada')],
                [
                    'dataSaida',
                    dados.dataSaida && dados.dataSaida < dados.dataEntrada
                        ? 'Ninguém sai de uma equipa antes de entrar nela.'
                        : null,
                ],
            ),
        aoGuardar: gravar,
        aoFechar,
        mensagem: (dados) => `Juntado à equipa: ${nomeDe(dados.utilizadorId ?? '')}.`,
    });

    useEffect(() => {
        if (aberto) {
            ficha.preparar({ ...VAZIO, dataEntrada: dataIso(hoje()) });
        }
    }, [aberto]);

    const { dados, erros, definir, guardar: submeter, pendente, sujo } = ficha;

    const disponiveis = estado.utilizadores.filter(
        (utilizador) =>
            utilizador.activo &&
            !membros.some((membro) => membro.utilizadorId === utilizador.id),
    );

    return (
        <ModalForma
            aberto={aberto}
            aoFechar={aoFechar}
            titulo="Adicionar membro"
            descricao="Quem entra na equipa, a que função e a partir de quando."
            notaCabecalho="Equipa · membro"
            largura="sm"
            sujo={sujo}
            pendente={pendente}
            accao="Juntar à equipa"
            rodapeNota={
                disponiveis.length === 0
                    ? 'Não há mais pessoas activas para juntar a esta equipa.'
                    : `${disponiveis.length} ${disponiveis.length === 1 ? 'pessoa disponível' : 'pessoas disponíveis'}`
            }
            aoGuardar={submeter}
        >
            <Campo
                rotulo="Utilizador"
                htmlFor="membro-utilizador"
                obrigatorio
                ajuda="Exclui quem já é membro desta equipa."
                erro={erros.utilizadorId}
            >
                <Combo
                    id="membro-utilizador"
                    valor={dados.utilizadorId}
                    opcoes={disponiveis.map((utilizador) => ({
                        valor: utilizador.id,
                        rotulo: utilizador.nome,
                    }))}
                    aoEscolher={(valor) => definir('utilizadorId', valor)}
                    aoLimpar={() => definir('utilizadorId', null)}
                    placeholder={
                        disponiveis.length === 0
                            ? 'Toda a gente já está na equipa'
                            : 'Escolher pessoa…'
                    }
                    vazio="Não há mais pessoas activas para juntar a esta equipa."
                    className="w-full"
                />
            </Campo>

            <Campo rotulo="Função" htmlFor="membro-funcao">
                <Input
                    id="membro-funcao"
                    value={dados.funcao}
                    onChange={(evento) => definir('funcao', evento.target.value)}
                    placeholder="Aparelhante"
                />
            </Campo>

            <Campo
                rotulo="Data de entrada"
                htmlFor="membro-entrada"
                obrigatorio
                erro={erros.dataEntrada}
            >
                <Calendario
                    id="membro-entrada"
                    valor={dados.dataEntrada || null}
                    aoEscolher={(iso) => definir('dataEntrada', iso)}
                />
            </Campo>

            <Campo
                rotulo="Data de saída"
                htmlFor="membro-saida"
                ajuda="Opcional. Preenchida quando a pessoa já saiu."
                erro={erros.dataSaida}
            >
                <Calendario
                    id="membro-saida"
                    valor={dados.dataSaida || null}
                    aoEscolher={(iso) => definir('dataSaida', iso)}
                    minimo={dados.dataEntrada || undefined}
                />
            </Campo>
        </ModalForma>
    );
}
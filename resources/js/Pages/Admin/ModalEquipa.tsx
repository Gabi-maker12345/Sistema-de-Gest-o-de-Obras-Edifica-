import { useCallback, useEffect } from 'react';

import { Campo } from '@/Components/ui/field';
import { Input } from '@/Components/ui/input';
import { ModalForma } from '@/Components/ui/modal-forma';
import { Combo } from '@/Components/ui/combobox';
import { useSgo } from '@/Data/SgoContext';
import type { Equipa } from '@/Data/types';
import { normalizar } from '@/lib/format';

import { REGRAS, novoId, useFicha } from './formulario-local';

/**
 * A ficha da equipa (spec §255).
 *
 * Quatro campos: `nome*`, `especialidade`, `encarregado` e `projecto`. Só o nome
 * é obrigatório — o resto da equipa nasce a meio e completa-se depois, que é a
 * diferença entre uma equipa registada e uma equipa pronta para trabalhar.
 *
 * Os membros **não** entram aqui (spec §303): vivem numa janela `sm` própria,
 * aberta a partir da equipa já registada. Por isso o modal acaba em «Registar
 * equipa» e a nota de rodapé aponta para a página de detalhe.
 */
type DadosEquipa = {
    id: string;
    nome: string;
    especialidade: string;
    encarregadoId: string | null;
    projectoId: string | null;
};

const VAZIO: DadosEquipa = {
    id: '',
    nome: '',
    especialidade: '',
    encarregadoId: null,
    projectoId: null,
};

function de(equipa: Equipa): DadosEquipa {
    return {
        id: equipa.id,
        nome: equipa.nome,
        especialidade: equipa.especialidade,
        encarregadoId: equipa.encarregadoId,
        projectoId: equipa.projectoId,
    };
}

export function ModalEquipa({
    aberto,
    equipa,
    aoFechar,
}: {
    aberto: boolean;
    equipa: Equipa | null;
    aoFechar: () => void;
}) {
    const { estado, criar, actualizar } = useSgo();

    const guardar = useCallback(
        (dados: DadosEquipa) => {
            const registo: Equipa = {
                id: dados.id || novoId('eq'),
                nome: dados.nome.trim(),
                especialidade: dados.especialidade.trim(),
                encarregadoId: dados.encarregadoId,
                projectoId: dados.projectoId,
            };

            if (dados.id) {
                actualizar('equipas', dados.id, registo);
            } else {
                criar('equipas', registo);
            }
        },
        [actualizar, criar],
    );

    const membrosActuais = estado.membrosEquipa.filter(
        (membro) => membro.equipaId === equipa?.id,
    ).length;

    const duplicado = (nome: string, id: string): string | null => {
        const alvo = normalizar(nome);

        if (alvo.length === 0) {
            return null;
        }

        const jaExiste = estado.equipas.some(
            (outra) => outra.id !== id && normalizar(outra.nome) === alvo,
        );

        return jaExiste ? 'Já existe uma equipa com este nome.' : null;
    };

    const ficha = useFicha<DadosEquipa>({
        vazio: VAZIO,
        validar: (dados) =>
            REGRAS.juntar(
                ['nome', REGRAS.obrigatorio(dados.nome, 'O nome da equipa')],
                ['nome', REGRAS.minimo(dados.nome, 2, 'O nome da equipa')],
                ['nome', duplicado(dados.nome, dados.id)],
            ),
        aoGuardar: guardar,
        aoFechar,
        mensagem: (dados) =>
            dados.id ? `Equipa actualizada: ${dados.nome}.` : `Equipa registada: ${dados.nome}.`,
    });

    useEffect(() => {
        if (aberto) {
            ficha.preparar(equipa ? de(equipa) : undefined);
        }
    }, [aberto, equipa]);

    const { dados, erros, definir, guardar: submeter, pendente, sujo } = ficha;
    const emEdicao = dados.id !== '';

    return (
        <ModalForma
            aberto={aberto}
            aoFechar={aoFechar}
            titulo={emEdicao ? 'Corrigir equipa' : 'Nova equipa'}
            descricao={
                emEdicao
                    ? 'O que muda aqui é a equipa. A lista de quem trabalha nela é outra janela.'
                    : 'A equipa passa a existir; quem trabalha nela entra depois.'
            }
            notaCabecalho={`Equipa · ${emEdicao ? 'correcção' : 'abertura'}`}
            sujo={sujo}
            pendente={pendente}
            accao={emEdicao ? 'Guardar correcção' : 'Registar equipa'}
            rodapeNota="Adicione membros à equipa depois de criada, na página de detalhe."
            aoGuardar={submeter}
        >
            <Campo rotulo="Nome" htmlFor="equipa-nome" obrigatorio erro={erros.nome}>
                <Input
                    id="equipa-nome"
                    value={dados.nome}
                    onChange={(evento) => definir('nome', evento.target.value)}
                    aria-invalid={Boolean(erros.nome)}
                    placeholder="Betão — equipa 2"
                    autoFocus
                />
            </Campo>

            <Campo
                rotulo="Especialidade"
                htmlFor="equipa-especialidade"
                ajuda="Opcional. O que a equipa faz."
                erro={erros.especialidade}
            >
                <Input
                    id="equipa-especialidade"
                    value={dados.especialidade}
                    onChange={(evento) => definir('especialidade', evento.target.value)}
                    aria-invalid={Boolean(erros.especialidade)}
                    placeholder="Betão armado"
                />
            </Campo>

            <Campo
                rotulo="Encarregado"
                htmlFor="equipa-encarregado"
                ajuda="Opcional. Quem responde pela equipa — dá-se-lhe quando há quem responda."
                erro={erros.encarregadoId}
            >
                <Combo
                    id="equipa-encarregado"
                    valor={dados.encarregadoId}
                    opcoes={estado.utilizadores.map((utilizador) => ({
                        valor: utilizador.id,
                        rotulo: utilizador.nome,
                    }))}
                    aoEscolher={(valor) => definir('encarregadoId', valor)}
                    aoLimpar={() => definir('encarregadoId', null)}
                    placeholder="Escolher encarregado…"
                    vazio="Nenhum utilizador registado."
                    className="w-full"
                />
            </Campo>

            <Campo
                rotulo="Projecto"
                htmlFor="equipa-projecto"
                ajuda="Opcional. Uma equipa pode ser montada antes de estar atribuída a uma obra."
                erro={erros.projectoId}
            >
                <Combo
                    id="equipa-projecto"
                    valor={dados.projectoId}
                    opcoes={estado.projectos.map((projecto) => ({
                        valor: projecto.id,
                        rotulo: projecto.nome,
                    }))}
                    aoEscolher={(valor) => definir('projectoId', valor)}
                    aoLimpar={() => definir('projectoId', null)}
                    placeholder="Escolher projecto…"
                    vazio="Nenhum projecto registado."
                    className="w-full"
                />
            </Campo>

            {emEdicao && membrosActuais > 0 && (
                <p className="anotacao normal-case border-l-2 border-graphite-32 pl-3">
                    Esta equipa tem {membrosActuais}{' '}
                    {membrosActuais === 1 ? 'membro' : 'membros'}. A lista não muda por guardar
                    aqui — muda-se na janela de membros.
                </p>
            )}
        </ModalForma>
    );
}
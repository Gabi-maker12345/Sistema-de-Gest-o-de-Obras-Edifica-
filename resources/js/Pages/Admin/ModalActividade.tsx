import { useCallback, useEffect, useMemo } from 'react';

import { Campo } from '@/Components/ui/field';
import { Input } from '@/Components/ui/input';
import { ModalForma } from '@/Components/ui/modal-forma';
import { Combo } from '@/Components/ui/combobox';
import { Calendario } from '@/Components/ui/calendario';
import { Textarea } from '@/Components/ui/textarea';
import { useSgo } from '@/Data/SgoContext';
import type { Actividade } from '@/Data/types';

import { REGRAS, novoId, useFicha } from './formulario-local';

/**
 * A ficha da actividade.
 *
 * Uma actividade é uma fase da obra: tem datas previstas e filhas, e a sua
 * percentagem de conclusão não se escreve aqui — a spec põe-a a 0% na criação e
 * diz que «actualiza automaticamente conforme as tarefas». Escrever o campo
 * seria escrever uma mentira que o Context desfaria à primeira tarefa fechada,
 * por isso a nota diz isso ao lado em vez de oferecer a caixa.
 *
 * O estado também não é campo: nasce «não iniciada» e é o Context que o move
 * conforme as tarefas. Um estado que se escreve à mão e um estado que se
 * calcula dáem dois estados verdadeiros para a mesma actividade, e o segundo
 * mente.
 *
 * O projecto é pré-preenchido e bloqueado quando a ficha se abre de dentro de
 * uma obra (spec): a actividade que se está a criar tem de ser desta, e oferecer
 * o campo seria oferecer a possibilidade de a guardar noutra.
 */
type DadosActividade = {
    id: string;
    projectoId: string | null;
    actividadePaiId: string | null;
    nome: string;
    descricao: string;
    dataInicioPrevista: string | null;
    dataFimPrevista: string | null;
};

const VAZIO: DadosActividade = {
    id: '',
    projectoId: null,
    actividadePaiId: null,
    nome: '',
    descricao: '',
    dataInicioPrevista: null,
    dataFimPrevista: null,
};

function de(actividade: Actividade): DadosActividade {
    return {
        id: actividade.id,
        projectoId: actividade.projectoId,
        actividadePaiId: actividade.actividadePaiId,
        nome: actividade.nome,
        descricao: actividade.descricao,
        dataInicioPrevista: actividade.dataInicioPrevista,
        dataFimPrevista: actividade.dataFimPrevista,
    };
}

export function ModalActividade({
    aberto,
    actividade,
    comProjecto,
    aoFechar,
}: {
    aberto: boolean;
    /** `null` é abrir uma ficha nova. */
    actividade: Actividade | null;
    /** Preenche e bloqueia o projecto: a ficha aberta de dentro de uma obra. */
    comProjecto?: string;
    aoFechar: () => void;
}) {
    const { estado, criar, actualizar } = useSgo();

    const guardar = useCallback(
        (dados: DadosActividade) => {
            const registo: Actividade = {
                id: dados.id || novoId('ac'),
                projectoId: dados.projectoId ?? '',
                actividadePaiId: dados.actividadePaiId,
                nome: dados.nome.trim(),
                descricao: dados.descricao.trim(),
                dataInicioPrevista: dados.dataInicioPrevista ?? '',
                dataFimPrevista: dados.dataFimPrevista ?? '',
                // Criar não mexe nestas quatro: a execução põe-nas, não a ficha.
                // Numa edição mantêm-se o que já lá estava.
                dataInicioReal: actividade?.dataInicioReal ?? null,
                dataFimReal: actividade?.dataFimReal ?? null,
                percentagemConclusao: actividade?.percentagemConclusao ?? 0,
                estado: actividade?.estado ?? 'nao_iniciada',
            };

            if (dados.id) {
                actualizar('actividades', dados.id, registo);
            } else {
                criar('actividades', registo);
            }
        },
        [actualizar, criar, actividade],
    );

    const ficha = useFicha<DadosActividade>({
        vazio: VAZIO,
        validar: (dados) =>
            REGRAS.juntar(
                ['projectoId', REGRAS.seleccionado(dados.projectoId, 'o projecto')],
                ['nome', REGRAS.obrigatorio(dados.nome.trim(), 'o nome')],
                [
                    'dataInicioPrevista',
                    REGRAS.obrigatorio(dados.dataInicioPrevista, 'a data de início prevista'),
                ],
                [
                    'dataFimPrevista',
                    REGRAS.obrigatorio(dados.dataFimPrevista, 'a data de fim prevista'),
                ],
                [
                    'dataFimPrevista',
                    REGRAS.datas(dados.dataInicioPrevista ?? '', dados.dataFimPrevista ?? ''),
                ],
            ),
        aoGuardar: guardar,
        aoFechar,
        mensagem: (dados) =>
            dados.id
                ? 'Actividade corrigida com sucesso'
                : 'Actividade criada com sucesso',
    });

    /**
     * Só se oferece como pai uma actividade do mesmo projecto que não seja a
     * própria ficha nem descendente dela. Sem este filtro, editar uma actividade
     * de topo deixava escolher uma das suas filhas como mãe, e a folha desenha
     * a árvore por encadeamento — o resultado era um ciclo que não acabava.
     */
    const possiveisPai = useMemo(() => {
        if (ficha.dados.projectoId === null) {
            return [];
        }

        const doProjecto = estado.actividades.filter(
            (outra) => outra.projectoId === ficha.dados.projectoId,
        );

        if (ficha.dados.id === '') {
            return doProjecto;
        }

        return doProjecto.filter(
            (outra) => !ehDescendente(outra, ficha.dados.id, estado.actividades),
        );
    }, [estado.actividades, ficha.dados.projectoId, ficha.dados.id]);

    useEffect(() => {
        if (aberto) {
            // O pré-preenchimento do projecto só existe na criação: corrigir uma
            // actividade não a muda de obra sem querer.
            ficha.preparar(actividade ? de(actividade) : { ...VAZIO, projectoId: comProjecto ?? null });
        }
    }, [aberto, actividade, comProjecto]);

    const { definir, dados, erros, sujo, pendente, guardar: submeter } = ficha;
    const comProjectoFixo = comProjecto !== undefined && comProjecto !== '';

    return (
        <ModalForma
            aberto={aberto}
            aoFechar={aoFechar}
            titulo={ficha.dados.id ? 'Editar actividade' : 'Nova actividade'}
            largura="md"
            sujo={sujo}
            pendente={pendente}
            accao={ficha.dados.id ? 'Guardar alterações' : 'Criar actividade'}
            erro={erros.projectoId}
            rodapeNota="O estado e a percentagem de conclusão não se escrevem aqui: actualizam-se conforme as tarefas."
            aoGuardar={submeter}
        >
            <Campo rotulo="Projecto" htmlFor="actividade-projecto" erro={erros.projectoId} obrigatorio>
                <Combo
                    id="actividade-projecto"
                    valor={dados.projectoId}
                    opcoes={estado.projectos.map((p) => ({ valor: p.id, rotulo: p.nome }))}
                    aoEscolher={(projectoId) => {
                        // Mudar de obra limpa o pai: a mãe escolhida era da obra
                        // anterior, e gravá-la aqui deixaria a actividade fora
                        // de baixo da própria fase.
                        definir('projectoId', projectoId);
                        definir('actividadePaiId', null);
                    }}
                    desactivado={comProjectoFixo}
                    placeholder={comProjectoFixo ? 'Esta actividade é desta obra' : 'Escolher obra…'}
                    vazio="Nenhum projecto visível."
                />
            </Campo>

            <Campo rotulo="Actividade pai" htmlFor="actividade-pai" erro={erros.actividadePaiId}>
                <Combo
                    id="actividade-pai"
                    valor={dados.actividadePaiId}
                    opcoes={possiveisPai.map((a) => ({ valor: a.id, rotulo: a.nome }))}
                    aoEscolher={(id) => definir('actividadePaiId', id)}
                    aoLimpar={() => definir('actividadePaiId', null)}
                    desactivado={dados.projectoId === null}
                    placeholderDesactivado="Escolher a obra primeiro"
                    placeholder="Nenhuma — actividade de topo"
                    vazio="Esta obra ainda não tem actividades."
                />
            </Campo>

            <Campo rotulo="Nome" htmlFor="actividade-nome" erro={erros.nome} obrigatorio>
                <Input
                    id="actividade-nome"
                    value={dados.nome}
                    onChange={(evento) => definir('nome', evento.target.value)}
                    aria-invalid={Boolean(erros.nome)}
                    placeholder="Demolições e escavação"
                    autoFocus
                />
            </Campo>

            <Campo rotulo="Descrição" htmlFor="actividade-descricao" erro={erros.descricao}>
                <Textarea
                    id="actividade-descricao"
                    value={dados.descricao}
                    onChange={(evento) => definir('descricao', evento.target.value)}
                    rows={3}
                    placeholder="O que esta fase cobre, em uma linha."
                />
            </Campo>

            <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                    rotulo="Início previsto"
                    htmlFor="actividade-inicio"
                    erro={erros.dataInicioPrevista}
                    obrigatorio
                >
                    <Calendario
                        id="actividade-inicio"
                        valor={dados.dataInicioPrevista}
                        aoEscolher={(data) => definir('dataInicioPrevista', data)}
                    />
                </Campo>

                <Campo
                    rotulo="Fim previsto"
                    htmlFor="actividade-fim"
                    erro={erros.dataFimPrevista}
                    obrigatorio
                >
                    <Calendario
                        id="actividade-fim"
                        valor={dados.dataFimPrevista}
                        aoEscolher={(data) => definir('dataFimPrevista', data)}
                    />
                </Campo>
            </div>
        </ModalForma>
    );
}

/**
 * `candidato` está algures abaixo de `ancestralId`? Percorre a cadeia de pais
 * até ao topo. Sem isto, guardar uma actividade de topo com uma das suas
 * descendentes como mãe fechava um ciclo, e a folha — que desenha a árvore por
 * encadeamento — subia e descia a mesma nota sem fim.
 */
function ehDescendente(
    candidato: Actividade,
    ancestralId: string,
    todas: Actividade[],
): boolean {
    let actual: Actividade | undefined = candidato;

    while (actual !== undefined) {
        if (actual.id === ancestralId) {
            return true;
        }

        const paiId: string | null = actual.actividadePaiId;
        actual = paiId === null ? undefined : todas.find((outra) => outra.id === paiId);
    }

    return false;
}
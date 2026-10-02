import { useCallback, useEffect, useMemo } from 'react';

import { Campo } from '@/Components/ui/field';
import { Input } from '@/Components/ui/input';
import { ModalForma } from '@/Components/ui/modal-forma';
import { Combo } from '@/Components/ui/combobox';
import { Calendario } from '@/Components/ui/calendario';
import { Textarea } from '@/Components/ui/textarea';
import {
    Seletor,
    SeletorConteudo,
    SeletorDisparador,
    SeletorGrupo,
    SeletorGrupoRotulo,
    SeletorItem,
    SeletorValor,
} from '@/Components/ui/select';
import { useSgo } from '@/Data/SgoContext';
import type { EstadoTarefa, PrioridadeTarefa, Tarefa, Utilizador } from '@/Data/types';
import { ROTULOS } from '@/lib/rotulos';

import { REGRAS, novoId, useFicha } from './formulario-local';

/**
 * A ficha da tarefa.
 *
 * Uma tarefa não vive sozinha: é sempre uma actividade dentro de um projecto,
 * e por isso o projecto vem primeiro e filtra o resto — as actividades são só
 * desse projecto, e a equipa também. É a dependência mais longa do produto e a
 * ficha escreve-a por ordem, para nunca se escolher uma actividade que não é da
 * obra.
 *
 * O projecto é o que define onde a tarefa vive, por isso grava-se. A nota da
 * spec — «só para filtrar a lista de actividades, não é campo gravado» — é
 * verdade quanto ao registo de execucao: a tarefa pertence à actividade, e o
 * projecto é o caminho até lá. Guardá-lo é o que permite a folha agregada
 * mostrar a obra de origem sem seguir o encadeamento a cada cartão.
 */
type DadosTarefa = {
    id: string;
    projectoId: string | null;
    actividadeId: string | null;
    equipaId: string | null;
    titulo: string;
    descricao: string;
    responsavelId: string | null;
    prioridade: PrioridadeTarefa;
    estado: EstadoTarefa;
    prazo: string | null;
    horasEstimadas: string;
};

const VAZIO: DadosTarefa = {
    id: '',
    projectoId: null,
    actividadeId: null,
    equipaId: null,
    titulo: '',
    descricao: '',
    responsavelId: null,
    prioridade: 'media',
    estado: 'pendente',
    prazo: null,
    horasEstimadas: '',
};

function de(tarefa: Tarefa): DadosTarefa {
    return {
        id: tarefa.id,
        projectoId: tarefa.projectoId,
        actividadeId: tarefa.actividadeId,
        equipaId: tarefa.equipaId,
        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
        responsavelId: tarefa.responsavelId,
        prioridade: tarefa.prioridade,
        estado: tarefa.estado,
        prazo: tarefa.prazo,
        horasEstimadas: tarefa.horasEstimadas === null ? '' : String(tarefa.horasEstimadas),
    };
}

export function ModalTarefa({
    aberto,
    tarefa,
    /** Projecto e prazo que vêm de fora: a agenda escreve a data do evento aqui. */
    comProjecto,
    comPrazo,
    aoFechar,
}: {
    aberto: boolean;
    /** `null` é abrir uma ficha nova. */
    tarefa: Tarefa | null;
    comProjecto?: string | null;
    comPrazo?: string | null;
    aoFechar: () => void;
}) {
    const { estado, criar, actualizar, utilizadorEfectivo } = useSgo();

    const guardar = useCallback(
        (dados: DadosTarefa) => {
            const horas = dados.horasEstimadas.trim();

            const registo: Tarefa = {
                id: dados.id || novoId('t'),
                projectoId: dados.projectoId ?? '',
                actividadeId: dados.actividadeId,
                equipaId: dados.equipaId,
                titulo: dados.titulo.trim(),
                descricao: dados.descricao.trim(),
                responsavelId: dados.responsavelId ?? '',
                prioridade: dados.prioridade,
                estado: dados.estado,
                prazo: dados.prazo ?? '',
                horasEstimadas: REGRAS.paraNumero(horas),
                // A criação não mexe nestas duas: a percentagem só anda com a
                // execução, e as horas reais registam-se depois de a tarefa
                // sair para a obra. Vêm da ficha em edição, zeradas na criação.
                horasReais: tarefa?.horasReais ?? null,
                percentagemConclusao: tarefa?.percentagemConclusao ?? 0,
            };

            if (dados.id) {
                actualizar('tarefas', dados.id, registo);
            } else {
                criar('tarefas', registo);
            }
        },
        [actualizar, criar, tarefa],
    );

    const ficha = useFicha<DadosTarefa>({
        vazio: VAZIO,
        validar: (dados) =>
            REGRAS.juntar(
                ['projectoId', REGRAS.seleccionado(dados.projectoId, 'o projecto')],
                ['actividadeId', REGRAS.seleccionado(dados.actividadeId, 'a actividade')],
                ['titulo', REGRAS.obrigatorio(dados.titulo, 'O título da tarefa')],
                ['titulo', REGRAS.minimo(dados.titulo, 3, 'O título da tarefa')],
                [
                    'responsavelId',
                    REGRAS.seleccionado(dados.responsavelId, 'o responsável'),
                ],
                ['prazo', REGRAS.obrigatorio(dados.prazo ?? '', 'O prazo')],
                [
                    'horasEstimadas',
                    REGRAS.montante(
                        dados.horasEstimadas,
                        'As horas estimadas',
                    ),
                ],
            ),
        aoGuardar: guardar,
        aoFechar,
        mensagem: (dados) =>
            dados.id ? `Tarefa corrigida: ${dados.titulo}.` : `Tarefa registada: ${dados.titulo}.`,
    });

    useEffect(() => {
        if (aberto) {
            // A agenda abre a ficha já com a data do evento escrita. O
            // pré-preenchimento só existe na criação: corrigir uma tarefa não
            // lhe muda o prazo sem querer.
            const base = tarefa
                ? de(tarefa)
                : {
                      ...VAZIO,
                      responsavelId: utilizadorEfectivo.id,
                      projectoId: comProjecto ?? null,
                      prazo: comPrazo ?? null,
                  };

            ficha.preparar(base);
        }
    }, [aberto, tarefa, comProjecto, comPrazo, utilizadorEfectivo.id]);

    const { dados, erros, definir, guardar: submeter, pendente, sujo } = ficha;
    const emEdicao = dados.id !== '';

    /**
     * As actividades e as equipas dependem do projecto escolhido. Sem projecto
     * escolhido não há opções — mostrar todas seria escrever no formulário que
     * a tarefa é de uma obra que ainda não foi dita.
     */
    const actividades = useMemo(
        () =>
            dados.projectoId === null
                ? []
                : estado.actividades.filter((a) => a.projectoId === dados.projectoId),
        [dados.projectoId, estado.actividades],
    );

    const equipas = useMemo(
        () =>
            dados.projectoId === null
                ? []
                : estado.equipas.filter((equipa) => equipa.projectoId === dados.projectoId),
        [dados.projectoId, estado.equipas],
    );

    const responsaveis = useMemo(
        () =>
            estado.utilizadores.map((utilizador: Utilizador) => ({
                valor: utilizador.id,
                rotulo: `${utilizador.nome}${utilizador.activo ? '' : ' (inactivo)'}`,
            })),
        [estado.utilizadores],
    );

    function mudarProjecto(projectoId: string | null) {
        definir('projectoId', projectoId);

        // Mudar de obra invalida a actividade e a equipa: as duas eram do
        // projecto anterior, e guardar uma actividade de outra obra seria um
        // registo que o produto não sabe mostrar.
        definir('actividadeId', null);
        definir('equipaId', null);
    }

    return (
        <ModalForma
            aberto={aberto}
            aoFechar={aoFechar}
            titulo={emEdicao ? 'Corrigir tarefa' : 'Nova tarefa'}
            descricao={
                emEdicao
                    ? 'O que muda aqui é o que se decide hoje; a execução registada continua a viver na ficha da tarefa.'
                    : 'Uma tarefa é uma actividade com prazo e responsável. Nasce pendente.'
            }
            notaCabecalho={`Tarefa · ${emEdicao ? 'correcção' : 'abertura'}`}
            largura="lg"
            sujo={sujo}
            pendente={pendente}
            accao={emEdicao ? 'Guardar correcção' : 'Registar tarefa'}
            rodapeNota="A percentagem de conclusão e as horas reais não se escrevem aqui: actualizam-se conforme a tarefa vai correndo no caderno de obra."
            aoGuardar={submeter}
        >
            <Campo
                rotulo="Projecto"
                htmlFor="tarefa-projecto"
                obrigatorio
                erro={erros.projectoId}
                ajuda="Define as actividades e a equipa que podem ser escolhidas a seguir."
            >
                <Combo
                    id="tarefa-projecto"
                    valor={dados.projectoId}
                    opcoes={estado.projectos.map((projecto) => ({
                        valor: projecto.id,
                        rotulo: projecto.nome,
                    }))}
                    aoEscolher={mudarProjecto}
                    aoLimpar={() => mudarProjecto(null)}
                    placeholder="Escolher projecto…"
                    vazio="Nenhum projecto registado ainda."
                    className="w-full"
                />
            </Campo>

            <Campo
                rotulo="Actividade"
                htmlFor="tarefa-actividade"
                obrigatorio
                erro={erros.actividadeId}
                ajuda={
                    dados.projectoId === null
                        ? 'Escolha primeiro o projecto.'
                        : actividades.length === 0
                          ? 'Este projecto ainda não tem actividades com tarefa.'
                          : undefined
                }
            >
                <Combo
                    id="tarefa-actividade"
                    valor={dados.actividadeId}
                    opcoes={actividades.map((actividade) => ({
                        valor: actividade.id,
                        rotulo: actividade.nome,
                    }))}
                    aoEscolher={(valor) => definir('actividadeId', valor)}
                    aoLimpar={() => definir('actividadeId', null)}
                    placeholder={
                        dados.projectoId === null
                            ? 'Escolher projecto primeiro'
                            : 'Escolher actividade…'
                    }
                    vazio="Nenhuma actividade neste projecto."
                    desactivado={dados.projectoId === null}
                    className="w-full"
                />
            </Campo>

            <Campo rotulo="Título" htmlFor="tarefa-titulo" obrigatorio erro={erros.titulo}>
                <Input
                    id="tarefa-titulo"
                    value={dados.titulo}
                    onChange={(evento) => definir('titulo', evento.target.value)}
                    aria-invalid={Boolean(erros.titulo)}
                    placeholder="Conferir armadura da laje do piso 1"
                    autoFocus
                />
            </Campo>

            <Campo
                rotulo="Descrição"
                htmlFor="tarefa-descricao"
                ajuda="Uma linha. Aparece no cartão da tarefa e no caderno de obra."
            >
                <Textarea
                    id="tarefa-descricao"
                    value={dados.descricao}
                    onChange={(evento) => definir('descricao', evento.target.value)}
                    rows={3}
                    placeholder="O que tem de estar feito, e o que prova que ficou feito."
                />
            </Campo>

            <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                    rotulo="Responsável"
                    htmlFor="tarefa-responsavel"
                    obrigatorio
                    erro={erros.responsavelId}
                >
                    <Combo
                        id="tarefa-responsavel"
                        valor={dados.responsavelId}
                        opcoes={responsaveis}
                        aoEscolher={(valor) => definir('responsavelId', valor)}
                        aoLimpar={() => definir('responsavelId', null)}
                        placeholder="Escolher responsável…"
                        vazio="Ninguém registado ainda."
                        className="w-full"
                    />
                </Campo>

                <Campo rotulo="Prioridade" htmlFor="tarefa-prioridade">
                    <Seletor
                        value={dados.prioridade}
                        onValueChange={(valor) =>
                            definir('prioridade', valor as PrioridadeTarefa)
                        }
                    >
                        <SeletorDisparador id="tarefa-prioridade" aria-label="Prioridade da tarefa">
                            <SeletorValor />
                        </SeletorDisparador>
                        <SeletorConteudo>
                            <SeletorGrupo>
                                <SeletorGrupoRotulo>Prioridade</SeletorGrupoRotulo>
                                {(
                                    Object.entries(ROTULOS.prioridade) as Array<
                                        [PrioridadeTarefa, string]
                                    >
                                ).map(([chave, rotulo]) => (
                                    <SeletorItem key={chave} value={chave}>
                                        {rotulo}
                                    </SeletorItem>
                                ))}
                            </SeletorGrupo>
                        </SeletorConteudo>
                    </Seletor>
                </Campo>

                <Campo rotulo="Prazo" htmlFor="tarefa-prazo" obrigatorio erro={erros.prazo}>
                    <Calendario
                        id="tarefa-prazo"
                        valor={dados.prazo}
                        aoEscolher={(iso) => definir('prazo', iso)}
                        vazio="Escolher prazo"
                        className="w-full"
                    />
                </Campo>

                <Campo
                    rotulo="Horas estimadas"
                    htmlFor="tarefa-horas"
                    erro={erros.horasEstimadas}
                    ajuda="Opcional. Decimal, com vírgula."
                >
                    <Input
                        id="tarefa-horas"
                        value={dados.horasEstimadas}
                        onChange={(evento) => definir('horasEstimadas', evento.target.value)}
                        aria-invalid={Boolean(erros.horasEstimadas)}
                        inputMode="decimal"
                        placeholder="6"
                    />
                </Campo>
            </div>

            <Campo
                rotulo="Equipa"
                htmlFor="tarefa-equipa"
                ajuda={
                    dados.projectoId === null
                        ? 'Escolha primeiro o projecto.'
                        : 'Opcional. Só as equipas deste projecto.'
                }
            >
                <Combo
                    id="tarefa-equipa"
                    valor={dados.equipaId}
                    opcoes={equipas.map((equipa) => ({
                        valor: equipa.id,
                        rotulo: equipa.nome,
                    }))}
                    aoEscolher={(valor) => definir('equipaId', valor)}
                    aoLimpar={() => definir('equipaId', null)}
                    placeholder={
                        dados.projectoId === null ? 'Escolher projecto primeiro' : 'Sem equipa'
                    }
                    vazio="Este projecto ainda não tem equipas."
                    desactivado={dados.projectoId === null}
                    className="w-full"
                />
            </Campo>

            {emEdicao && (
                <Campo
                    rotulo="Estado"
                    htmlFor="tarefa-estado"
                    ajuda="Mover para Atrasada escreve a data de hoje como prazo vencido."
                >
                    <Seletor
                        value={dados.estado}
                        onValueChange={(valor) => definir('estado', valor as EstadoTarefa)}
                    >
                        <SeletorDisparador id="tarefa-estado" aria-label="Estado da tarefa">
                            <SeletorValor />
                        </SeletorDisparador>
                        <SeletorConteudo>
                            <SeletorGrupo>
                                <SeletorGrupoRotulo>Estado</SeletorGrupoRotulo>
                                {(
                                    Object.entries(ROTULOS.estadoTarefa) as Array<
                                        [EstadoTarefa, string]
                                    >
                                ).map(([chave, rotulo]) => (
                                    <SeletorItem key={chave} value={chave}>
                                        {rotulo}
                                    </SeletorItem>
                                ))}
                            </SeletorGrupo>
                        </SeletorConteudo>
                    </Seletor>
                </Campo>
            )}
        </ModalForma>
    );
}
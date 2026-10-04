import { useCallback, useEffect, useMemo } from 'react';

import { Campo } from '@/Components/ui/field';
import { Input } from '@/Components/ui/input';
import { ModalForma } from '@/Components/ui/modal-forma';
import { Combo } from '@/Components/ui/combobox';
import { Calendario } from '@/Components/ui/calendario';
import { Textarea } from '@/Components/ui/textarea';
import { useSgo } from '@/Data/SgoContext';
import type { Fotografia } from '@/Data/types';

import { REGRAS, novoId, useFicha } from './formulario-local';

/**
 * A ficha da fotografia.
 *
 * A fotografia é o único registo da fase 5 que pode pertencer a três coisas ao
 * mesmo tempo — obra, dia do diário e tarefa. A spec pede a galeria «por projecto,
 * diário ou tarefa», e o campo que decide onde ela aparece é o que se escolhe,
 * não o que se deduz.
 *
 * O ficheiro fica com o que o utilizador escreve. Não há upload a simular: a
 * galeria já sabe desenhar uma fotografia sem imagem — é a hachura — e inventar
 * um endereço seria um caminho que não abre. A marca «pendente» nasce
 * `true` pelo mesmo motivo do diário: o que vem do terreno é que é pendente.
 */
type DadosFotografia = {
    id: string;
    projectoId: string | null;
    diarioId: string | null;
    tarefaId: string | null;
    url: string;
    descricao: string;
    dataCaptura: string | null;
    localizacao: string;
};

const VAZIO: DadosFotografia = {
    id: '',
    projectoId: null,
    diarioId: null,
    tarefaId: null,
    url: '',
    descricao: '',
    dataCaptura: null,
    localizacao: '',
};

function de(fotografia: Fotografia): DadosFotografia {
    return {
        id: fotografia.id,
        projectoId: fotografia.projectoId,
        diarioId: fotografia.diarioId,
        tarefaId: fotografia.tarefaId,
        url: fotografia.url,
        descricao: fotografia.descricao,
        dataCaptura: fotografia.dataCaptura,
        localizacao: fotografia.localizacao,
    };
}

export function ModalFotografia({
    aberto,
    fotografia,
    comProjecto,
    aoFechar,
}: {
    aberto: boolean;
    /** `null` é abrir uma ficha nova. */
    fotografia: Fotografia | null;
    comProjecto?: string | null;
    aoFechar: () => void;
}) {
    const { estado, criar, actualizar, utilizadorEfectivo } = useSgo();

    const guardar = useCallback(
        (dados: DadosFotografia) => {
            const registo: Fotografia = {
                id: dados.id || novoId('fot'),
                projectoId: dados.projectoId ?? '',
                diarioId: dados.diarioId,
                tarefaId: dados.tarefaId,
                url: dados.url.trim(),
                descricao: dados.descricao.trim(),
                dataCaptura: dados.dataCaptura ?? '',
                localizacao: dados.localizacao.trim(),
                tiradaPor: fotografia?.tiradaPor ?? utilizadorEfectivo.id,
                sincronizado: fotografia?.sincronizado ?? true,
            };

            if (dados.id) {
                actualizar('fotografias', dados.id, registo);
            } else {
                criar('fotografias', registo);
            }
        },
        [actualizar, criar, fotografia, utilizadorEfectivo.id],
    );

    const ficha = useFicha<DadosFotografia>({
        vazio: VAZIO,
        validar: (dados) =>
            REGRAS.juntar(
                ['projectoId', REGRAS.seleccionado(dados.projectoId, 'o projecto')],
                ['dataCaptura', REGRAS.obrigatorio(dados.dataCaptura, 'a data de captura')],
            ),
        aoGuardar: guardar,
        aoFechar,
        mensagem: (dados) =>
            dados.id ? 'Fotografia corrigida com sucesso' : 'Fotografia adicionada com sucesso',
    });

    useEffect(() => {
        if (aberto) {
            ficha.preparar(
                fotografia
                    ? de(fotografia)
                    : { ...VAZIO, projectoId: comProjecto ?? null, dataCaptura: hoje() },
            );
        }
    }, [aberto, fotografia, comProjecto]);

    /** O diário e a tarefa são os desta obra, e só existem depois de a escolher. */
    const doProjecto = useMemo(
        () =>
            ficha.dados.projectoId === null
                ? { diarios: [], tarefas: [] }
                : {
                      diarios: estado.diarios.filter(
                          (d) => d.projectoId === ficha.dados.projectoId,
                      ),
                      tarefas: estado.tarefas.filter(
                          (t) => t.projectoId === ficha.dados.projectoId,
                      ),
                  },
        [estado.diarios, estado.tarefas, ficha.dados.projectoId],
    );

    const { definir, dados, erros, sujo, pendente, guardar: submeter } = ficha;
    const comProjectoFixo = comProjecto !== undefined && comProjecto !== '';

    return (
        <ModalForma
            aberto={aberto}
            aoFechar={aoFechar}
            titulo={ficha.dados.id ? 'Editar fotografia' : 'Nova fotografia'}
            largura="md"
            sujo={sujo}
            pendente={pendente}
            accao={ficha.dados.id ? 'Guardar alterações' : 'Adicionar fotografia'}
            erro={erros.projectoId}
            rodapeNota="Sem endereço de ficheiro, a galeria desenha a marca de espera em vez de uma imagem quebrada."
            aoGuardar={submeter}
        >
            <Campo rotulo="Projecto" htmlFor="foto-projecto" erro={erros.projectoId} obrigatorio>
                <Combo
                    id="foto-projecto"
                    valor={dados.projectoId}
                    opcoes={estado.projectos.map((p) => ({ valor: p.id, rotulo: p.nome }))}
                    aoEscolher={(projectoId) => {
                        // Diário e tarefa eram da obra anterior.
                        definir('projectoId', projectoId);
                        definir('diarioId', null);
                        definir('tarefaId', null);
                    }}
                    desactivado={comProjectoFixo}
                    placeholder={comProjectoFixo ? 'Esta fotografia é desta obra' : 'Escolher obra…'}
                    vazio="Nenhum projecto visível."
                />
            </Campo>

            <div className="grid gap-4 sm:grid-cols-2">
                <Campo rotulo="Diário de obra" htmlFor="foto-diario" erro={erros.diarioId}>
                    <Combo
                        id="foto-diario"
                        valor={dados.diarioId}
                        opcoes={doProjecto.diarios.map((d) => ({
                            valor: d.id,
                            rotulo: formatar(d.data),
                        }))}
                        aoEscolher={(id) => definir('diarioId', id)}
                        aoLimpar={() => definir('diarioId', null)}
                        desactivado={dados.projectoId === null}
                        placeholderDesactivado="Escolher a obra primeiro"
                        placeholder="Nenhum — sem dia"
                        vazio="Esta obra ainda não tem diário."
                    />
                </Campo>

                <Campo rotulo="Tarefa" htmlFor="foto-tarefa" erro={erros.tarefaId}>
                    <Combo
                        id="foto-tarefa"
                        valor={dados.tarefaId}
                        opcoes={doProjecto.tarefas.map((t) => ({ valor: t.id, rotulo: t.titulo }))}
                        aoEscolher={(id) => definir('tarefaId', id)}
                        aoLimpar={() => definir('tarefaId', null)}
                        desactivado={dados.projectoId === null}
                        placeholderDesactivado="Escolher a obra primeiro"
                        placeholder="Nenhuma — sem tarefa"
                        vazio="Esta obra ainda não tem tarefas."
                    />
                </Campo>
            </div>

            <Campo
                rotulo="Descrição"
                htmlFor="foto-descricao"
                ajuda="O que a fotografia prova. É isto que fica quando a imagem não abre."
                erro={erros.descricao}
            >
                <Textarea
                    id="foto-descricao"
                    value={dados.descricao}
                    onChange={(evento) => definir('descricao', evento.target.value)}
                    rows={3}
                    placeholder="Armadura montada antes do betão, piso 1."
                />
            </Campo>

            <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                    rotulo="Data de captura"
                    htmlFor="foto-data"
                    erro={erros.dataCaptura}
                    obrigatorio
                >
                    <Calendario
                        id="foto-data"
                        valor={dados.dataCaptura}
                        aoEscolher={(data) => definir('dataCaptura', data)}
                    />
                </Campo>

                <Campo rotulo="Localização" htmlFor="foto-local" erro={erros.localizacao}>
                    <Input
                        id="foto-local"
                        value={dados.localizacao}
                        onChange={(evento) => definir('localizacao', evento.target.value)}
                        placeholder="Piso 1, zona leste"
                    />
                </Campo>
            </div>

            <Campo
                rotulo="Ficheiro"
                htmlFor="foto-url"
                ajuda="Endereço da imagem. Vazio fica a marca de espera."
                erro={erros.url}
            >
                <Input
                    id="foto-url"
                    value={dados.url}
                    onChange={(evento) => definir('url', evento.target.value)}
                    placeholder="armadura-piso1.jpg"
                />
            </Campo>
        </ModalForma>
    );
}

function hoje(): string {
    return new Date().toISOString().slice(0, 10);
}

/** `2026-03-04` escrito como `04/03/2026», que é como o diário se lê no registo. */
function formatar(iso: string): string {
    const partes = iso.split('-');
    if (partes.length !== 3) {
        return iso;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}
import { useCallback, useEffect, useMemo } from 'react';

import { Campo } from '@/Components/ui/field';
import { Input } from '@/Components/ui/input';
import { ModalForma } from '@/Components/ui/modal-forma';
import { Combo } from '@/Components/ui/combobox';
import { Textarea } from '@/Components/ui/textarea';
import { Selo } from '@/Components/ui/badge';
import { CampoDataHora } from '@/Components/ui/campo-data-hora';
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
import type { EventoAgenda, Tarefa, TipoEvento } from '@/Data/types';
import { ROTULOS } from '@/lib/rotulos';
import { dataHora } from '@/lib/format';

import { REGRAS, novoId, useFicha } from './formulario-local';

/**
 * A ficha do evento de agenda.
 *
 * O evento é a coisa mais simples que há — um título, um intervalo e um sítio —
 * e por isso a ficha é curta. O que não é simples são as três ligações: o
 * projecto é opcional, a tarefa depende do projecto, e o tipo pinta o selo na
 * própria ficha enquanto se escolhe. Um evento sem obra é uma reunião de
 * gabinete, e isso tem de ser escrevível sem escolher um projecto primeiro.
 *
 * A pré-visualização do selo existe porque o tipo é a única coisa aqui que se
 * lê por cor: escolher «Obra» sem ver o selo trocar só se descobre a fechar a
 * janela.
 */

/** O lembrete é um select fechado (spec §257): as opções que há não as que se inventam. */
const LEMBRETES: Array<{ valor: number | null; rotulo: string }> = [
    { valor: null, rotulo: 'Sem lembrete' },
    { valor: 15, rotulo: '15 minutos antes' },
    { valor: 30, rotulo: '30 minutos antes' },
    { valor: 60, rotulo: '1 hora antes' },
    { valor: 1440, rotulo: '1 dia antes' },
];

type DadosEvento = {
    id: string;
    titulo: string;
    descricao: string;
    tipo: TipoEvento;
    dataHoraInicio: string | null;
    dataHoraFim: string | null;
    local: string;
    lembreteMinutosAntes: number | null;
    projectoId: string | null;
    tarefaId: string | null;
};

const VAZIO: DadosEvento = {
    id: '',
    titulo: '',
    descricao: '',
    tipo: 'pessoal',
    dataHoraInicio: null,
    dataHoraFim: null,
    local: '',
    lembreteMinutosAntes: null,
    projectoId: null,
    tarefaId: null,
};

function de(evento: EventoAgenda): DadosEvento {
    return {
        id: evento.id,
        titulo: evento.titulo,
        descricao: evento.descricao,
        tipo: evento.tipo,
        dataHoraInicio: evento.dataHoraInicio,
        dataHoraFim: evento.dataHoraFim,
        local: evento.local,
        lembreteMinutosAntes: evento.lembreteMinutosAntes,
        projectoId: evento.projectoId,
        tarefaId: evento.tarefaId,
    };
}

/** A tinta do selo por tipo: obra é carimbo (é a identidade), as outras são neutras. */
function tintaDoTipo(tipo: TipoEvento): 'carimbo' | 'grafite' | 'ambar' {
    if (tipo === 'obra') {
        return 'carimbo';
    }

    return tipo === 'profissional' ? 'grafite' : 'ambar';
}

export function ModalEvento({
    aberto,
    evento,
    aoFechar,
}: {
    aberto: boolean;
    /** `null` é abrir uma ficha nova. */
    evento: EventoAgenda | null;
    aoFechar: () => void;
}) {
    const { estado, criar, actualizar, utilizadorEfectivo } = useSgo();

    const guardar = useCallback(
        (dados: DadosEvento) => {
            const registo: EventoAgenda = {
                id: dados.id || novoId('ev'),
                // O evento é sempre de alguém: quem o escreve é quem o tem.
                utilizadorId: evento?.utilizadorId ?? utilizadorEfectivo.id,
                projectoId: dados.projectoId,
                tarefaId: dados.tarefaId,
                titulo: dados.titulo.trim(),
                descricao: dados.descricao.trim(),
                tipo: dados.tipo,
                dataHoraInicio: dados.dataHoraInicio ?? '',
                dataHoraFim: dados.dataHoraFim,
                local: dados.local.trim(),
                lembreteMinutosAntes: dados.lembreteMinutosAntes,
            };

            if (dados.id) {
                actualizar('eventos', dados.id, registo);
            } else {
                criar('eventos', registo);
            }
        },
        [actualizar, criar, evento, utilizadorEfectivo.id],
    );

    const ficha = useFicha<DadosEvento>({
        vazio: VAZIO,
        validar: (dados) =>
            REGRAS.juntar(
                ['titulo', REGRAS.obrigatorio(dados.titulo, 'O título do evento')],
                ['titulo', REGRAS.minimo(dados.titulo, 3, 'O título do evento')],
                [
                    'dataHoraInicio',
                    REGRAS.obrigatorio(dados.dataHoraInicio ?? '', 'O início'),
                ],
                [
                    'dataHoraFim',
                    REGRAS.datas(
                        dados.dataHoraInicio ?? '',
                        (dados.dataHoraFim ?? '').slice(0, 16),
                    ),
                ],
            ),
        aoGuardar: guardar,
        aoFechar,
        mensagem: (dados) =>
            dados.id ? `Evento corrigido: ${dados.titulo}.` : `Evento registado: ${dados.titulo}.`,
    });

    useEffect(() => {
        if (aberto) {
            ficha.preparar(evento ? de(evento) : undefined);
        }
    }, [aberto, evento]);

    const { dados, erros, definir, guardar: submeter, pendente, sujo } = ficha;
    const emEdicao = dados.id !== '';

    /**
     * As tarefas são as do projecto escolhido (spec §257). Sem projecto não há
     * tarefas: ligar o evento a uma tarefa de outra obra escreveria no registo
     * errado, e o filtro é o que impede isso.
     */
    const tarefas = useMemo(
        () =>
            dados.projectoId === null
                ? []
                : estado.tarefas.filter((tarefa: Tarefa) => tarefa.projectoId === dados.projectoId),
        [dados.projectoId, estado.tarefas],
    );

    function mudarProjecto(projectoId: string | null) {
        definir('projectoId', projectoId);
        definir('tarefaId', null);
    }

    return (
        <ModalForma
            aberto={aberto}
            aoFechar={aoFechar}
            titulo={emEdicao ? 'Corrigir evento' : 'Novo evento'}
            descricao={
                emEdicao
                    ? 'Mudar o intervalo de um evento move-o na agenda; o tipo só troca o selo.'
                    : 'Um evento sem projecto é um compromisso pessoal; com projecto, é obra.'
            }
            notaCabecalho={`Agenda · ${emEdicao ? 'correcção' : 'abertura'}`}
            largura="lg"
            sujo={sujo}
            pendente={pendente}
            accao={emEdicao ? 'Guardar correcção' : 'Registar evento'}
            aoGuardar={submeter}
        >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-graphite-12 pb-3">
                <p className="cota">Pré-visualização do selo</p>
                <Selo tinta={tintaDoTipo(dados.tipo)}>{ROTULOS.tipoEvento[dados.tipo]}</Selo>
            </div>

            <Campo rotulo="Título" htmlFor="evento-titulo" obrigatorio erro={erros.titulo}>
                <Input
                    id="evento-titulo"
                    value={dados.titulo}
                    onChange={(evento) => definir('titulo', evento.target.value)}
                    aria-invalid={Boolean(erros.titulo)}
                    placeholder="Medição de obras com o fiscal do cliente"
                    autoFocus
                />
            </Campo>

            <Campo rotulo="Tipo" htmlFor="evento-tipo">
                <Seletor
                    value={dados.tipo}
                    onValueChange={(valor) => definir('tipo', valor as TipoEvento)}
                >
                    <SeletorDisparador id="evento-tipo" aria-label="Tipo de evento">
                        <SeletorValor />
                    </SeletorDisparador>
                    <SeletorConteudo>
                        <SeletorGrupo>
                            <SeletorGrupoRotulo>Tipo</SeletorGrupoRotulo>
                            {(
                                Object.entries(ROTULOS.tipoEvento) as Array<
                                    [TipoEvento, string]
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

            <CampoDataHora
                id="evento-inicio"
                rotulo="Início"
                obrigatorio
                erro={erros.dataHoraInicio}
                ajuda="Quando começa."
                valor={dados.dataHoraInicio}
                aoMudar={(iso) => definir('dataHoraInicio', iso)}
            />

            <CampoDataHora
                id="evento-fim"
                rotulo="Fim"
                erro={erros.dataHoraFim}
                ajuda="Opcional. Não pode ser antes do início."
                valor={dados.dataHoraFim}
                aoMudar={(iso) => definir('dataHoraFim', iso)}
            />

            <Campo
                rotulo="Local"
                htmlFor="evento-local"
                ajuda="Opcional. Onde é."
            >
                <Input
                    id="evento-local"
                    value={dados.local}
                    onChange={(evento) => definir('local', evento.target.value)}
                    placeholder="Obra do Edifício Sede"
                />
            </Campo>

            <Campo
                rotulo="Descrição"
                htmlFor="evento-descricao"
                ajuda="Opcional. Uma linha. Aparece na lista e no cartão do dia."
            >
                <Textarea
                    id="evento-descricao"
                    value={dados.descricao}
                    onChange={(evento) => definir('descricao', evento.target.value)}
                    rows={3}
                    placeholder="O que se vem resolver, e o que tem de ficar escrito quando se sair."
                />
            </Campo>

            <Campo
                rotulo="Lembrete"
                htmlFor="evento-lembrete"
                ajuda="O que a agenda avisa antes de o evento começar."
            >
                <Seletor
                    value={dados.lembreteMinutosAntes === null ? 'nenhum' : String(dados.lembreteMinutosAntes)}
                    onValueChange={(valor) =>
                        definir(
                            'lembreteMinutosAntes',
                            valor === 'nenhum' ? null : Number(valor),
                        )
                    }
                >
                    <SeletorDisparador id="evento-lembrete" aria-label="Lembrete">
                        <SeletorValor />
                    </SeletorDisparador>
                    <SeletorConteudo>
                        <SeletorGrupo>
                            <SeletorGrupoRotulo>Lembrete</SeletorGrupoRotulo>
                            {LEMBRETES.map((lembrete) => (
                                <SeletorItem
                                    key={String(lembrete.valor)}
                                    value={lembrete.valor === null ? 'nenhum' : String(lembrete.valor)}
                                >
                                    {lembrete.rotulo}
                                </SeletorItem>
                            ))}
                        </SeletorGrupo>
                    </SeletorConteudo>
                </Seletor>
            </Campo>

            <Campo
                rotulo="Projecto"
                htmlFor="evento-projecto"
                ajuda="Opcional. Ao escolher, o evento mostra o selo da obra na agenda."
            >
                <Combo
                    id="evento-projecto"
                    valor={dados.projectoId}
                    opcoes={estado.projectos.map((projecto) => ({
                        valor: projecto.id,
                        rotulo: projecto.nome,
                    }))}
                    aoEscolher={mudarProjecto}
                    aoLimpar={() => mudarProjecto(null)}
                    placeholder="Sem projecto"
                    vazio="Nenhum projecto registado ainda."
                    className="w-full"
                />
            </Campo>

            <Campo
                rotulo="Tarefa"
                htmlFor="evento-tarefa"
                ajuda={
                    dados.projectoId === null
                        ? 'Escolha um projecto para poder ligar uma tarefa.'
                        : 'Opcional. Só as tarefas deste projecto.'
                }
                erro={erros.tarefaId}
            >
                <Combo
                    id="evento-tarefa"
                    valor={dados.tarefaId}
                    opcoes={tarefas.map((tarefa) => ({
                        valor: tarefa.id,
                        rotulo: tarefa.titulo,
                    }))}
                    aoEscolher={(valor) => definir('tarefaId', valor)}
                    aoLimpar={() => definir('tarefaId', null)}
                    placeholder={dados.projectoId === null ? 'Sem projecto' : 'Sem tarefa'}
                    vazio="Este projecto ainda não tem tarefas."
                    desactivado={dados.projectoId === null}
                    className="w-full"
                />
            </Campo>

            {dados.dataHoraInicio && (
                <p className="anotacao normal-case">
                    Fica marcado para{' '}
                    <span className="font-mono text-graphite">{dataHora(dados.dataHoraInicio)}</span>
                    {dados.dataHoraFim && (
                        <>
                            {' '}
                            até{' '}
                            <span className="font-mono text-graphite">{dataHora(dados.dataHoraFim)}</span>
                        </>
                    )}
                    .
                </p>
            )}
        </ModalForma>
    );
}
import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { Calendario } from '@/Components/ui/calendario';
import { Combo } from '@/Components/ui/combobox';
import { Campo, CampoDerivado } from '@/Components/ui/field';
import { Input } from '@/Components/ui/input';
import { ModalForma } from '@/Components/ui/modal-forma';
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
import type { Area, EstadoProjecto, Projecto, Utilizador } from '@/Data/types';
import { ROTULOS } from '@/lib/rotulos';
import { dataIso } from '@/lib/format';

import { REGRAS, novoId, useFicha } from './formulario-local';
import type { Erros } from './formulario-local';

/**
 * A ficha do projecto: a janela que abre a folha de projectos e a que se abre
 * do detalhe, no mesmo sítio e com as mesmas regras.
 *
 * Quatro secções internas — Geral, Datas, Financeiro, Estado — porque este é o
 * único registo do produto cujos campos nunca se leem todos juntos. O eixo
 * (área e gestor) lê-se com a identificação; a janela lê-se com o estado; o
 * dinheiro lê-se sozinho.
 *
 * Três coisas deliberadamente **ausentes**, por contrato: o fim real na criação
 * (a obra ainda não terminou), o orçamento actual na criação (as despesas vão
 * escrevê-lo) e as três execuções/encerramento, que só existem depois de haver
 * Actividades e Despesas e vivem no detalhe. O que o modal promete não é o que a
 * obra ainda não tem.
 */
type DadosProjecto = {
    id: string;
    nome: string;
    cliente: string;
    morada: string;
    areaId: string | null;
    gestorId: string | null;
    dataInicio: string;
    dataFimPrevista: string;
    dataFimReal: string;
    valorContratual: string;
    orcamentoPrevisto: string;
    orcamentoActual: string;
    estadoGeral: EstadoProjecto;
};

const VAZIO: DadosProjecto = {
    id: '',
    nome: '',
    cliente: '',
    morada: '',
    areaId: null,
    gestorId: null,
    dataInicio: dataIso(new Date()),
    dataFimPrevista: '',
    dataFimReal: '',
    valorContratual: '',
    orcamentoPrevisto: '',
    orcamentoActual: '',
    estadoGeral: 'planeamento',
};

function de(projecto: Projecto): DadosProjecto {
    return {
        id: projecto.id,
        nome: projecto.nome,
        cliente: projecto.cliente,
        morada: projecto.morada,
        areaId: projecto.areaId,
        gestorId: projecto.gestorId,
        dataInicio: projecto.dataInicio,
        dataFimPrevista: projecto.dataFimPrevista,
        dataFimReal: projecto.dataFimReal ?? '',
        valorContratual: String(projecto.valorContratual),
        orcamentoPrevisto:
            projecto.orcamentoPrevisto === null ? '' : String(projecto.orcamentoPrevisto),
        orcamentoActual:
            projecto.orcamentoActual === null ? '' : String(projecto.orcamentoActual),
        estadoGeral: projecto.estadoGeral,
    };
}

function validar(dados: DadosProjecto): Erros {
    const contratual = REGRAS.paraNumero(dados.valorContratual);

    return REGRAS.juntar(
        ['nome', REGRAS.obrigatorio(dados.nome, 'O nome')],
        ['dataInicio', REGRAS.obrigatorio(dados.dataInicio, 'A data de início')],
        ['dataFimPrevista', REGRAS.obrigatorio(dados.dataFimPrevista, 'O fim previsto')],
        ['dataFimPrevista', REGRAS.datas(dados.dataInicio, dados.dataFimPrevista)],
        [
            'dataFimReal',
            !dados.dataFimReal || !dados.dataFimPrevista
                ? null
                : dados.dataFimReal < dados.dataFimPrevista
                  ? 'O fim real não pode ser anterior ao fim previsto.'
                  : null,
        ],
        ['valorContratual', REGRAS.obrigatorio(dados.valorContratual, 'O valor contratual')],
        ['valorContratual', REGRAS.montante(dados.valorContratual, 'O valor contratual')],
        [
            'valorContratual',
            contratual !== null && contratual <= 0
                ? 'O valor contratual tem de ser maior que zero: é o denominador da execução financeira.'
                : null,
        ],
        ['orcamentoPrevisto', REGRAS.montante(dados.orcamentoPrevisto, 'O orçamento previsto')],
        ['orcamentoActual', REGRAS.montante(dados.orcamentoActual, 'O orçamento actual')],
    );
}

export function ModalProjecto({
    aberto,
    projecto,
    aoFechar,
}: {
    aberto: boolean;
    /** `null` é abrir uma ficha nova: o que a folha cria. */
    projecto: Projecto | null;
    aoFechar: () => void;
}) {
    const { estado, criar, actualizar } = useSgo();

    /** A explicação dos três valores é um painel, não um estado da ficha. */
    const [explicarContratual, definirExplicarContratual] = useState(false);

    const guardar = useCallback(
        (dados: DadosProjecto) => {
            const registo: Projecto = {
                id: dados.id || novoId('p'),
                nome: dados.nome.trim(),
                cliente: dados.cliente.trim(),
                morada: dados.morada.trim(),
                areaId: dados.areaId,
                gestorId: dados.gestorId,
                dataInicio: dados.dataInicio,
                dataFimPrevista: dados.dataFimPrevista,
                dataFimReal: dados.dataFimReal || null,
                orcamentoPrevisto: REGRAS.paraNumero(dados.orcamentoPrevisto),
                orcamentoActual: REGRAS.paraNumero(dados.orcamentoActual),
                valorContratual: REGRAS.paraNumero(dados.valorContratual) ?? 0,
                estadoGeral: dados.estadoGeral,
                // Não é campo deste modal (spec §296): na correcção preserva-se o
                // que já estava, e na criação nasce por fechar.
                encerramentoAdministrativo: projecto?.encerramentoAdministrativo ?? false,
            };

            if (dados.id) {
                actualizar('projectos', dados.id, registo);
            } else {
                criar('projectos', registo);
            }
        },
        [actualizar, criar, projecto?.encerramentoAdministrativo],
    );

    const ficha = useFicha<DadosProjecto>({
        vazio: VAZIO,
        validar,
        aoGuardar: guardar,
        aoFechar,
        mensagem: (dados) =>
            dados.id
                ? `Projecto actualizado: ${dados.nome}.`
                : `Projecto registado: ${dados.nome}.`,
    });

    // Abrir a ficha carrega o registo; fechar não descarrega nada, porque quem
    // reabre carrega de novo. Mudar de registo com a janela aberta é o mesmo
    // gesto que a abrir outra vez, e por isso repete a carga.
    useEffect(() => {
        if (aberto) {
            ficha.preparar(projecto ? de(projecto) : undefined);
            definirExplicarContratual(false);
        }
    }, [aberto, projecto]);

    const { dados, erros, definir, guardar: submeter, pendente, sujo } = ficha;
    const emEdicao = dados.id !== '';

    return (
        <ModalForma
            aberto={aberto}
            aoFechar={aoFechar}
            titulo={emEdicao ? 'Corrigir projecto' : 'Novo projecto'}
            descricao={
                emEdicao
                    ? 'O que mudar aqui escreve-se no registo e lê-se no espelho de datas.'
                    : 'A obra entra já no espelho de datas, com a janela de início a fim previsto.'
            }
            notaCabecalho={`Projecto · ${emEdicao ? 'correcção' : 'abertura'}`}
            largura="lg"
            sujo={sujo}
            pendente={pendente}
            accao={emEdicao ? 'Guardar correcção' : 'Registar projecto'}
            rodapeNota="Pode gerir acessos de utilizadores, actividades e restantes dados depois de criar o projecto."
            aoGuardar={submeter}
        >
            <Secao titulo="Geral">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Campo
                        className="sm:col-span-2"
                        rotulo="Nome do projecto"
                        htmlFor="projecto-nome"
                        obrigatorio
                        erro={erros.nome}
                    >
                        <Input
                            id="projecto-nome"
                            value={dados.nome}
                            onChange={(evento) => definir('nome', evento.target.value)}
                            aria-invalid={Boolean(erros.nome)}
                            placeholder="Reabilitação do Edifício Sede"
                            autoFocus
                        />
                    </Campo>

                    <Campo rotulo="Cliente" htmlFor="projecto-cliente">
                        <Input
                            id="projecto-cliente"
                            value={dados.cliente}
                            onChange={(evento) => definir('cliente', evento.target.value)}
                            placeholder="Grupo Zambeze, Lda."
                        />
                    </Campo>

                    <Campo rotulo="Morada da obra" htmlFor="projecto-morada">
                        <Input
                            id="projecto-morada"
                            value={dados.morada}
                            onChange={(evento) => definir('morada', evento.target.value)}
                            placeholder="Rua Amílcar Cabral, 214, Luanda"
                        />
                    </Campo>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Campo
                        rotulo="Área"
                        htmlFor="projecto-area"
                        ajuda="A área é a especialidade da obra, não o local."
                    >
                        <Combo
                            id="projecto-area"
                            valor={dados.areaId}
                            aoEscolher={(valor) => definir('areaId', valor)}
                            aoLimpar={() => definir('areaId', null)}
                            placeholder="Escolher área…"
                            opcoes={estado.areas.map((area: Area) => ({
                                valor: area.id,
                                rotulo: area.nome,
                            }))}
                        />
                    </Campo>

                    <Campo rotulo="Gestor" htmlFor="projecto-gestor">
                        <Combo
                            id="projecto-gestor"
                            valor={dados.gestorId}
                            aoEscolher={(valor) => definir('gestorId', valor)}
                            aoLimpar={() => definir('gestorId', null)}
                            placeholder="Escolher gestor…"
                            opcoes={estado.utilizadores
                                .filter((utilizador: Utilizador) => utilizador.activo)
                                .map((gestor: Utilizador) => ({
                                    valor: gestor.id,
                                    rotulo: gestor.nome,
                                    nota: gestor.cargo,
                                }))}
                        />
                    </Campo>
                </div>
            </Secao>

            <Secao titulo="Datas">
                <div className="grid gap-4 sm:grid-cols-3">
                    <Campo
                        rotulo="Início"
                        htmlFor="projecto-inicio"
                        obrigatorio
                        erro={erros.dataInicio}
                    >
                        <Calendario
                            id="projecto-inicio"
                            valor={dados.dataInicio || null}
                            aoEscolher={(iso) => definir('dataInicio', iso)}
                        />
                    </Campo>

                    <Campo
                        rotulo="Fim previsto"
                        htmlFor="projecto-fim"
                        obrigatorio
                        erro={erros.dataFimPrevista}
                    >
                        <Calendario
                            id="projecto-fim"
                            valor={dados.dataFimPrevista || null}
                            aoEscolher={(iso) => definir('dataFimPrevista', iso)}
                            minimo={dados.dataInicio || undefined}
                        />
                    </Campo>

                    {emEdicao ? (
                        <Campo rotulo="Fim real" htmlFor="projecto-fim-real" erro={erros.dataFimReal}>
                            <Calendario
                                id="projecto-fim-real"
                                valor={dados.dataFimReal || null}
                                aoEscolher={(iso) => definir('dataFimReal', iso)}
                                minimo={dados.dataFimPrevista || undefined}
                            />
                        </Campo>
                    ) : (
                        <CampoDerivado
                            rotulo="Fim real"
                            nota="Na criação fica por preencher: escreve-se quando a obra fechar de facto."
                        >
                            Por preencher
                        </CampoDerivado>
                    )}
                </div>
            </Secao>

            <Secao titulo="Financeiro">
                <div className="grid gap-4 sm:grid-cols-3">
                    <Campo
                        rotulo={
                            <>
                                Valor contratual
                                <button
                                    type="button"
                                    onClick={() =>
                                        definirExplicarContratual(!explicarContratual)
                                    }
                                    aria-expanded={explicarContratual}
                                    aria-controls="explicacao-contratual"
                                    className="ml-1.5 inline-grid size-4 place-items-center rounded-full border border-graphite-32 font-mono text-2xs text-graphite-64 transition-colors hover:border-graphite hover:text-graphite focus-visible:border-amber focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none"
                                >
                                    <span aria-hidden>?</span>
                                    <span className="sr-only">
                                        Qual a diferença entre orçamento e valor contratual
                                    </span>
                                </button>
                            </>
                        }
                        htmlFor="projecto-contratual"
                        obrigatorio
                        ajuda="O que o cliente paga. Os dois orçamentos ao lado são custo interno."
                        erro={erros.valorContratual}
                    >
                        <Input
                            id="projecto-contratual"
                            inputMode="numeric"
                            value={dados.valorContratual}
                            onChange={(evento) => definir('valorContratual', evento.target.value)}
                            aria-invalid={Boolean(erros.valorContratual)}
                            aria-describedby={
                                explicarContratual ? 'explicacao-contratual' : undefined
                            }
                            placeholder="84 500 000"
                            className="tabular"
                        />
                    </Campo>

                    <Campo
                        rotulo="Orçamento previsto"
                        htmlFor="projecto-orcamento"
                        ajuda="Custo interno estimado."
                        erro={erros.orcamentoPrevisto}
                    >
                        <Input
                            id="projecto-orcamento"
                            inputMode="numeric"
                            value={dados.orcamentoPrevisto}
                            onChange={(evento) => definir('orcamentoPrevisto', evento.target.value)}
                            aria-invalid={Boolean(erros.orcamentoPrevisto)}
                            placeholder="71 400 000"
                            className="tabular"
                        />
                    </Campo>

                    {emEdicao ? (
                        <Campo
                            rotulo="Orçamento actual"
                            htmlFor="projecto-orcamento-real"
                            ajuda="Actualiza conforme despesas."
                            erro={erros.orcamentoActual}
                        >
                            <Input
                                id="projecto-orcamento-real"
                                inputMode="numeric"
                                value={dados.orcamentoActual}
                                onChange={(evento) => definir('orcamentoActual', evento.target.value)}
                                aria-invalid={Boolean(erros.orcamentoActual)}
                                placeholder="68 950 000"
                                className="tabular"
                            />
                        </Campo>
                    ) : (
                        <CampoDerivado
                            rotulo="Orçamento actual"
                            nota="Na criação não se escreve: as despesas vão preenchendo."
                        >
                            Calculado com as despesas
                        </CampoDerivado>
                    )}
                </div>

                {explicarContratual && (
                    <p
                        id="explicacao-contratual"
                        className="anotacao normal-case border-l-2 border-graphite-32 pl-3"
                    >
                        <strong className="font-medium text-graphite">
                            Orçamento previsto e actual
                        </strong>{' '}
                        são o custo interno estimado e o custo interno real — o que a obra gasta
                        consigo mesma. <strong className="font-medium text-graphite">
                            Valor contratual
                        </strong>{' '}
                        é o valor acordado com o cliente, e é o denominador da execução
                        financeira: as despesas aprovadas divididas por este número.
                    </p>
                )}
            </Secao>

            <Secao titulo="Estado">
                <Campo
                    rotulo="Estado geral"
                    htmlFor="projecto-estado"
                    obrigatorio
                    ajuda={
                        dados.estadoGeral === 'cancelado'
                            ? 'Um projecto cancelado deixa de contar como atraso: parou, e parar é uma decisão.'
                            : 'O que ficar por construir depois do fim previsto aparece a lápis vermelho no espelho de datas.'
                    }
                >
                    <Seletor
                        value={dados.estadoGeral}
                        onValueChange={(valor) =>
                            definir('estadoGeral', valor as EstadoProjecto)
                        }
                    >
                        <SeletorDisparador id="projecto-estado" aria-label="Estado do projecto">
                            <SeletorValor />
                        </SeletorDisparador>
                        <SeletorConteudo>
                            <SeletorGrupo>
                                <SeletorGrupoRotulo>Estado geral</SeletorGrupoRotulo>
                                {Object.entries(ROTULOS.estadoProjecto).map(([valor, rotulo]) => (
                                    <SeletorItem key={valor} value={valor}>
                                        {rotulo}
                                    </SeletorItem>
                                ))}
                            </SeletorGrupo>
                        </SeletorConteudo>
                    </Seletor>
                </Campo>

                <p className="anotacao normal-case">
                    A execução física, a execução financeira e o encerramento administrativo não
                    aparecem aqui: só existem depois de o projecto ter Actividades e Despesas, e
                    vivem na página de detalhe.
                </p>
            </Secao>
        </ModalForma>
    );
}

/**
 * A secção interna do modal: uma cota com o nome da secção e um traço de extremo,
 * como os blocos de uma prancha. O Projecto é o único modal com secções porque
 * é o único registo com quatro grupos de campos que nunca se leem juntos.
 */
function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
    return (
        <section className="space-y-4">
            <div className="flex items-baseline gap-3">
                <h3 className="cota shrink-0 text-graphite">{titulo}</h3>
                <span aria-hidden className="h-px flex-1 bg-graphite-20" />
            </div>
            {children}
        </section>
    );
}
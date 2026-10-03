import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, Plus, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { Carimbo } from '@/Components/brand/carimbo';
import { Botao } from '@/Components/ui/button';
import { EstadoSelo, Selo } from '@/Components/ui/badge';
import { Folha, FolhaCabecalho, FolhaCorpo, FolhaRodape } from '@/Components/ui/card';
import { Confirmacao } from '@/Components/ui/confirmacao';
import { ComDica } from '@/Components/ui/dica';
import { Interruptor } from '@/Components/ui/switch';
import { Medidor } from '@/Components/ui/progress';
import {
    Seletor,
    SeletorConteudo,
    SeletorDisparador,
    SeletorItem,
    SeletorValor,
} from '@/Components/ui/select';
import { Aba, AbaLista, AbaPainel, Abas } from '@/Components/ui/tabs';
import { useSgo } from '@/Data/SgoContext';
import type { AcessoProjecto, PapelProjecto, Projecto, Utilizador } from '@/Data/types';
import { LayoutAdmin } from '@/Layouts/LayoutAdmin';
import { dataExtenso, moeda, numero, percentagem } from '@/lib/format';
import { rotuloPapel } from '@/lib/rotulos';
import { cn } from '@/lib/utils';

import { FolhaHistorico } from '@/Components/brand/folha-historico';

import { FolhaActividades } from './execucao/folha-actividades';
import { FolhaDiario } from './execucao/folha-diario';
import { FolhaDocumentos } from './execucao/folha-documentos';
import { FolhaTarefas } from './execucao/folha-tarefas';
import { FolhaFotografias } from './execucao/galeria-fotografias';
import { ModalAcesso } from './ModalAcesso';
import { ModalProjecto } from './ModalProjecto';

/**
 * As abas da ficha de um projecto.
 *
 * A ordem não é a ordem da spec e não é alfabética: é a ordem de quem entra na
 * obra. Primeiro com quem se conta, depois o resumo, e só depois a execução —
 * actividades, tarefas, diário, fotografias, documentos — e o histórico no
 * fim, porque é a pergunta que se faz quando algo já não bate certo.
 */
type AbaProjecto =
    | 'acessos'
    | 'resumo'
    | 'actividades'
    | 'tarefas'
    | 'diario'
    | 'fotografias'
    | 'documentos'
    | 'historico';

/**
 * `/admin/projectos/{id}` — a ficha de um projecto.
 *
 * As abas abrem pela ordem da spec (§103): **Acessos** primeiro, **Resumo**
 * depois. Não é arbitrário — quem entra numa obra pela primeira vez precisa de
 * saber com quem conta e de que papel fala; o resumo é a segunda leitura.
 *
 * As execuções são duas barras separadas e nunca um badge fundido (§97-101): a
 * física mede o que se construiu, a financeira mede o que se gastou, e um
 * projecto pode estar longe de qualquer das duas sem que isso signifique a mesma
 * coisa. O encerramento administrativo é um interruptor à parte, porque um
 * projecto não fica «concluído» só por chegar aos 100% de dinheiro.
 *
 * Corrigir o registo é do Administrador. Fechar administrativamente é do
 * Gestor desta obra ou de um Administrador — quem gere a obra pode dizer que
 * ela fechou, mesmo sem ser quem a criou.
 */
export default function ProjectoDetalhe({ id }: { id: string }) {
    const {
        estado,
        actualizar,
        eliminar,
        utilizadorEfectivo,
        perfilEfectivo,
        execucaoFisica,
        execucaoFinanceira,
        despesasAprovadas,
    } = useSgo();

    const [aba, definirAba] = useState<AbaProjecto>('acessos');
    const [modal, definirModal] = useState(false);
    const [acesso, definirAcesso] = useState(false);

    const projecto = estado.projectos.find((p) => p.id === id);

    if (!projecto) {
        return <ProjectoInexistente id={id} />;
    }

    const area = estado.areas.find((a) => a.id === projecto.areaId) ?? null;
    const gestor = estado.utilizadores.find((u) => u.id === projecto.gestorId) ?? null;
    const acessos = estado.acessos.filter((acesso) => acesso.projectoId === projecto.id);

    const actividades = estado.actividades.filter((a) => a.projectoId === projecto.id);
    const tarefas = estado.tarefas.filter((t) => t.projectoId === projecto.id);
    const diarios = estado.diarios.filter((d) => d.projectoId === projecto.id);
    const fotografias = estado.fotografias.filter((f) => f.projectoId === projecto.id);
    const documentos = estado.documentos.filter((d) => d.projectoId === projecto.id);

    const meuAcesso = acessos.find((acesso) => acesso.utilizadorId === utilizadorEfectivo.id);
    const comAcessoTotal = perfilEfectivo === 'administrador_proprietario';
    const podeCorrigir = comAcessoTotal;
    const podeEncerrar = comAcessoTotal || meuAcesso?.papel === 'gestor';

    return (
        <LayoutAdmin>
            <Head title={`${projecto.nome} — SGO`}>
                <meta name="description" content={`Ficha do projecto ${projecto.nome}.`} />
            </Head>

            <div className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6">
                <div className="space-y-8">
                    <CabecalhoProjecto
                        projecto={projecto}
                        nomeArea={area?.nome ?? null}
                        nomeGestor={gestor?.nome ?? null}
                        podeCorrigir={podeCorrigir}
                        aoCorrigir={() => definirModal(true)}
                    />

                    <Abas
                        value={aba}
                        onValueChange={(valor) => definirAba(valor as AbaProjecto)}
                    >
                        <AbaLista>
                            <Aba value="acessos">
                                Acessos
                                <span className="cota ml-1.5 tabular">{acessos.length}</span>
                            </Aba>
                            <Aba value="resumo">Resumo</Aba>
                            <Aba value="actividades">
                                Actividades
                                <span className="cota ml-1.5 tabular">
                                    {actividades.length}
                                </span>
                            </Aba>
                            <Aba value="tarefas">
                                Tarefas
                                <span className="cota ml-1.5 tabular">{tarefas.length}</span>
                            </Aba>
                            <Aba value="diario">
                                Diário
                                <span className="cota ml-1.5 tabular">{diarios.length}</span>
                            </Aba>
                            <Aba value="fotografias">
                                Fotografias
                                <span className="cota ml-1.5 tabular">{fotografias.length}</span>
                            </Aba>
                            <Aba value="documentos">
                                Documentos
                                <span className="cota ml-1.5 tabular">{documentos.length}</span>
                            </Aba>
                            <Aba value="historico">Histórico</Aba>
                        </AbaLista>

                        <AbaPainel value="acessos" className="pt-6">
                            <FolhaAcessos
                                accesses={acessos}
                                utilizadores={estado.utilizadores}
                                utilizadorEfectivoId={utilizadorEfectivo.id}
                                podeCorrigir={podeCorrigir}
                                aoDefinirPapel={(acessoId, papel) =>
                                    actualizar('acessos', acessoId, { papel })
                                }
                                aoAdicionar={() => definirAcesso(true)}
                                aoRetirar={(acessoId) => eliminar('acessos', acessoId)}
                            />
                        </AbaPainel>

                        <AbaPainel value="resumo" className="pt-6">
                            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
                                <div className="space-y-6">
                                    <ValoresProjecto
                                        projecto={projecto}
                                        fisica={execucaoFisica(projecto.id)}
                                        financeira={execucaoFinanceira(projecto.id)}
                                        podeEncerrar={podeEncerrar}
                                        aoEncerrar={(ligado) =>
                                            actualizar('projectos', projecto.id, {
                                                encerramentoAdministrativo: ligado,
                                            })
                                        }
                                    />

                                    <Folha traco="carimbado">
                                        <FolhaCabecalho>
                                            <h2 className="text-sm font-medium text-graphite">
                                                Janela da obra
                                            </h2>
                                            <span className="cota">
                                                previsto {dataExtenso(projecto.dataInicio)} →{' '}
                                                {dataExtenso(projecto.dataFimPrevista)}
                                                {projecto.dataFimReal &&
                                                    ` · encerrou a ${dataExtenso(projecto.dataFimReal)}`}
                                            </span>
                                        </FolhaCabecalho>
                                        <FolhaCorpo>
                                            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                                                <Dado rotulo="Início" valor={dataExtenso(projecto.dataInicio)} />
                                                <Dado
                                                    rotulo="Fim previsto"
                                                    valor={dataExtenso(projecto.dataFimPrevista)}
                                                />
                                                <Dado
                                                    rotulo="Fim real"
                                                    valor={
                                                        projecto.dataFimReal
                                                            ? dataExtenso(projecto.dataFimReal)
                                                            : 'Em curso'
                                                    }
                                                />
                                                <Dado rotulo="Contratual" valor={moeda(projecto.valorContratual)} />
                                                <Dado
                                                    rotulo="Orçamento previsto"
                                                    valor={moeda(projecto.orcamentoPrevisto)}
                                                />
                                                <Dado
                                                    rotulo="Despesas aprovadas"
                                                    valor={moeda(despesasAprovadas(projecto.id))}
                                                />
                                            </dl>
                                        </FolhaCorpo>
                                    </Folha>
                                </div>

                                <Carimbo
                                    identidade="SGO · PROJECTO"
                                    linhas={[
                                        { chave: 'Emitido', valor: dataExtenso(new Date()) },
                                        { chave: 'Revisão', valor: 'C' },
                                        { chave: 'Acessos', valor: numero(acessos.length) },
                                        {
                                            chave: 'Fís.',
                                            valor: percentagem(execucaoFisica(projecto.id)),
                                        },
                                        {
                                            chave: 'Fin.',
                                            valor: percentagem(execucaoFinanceira(projecto.id)),
                                        },
                                    ]}
                                    rodado={1}
                                />
                            </div>
                        </AbaPainel>

                        <AbaPainel value="actividades" className="pt-6">
                            <FolhaActividades projectoId={projecto.id} />
                        </AbaPainel>

                        <AbaPainel value="tarefas" className="pt-6">
                            <FolhaTarefas projectoId={projecto.id} />
                        </AbaPainel>

                        <AbaPainel value="diario" className="pt-6">
                            <FolhaDiario projectoId={projecto.id} />
                        </AbaPainel>

                        <AbaPainel value="fotografias" className="pt-6">
                            <FolhaFotografias projectoId={projecto.id} />
                        </AbaPainel>

                        <AbaPainel value="documentos" className="pt-6">
                            <FolhaDocumentos projectoId={projecto.id} />
                        </AbaPainel>

                        <AbaPainel value="historico" className="pt-6">
                            <FolhaHistorico entidade="Projecto" registoId={projecto.id} />
                        </AbaPainel>
                    </Abas>
                </div>
            </div>

            <ModalProjecto
                aberto={modal}
                projecto={projecto}
                aoFechar={() => definirModal(false)}
            />

            <ModalAcesso
                aberto={acesso}
                projectoId={projecto.id}
                acessos={acessos}
                aoFechar={() => definirAcesso(false)}
            />
        </LayoutAdmin>
    );
}

function ProjectoInexistente({ id }: { id: string }) {
    return (
        <LayoutAdmin>
            <Head title="Projecto não encontrado — SGO" />
            <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
                <Folha traco="carimbado">
                    <FolhaCabecalho>
                        <h1 className="font-display text-xl text-graphite">
                            Este projecto não existe
                        </h1>
                    </FolhaCabecalho>
                    <FolhaCorpo>
                        <p className="text-sm text-graphite-64">
                            O registo <code className="font-mono text-xs">{id}</code> não está nesta
                            sessão. O SGO guarda tudo em memória: um projecto criado numa sessão
                            anterior já não existe.
                        </p>
                        <Link href="/admin/projectos" className="mt-4 inline-block">
                            <Botao traco="firme">
                                <ArrowLeft aria-hidden />
                                Voltar aos projectos
                            </Botao>
                        </Link>
                    </FolhaCorpo>
                </Folha>
            </div>
        </LayoutAdmin>
    );
}

function CabecalhoProjecto({
    projecto,
    nomeArea,
    nomeGestor,
    podeCorrigir,
    aoCorrigir,
}: {
    projecto: Projecto;
    nomeArea: string | null;
    nomeGestor: string | null;
    podeCorrigir: boolean;
    aoCorrigir: () => void;
}) {
    return (
        <header className="border-b border-graphite-32 pb-5">
            <Link
                href="/admin/projectos"
                className="cota inline-flex items-center gap-1 text-graphite-64 hover:text-graphite"
            >
                <ArrowLeft aria-hidden className="size-3" />
                Projectos
            </Link>

            <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="font-display text-3xl tracking-tight text-graphite">
                        {projecto.nome}
                    </h1>
                    <p className="mt-1 text-sm text-graphite-64">
                        {projecto.cliente}
                        {projecto.morada && ` · ${projecto.morada}`}
                    </p>
                </div>

                {podeCorrigir && (
                    <Botao traco="firme" onClick={aoCorrigir}>
                        <Pencil aria-hidden />
                        Corrigir projecto
                    </Botao>
                )}
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
                <Dado rotulo="Estado">
                    <EstadoSelo estado={projecto.estadoGeral} tamanho="md" />
                </Dado>
                <Dado rotulo="Área" valor={nomeArea ?? '—'} />
                <Dado rotulo="Gestor" valor={nomeGestor ?? '—'} />
                <Dado rotulo="Contratual" valor={moeda(projecto.valorContratual)} />
                <Dado rotulo="Fim previsto" valor={dataExtenso(projecto.dataFimPrevista)} />
                <Dado rotulo="Início" valor={dataExtenso(projecto.dataInicio)} />
            </dl>
        </header>
    );
}

/**
 * As execuções e o encerramento (spec §97-101).
 *
 * Duas barras, uma por execução, e nunca um valor fundido: quem lê «82%» sem
 * saber de quê não consegue agir sobre isso. A marca da execution física dentro
 * da barra financeira existe para se ver o desvio sem retirar os olhos da barra,
 * mas o número ao lado é sempre o da sua própria barra.
 *
 * O encerramento administrativo é um interruptor e não um badge porque é uma
 * acção, e porque é independente das execuções — é o que o texto de ajuda diz:
 * obra a 100% do dinheiro não é uma obra encerrada administrativamente.
 */
function ValoresProjecto({
    projecto,
    fisica,
    financeira,
    podeEncerrar,
    aoEncerrar,
}: {
    projecto: Projecto;
    fisica: number;
    financeira: number;
    podeEncerrar: boolean;
    aoEncerrar: (ligado: boolean) => void;
}) {
    const desvio = fisica - financeira;

    return (
        <Folha traco="carimbado">
            <FolhaCabecalho>
                <h2 className="text-sm font-medium text-graphite">Execução</h2>
                <span className="cota">duas leituras, nunca uma só</span>
            </FolhaCabecalho>
            <FolhaCorpo className="space-y-5">
                <div>
                    <div className="flex items-baseline justify-between gap-3">
                        <p className="cota normal-case">Execução física</p>
                        <p className="font-mono text-sm tabular text-graphite">
                            {percentagem(fisica)}
                        </p>
                    </div>
                    <Medidor
                        className="mt-1.5 w-full"
                        valor={fisica}
                        rotulo="Execução física"
                    />
                    <p className="mt-1.5 text-xs text-graphite-64">
                        Média da percentagem de conclusão das actividades desta obra.
                    </p>
                </div>

                <div>
                    <div className="flex items-baseline justify-between gap-3">
                        <p className="cota normal-case">Execução financeira</p>
                        <p className="font-mono text-sm tabular text-graphite">
                            {percentagem(financeira)}
                        </p>
                    </div>
                    <Medidor
                        className="mt-1.5 w-full"
                        valor={financeira}
                        rotulo="Execução financeira"
                        marca={fisica}
                        marcaRotulo={`Execução física ${Math.round(fisica)}%`}
                    />
                    <p className="mt-1.5 text-xs text-graphite-64">
                        Despesas aprovadas desta obra ({moeda(projecto.valorContratual)} de valor
                        contratual).
                    </p>
                </div>

                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-graphite-20 pt-4 sm:grid-cols-3">
                    <Dado
                        rotulo="Desvio"
                        valor={`${desvio >= 0 ? '+' : ''}${percentagem(desvio)}`}
                        critico={desvio < -5}
                    />
                    <Dado rotulo="Orçamento previsto" valor={moeda(projecto.orcamentoPrevisto)} />
                    <Dado rotulo="Orçamento actual" valor={moeda(projecto.orcamentoActual)} />
                </dl>

                {desvio <= -5 && (
                    <p className="border-l-2 border-red-pencil bg-paper-sunken px-3 py-2 text-sm text-graphite">
                        A execução financeira está {percentagem(Math.abs(desvio))} abaixo da
                        física. Gastar menos do que o previsto não é bom por si só: pode ser
                        eficiência ou pode ser obra por fazer.
                    </p>
                )}

                <div className="flex items-start gap-3 border border-graphite-32 bg-paper-sunken px-3 py-2.5">
                    <Interruptor
                        id="projecto-encerramento"
                        checked={projecto.encerramentoAdministrativo}
                        disabled={!podeEncerrar}
                        onCheckedChange={(ligado: boolean) => aoEncerrar(ligado)}
                    />
                    <div className="min-w-0">
                        <label
                            htmlFor="projecto-encerramento"
                            className="block text-sm font-medium text-graphite"
                        >
                            Encerramento administrativo
                        </label>
                        <p className="anotacao normal-case">
                            {podeEncerrar
                                ? 'Independente das duas execuções: uma obra pode chegar a 100% do dinheiro e continuar aberta administrativamente, ou fechar aqui sem chegar lá.'
                                : 'Só o gestor desta obra ou um administrador podem alterar isto.'}
                        </p>
                    </div>
                </div>
            </FolhaCorpo>
        </Folha>
    );
}

/**
 * A aba Acessos (spec §104).
 *
 * A nota de rodapé é fixa e é verdade: o Administrador vê sempre todos os
 * projectos, porque o acesso total não passa por esta lista. Escrever o
 * contrário era dar a entender que esta folha é a porta de entrada da obra, e
 * não é.
 *
 * Adicionar é a janela `sm` de relação (spec §305), não uns controlos soltos no
 * rodapé da tabela: quem entra é uma pessoa com um papel, e essa escolha merece
 * um formulário com validação, não dois selectores em linha.
 *
 * O papel muda-se aqui, em linha, porque é a única coisa que muda sem sair da
 * folha: quem era fiscal passou a gestor, e a diferença está no mesmo ecrã.
 */
function FolhaAcessos({
    accesses,
    utilizadores,
    utilizadorEfectivoId,
    podeCorrigir,
    aoDefinirPapel,
    aoAdicionar,
    aoRetirar,
}: {
    accesses: AcessoProjecto[];
    utilizadores: Utilizador[];
    utilizadorEfectivoId: string;
    podeCorrigir: boolean;
    aoDefinirPapel: (acessoId: string, papel: PapelProjecto) => void;
    aoAdicionar: () => void;
    aoRetirar: (acessoId: string) => void;
}) {
    const [aRetirar, definirARetirar] = useState<AcessoProjecto | null>(null);

    const nomes = new Map(utilizadores.map((u) => [u.id, u]));

    return (
        <Folha traco="carimbado">
            <FolhaCabecalho>
                <h2 className="text-sm font-medium text-graphite">Quem pode mexer nesta obra</h2>
                <span className="cota">
                    {accesses.length} {accesses.length === 1 ? 'pessoa' : 'pessoas'}
                </span>
            </FolhaCabecalho>

            <FolhaCorpo className="p-0">
                <ul aria-label="Acessos ao projecto" className="divide-y divide-graphite-20">
                    {accesses.length === 0 && (
                        <li className="px-4 py-4 text-sm text-graphite-64">
                            Ninguém tem papel nesta obra além de quem tem acesso total. Sem acesso, um
                            gestor ou um fiscal não consegue entrar.
                        </li>
                    )}

                    {accesses.map((acesso) => {
                        const pessoa = nomes.get(acesso.utilizadorId);
                        const souEu = acesso.utilizadorId === utilizadorEfectivoId;

                        return (
                            <li
                                key={acesso.id}
                                className="flex flex-wrap items-center gap-3 px-4 py-3"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-graphite">
                                        {pessoa?.nome ?? 'Pessoa desconhecida'}
                                        {souEu && (
                                            <span className="cota ml-2 normal-case">
                                                é a pessoa com quem está a ver
                                            </span>
                                        )}
                                    </p>
                                    <p className="cota">{pessoa?.cargo ?? pessoa?.email ?? ''}</p>
                                </div>

                                {podeCorrigir ? (
                                    <>
                                        <Seletor
                                            value={acesso.papel}
                                            onValueChange={(papel) =>
                                                aoDefinirPapel(acesso.id, papel as PapelProjecto)
                                            }
                                        >
                                            <SeletorDisparador
                                                aria-label={`Papel de ${pessoa?.nome ?? 'pessoa'} nesta obra`}
                                                className="min-w-[180px]"
                                            >
                                                <SeletorValor />
                                            </SeletorDisparador>
                                            <SeletorConteudo>
                                                <PapelItem papel="gestor" />
                                                <PapelItem papel="fiscal" />
                                                <PapelItem papel="colaborador" />
                                                <PapelItem papel="consulta" />
                                            </SeletorConteudo>
                                        </Seletor>

                                        <ComDica
                                            texto={`Retirar ${pessoa?.nome ?? 'esta pessoa'} desta obra`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => definirARetirar(acesso)}
                                                className="grid size-8 shrink-0 place-items-center border border-graphite-32 text-graphite-64 transition-colors hover:border-red-pencil hover:text-red-pencil focus-visible:border-amber focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none"
                                            >
                                                <X aria-hidden className="size-3.5" />
                                                <span className="sr-only">
                                                    Retirar {pessoa?.nome ?? 'esta pessoa'} desta obra
                                                </span>
                                            </button>
                                        </ComDica>
                                    </>
                                ) : (
                                    <Selo tinta="neutro" traco="medio">
                                        {rotuloPapel(acesso.papel)}
                                    </Selo>
                                )}
                            </li>
                        );
                    })}
                </ul>

                {podeCorrigir && (
                    <div className="border-t border-graphite-20 px-4 py-3">
                        <Botao variante="contorno" onClick={aoAdicionar}>
                            <Plus aria-hidden />
                            Adicionar acesso
                        </Botao>
                    </div>
                )}
            </FolhaCorpo>

            <FolhaRodape>
                <p className="cota">
                    Administrador vê sempre todos os projectos, independentemente desta lista.
                </p>
            </FolhaRodape>

            <Confirmacao
                aberto={aRetirar !== null}
                titulo="Retirar acesso"
                descricao={
                    aRetirar
                        ? `${nomes.get(aRetirar.utilizadorId)?.nome ?? 'Esta pessoa'} deixa de ver esta obra. O registo do que fica guardado é o papel que tinha, não o acesso.`
                        : ''
                }
                accao="Retirar acesso"
                aoFechar={() => definirARetirar(null)}
                aoConfirmar={() => {
                    if (aRetirar) {
                        aoRetirar(aRetirar.id);
                    }

                    definirARetirar(null);
                }}
            />
        </Folha>
    );
}

function PapelItem({ papel }: { papel: PapelProjecto }) {
    return <SeletorItem value={papel}>{rotuloPapel(papel)}</SeletorItem>;
}

function Dado({
    rotulo,
    valor,
    children,
    critico = false,
}: {
    rotulo: string;
    valor?: string;
    children?: ReactNode;
    critico?: boolean;
}) {
    return (
        <div>
            <dt className="cota">{rotulo}</dt>
            <dd
                className={cn(
                    'mt-0.5 text-sm font-medium',
                    critico ? 'text-red-pencil' : 'text-graphite',
                )}
            >
                {valor ?? children}
            </dd>
        </div>
    );
}
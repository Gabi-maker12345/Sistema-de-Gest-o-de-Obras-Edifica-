import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, LogOut, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';

import { Carimbo } from '@/Components/brand/carimbo';
import { Selo } from '@/Components/ui/badge';
import { Botao } from '@/Components/ui/button';
import { Folha, FolhaCabecalho, FolhaCorpo, FolhaRodape } from '@/Components/ui/card';
import { Confirmacao } from '@/Components/ui/confirmacao';
import { ComDica } from '@/Components/ui/dica';
import { LayoutAdmin } from '@/Layouts/LayoutAdmin';
import type { Equipa, MembroEquipa } from '@/Data/types';
import { useSgo } from '@/Data/SgoContext';
import { dataExtenso, dataIso, numero } from '@/lib/format';
import { hoje } from '@/lib/espelho';

import { ModalEquipa } from './ModalEquipa';
import { ModalMembro } from './ModalMembro';

/**
 * `/admin/equipas/{id}` — a ficha de uma equipa e os seus membros.
 *
 * A equipa tem duas janelas, por contrato: uma para a correcção do registo e
 * outra — a de membros — que só faz sentido com a equipa já criada. É a razão de
 * a lista de membros não estar no modal da equipa, e a razão de existirem duas
 * abas em vez de um formulário só.
 *
 * A aba lista quem está **no livro** (entrou e não saiu) separada de quem já
 * saiu, porque a pergunta de uma obra é sempre «quem está a trabalhar agora» e
 * essa resposta não pode vir misturada com quem já passou.
 */
export default function EquipaDetalhe({ id }: { id: string }) {
    const { estado, definirMembros } = useSgo();

    const equipa = estado.equipas.find((registo) => registo.id === id);

    const [corrigir, definirCorrigir] = useState(false);
    const [juntar, definirJuntar] = useState(false);
    const [aRetirar, definirARetirar] = useState<MembroEquipa | null>(null);

    if (!equipa) {
        return <EquipaInexistente id={id} />;
    }

    const membros = estado.membrosEquipa.filter((membro) => membro.equipaId === equipa.id);
    const noLivro = membros.filter((membro) => membro.dataSaida === null);
    const saidos = membros.filter((membro) => membro.dataSaida !== null);

    const projecto = estado.projectos.find((p) => p.id === equipa.projectoId) ?? null;
    const encarregado =
        estado.utilizadores.find((utilizador) => utilizador.id === equipa.encarregadoId) ?? null;

    const tarefas = estado.tarefas.filter((tarefa) => tarefa.equipaId === equipa.id);

    /**
     * Sair da equipa é escrever a data, não apagar a pessoa.
     *
     * O botão na folha diz «registar saída» e o que ele faz é pôr a data de hoje na
     * ligação — a pessoa passa de «no livro» para «já saiu» com o dia ao lado. É a
     * diferença entre um livro que guarda a história da equipa e uma lista que
     * esquece. Apagar a relação deixaria um buraco sem rasto.
     */
    const sair = (membro: MembroEquipa) => {
        definirMembros(
            equipa.id,
            membros.map((outro) =>
                outro.utilizadorId === membro.utilizadorId
                    ? { ...outro, dataSaida: dataIso(hoje()) }
                    : outro,
            ),
        );
    };

    const nomeDe = (utilizadorId: string) =>
        estado.utilizadores.find((utilizador) => utilizador.id === utilizadorId)?.nome ??
        utilizadorId;

    return (
        <LayoutAdmin>
            <Head title={equipa.nome}>
                <meta name="description" content={`Ficha da equipa ${equipa.nome}.`} />
            </Head>

            <div className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6">
                <div className="space-y-8">
                    <header className="border-b border-graphite-32 pb-5">
                        <Link
                            href="/admin/equipas"
                            className="cota inline-flex items-center gap-1 text-graphite-64 hover:text-graphite"
                        >
                            <ArrowLeft aria-hidden className="size-3" />
                            Equipas
                        </Link>

                        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0">
                                <h1 className="font-display text-3xl tracking-tight text-graphite">
                                    {equipa.nome}
                                </h1>
                                <p className="mt-1 text-sm text-graphite-64">
                                    {equipa.especialidade}
                                    {projecto && ` · ${projecto.nome}`}
                                </p>
                            </div>

                            <Botao traco="firme" onClick={() => definirCorrigir(true)}>
                                <Pencil aria-hidden />
                                Corrigir equipa
                            </Botao>
                        </div>

                        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                            <Dado
                                rotulo="Projecto"
                                valor={
                                    projecto ? (
                                        projecto.nome
                                    ) : (
                                        <Selo tinta="grafite" traco="pontilhado">
                                            sem obra
                                        </Selo>
                                    )
                                }
                            />
                            <Dado
                                rotulo="Encarregado"
                                valor={
                                    encarregado ? (
                                        encarregado.nome
                                    ) : (
                                        <Selo tinta="lapis" traco="pontilhado">
                                            sem encarregado
                                        </Selo>
                                    )
                                }
                            />
                            <Dado rotulo="No livro" valor={numero(noLivro.length)} />
                            <Dado rotulo="Tarefas" valor={numero(tarefas.length)} />
                        </dl>
                    </header>

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
                        <div className="space-y-6">
                            <Folha traco="carimbado">
                                <FolhaCabecalho>
                                    <h2 className="text-sm font-medium text-graphite">
                                        No livro da equipa
                                    </h2>
                                    <span className="cota">
                                        {noLivro.length} a trabalhar
                                    </span>
                                </FolhaCabecalho>

                                <FolhaCorpo className="p-0">
                                    <ul
                                        aria-label="Membros no livro da equipa"
                                        className="divide-y divide-graphite-20"
                                    >
                                        {noLivro.length === 0 && (
                                            <li className="px-4 py-4 text-sm text-graphite-64">
                                                Ninguém no livro. Uma equipa sem ninguém a
                                                trabalhar não recebe tarefas — é o aviso que
                                                esta folha existe para dar.
                                            </li>
                                        )}

                                        {noLivro.map((membro) => {
                                            const pessoa =
                                                estado.utilizadores.find(
                                                    (u) => u.id === membro.utilizadorId,
                                                ) ?? null;

                                            return (
                                                <li
                                                    key={`${equipa.id}-${membro.utilizadorId}`}
                                                    className="flex items-center gap-3 px-4 py-3"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-graphite">
                                                            {pessoa?.nome ?? membro.utilizadorId}
                                                            {membro.utilizadorId ===
                                                                equipa.encarregadoId && (
                                                                <span className="cota ml-2">
                                                                    encarregado
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="cota">
                                                            {membro.funcao || 'sem função escrita'}{' '}
                                                            · desde {membro.dataEntrada}
                                                        </p>
                                                    </div>

                                                    <ComDica
                                                        texto={`Registar saída de ${pessoa?.nome ?? membro.utilizadorId}`}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => definirARetirar(membro)}
                                                            className="grid size-8 shrink-0 place-items-center border border-graphite-32 text-graphite-64 transition-colors hover:border-red-pencil hover:text-red-pencil focus-visible:border-amber focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none"
                                                        >
                                                            <LogOut aria-hidden className="size-3.5" />
                                                            <span className="sr-only">
                                                                Registar saída de{' '}
                                                                {pessoa?.nome ?? membro.utilizadorId} da
                                                                equipa
                                                            </span>
                                                        </button>
                                                    </ComDica>
                                                </li>
                                            );
                                        })}
                                    </ul>

                                    <div className="border-t border-graphite-20 px-4 py-3">
                                        <Botao
                                            variante="contorno"
                                            onClick={() => definirJuntar(true)}
                                        >
                                            <Plus aria-hidden />
                                            Adicionar membro
                                        </Botao>
                                    </div>
                                </FolhaCorpo>

                                <FolhaRodape>
                                    <p className="cota">
                                        Quem sai da equipa sai com data. O livro da obra guarda a
                                        história; ninguém desaparece dele.
                                    </p>
                                </FolhaRodape>
                            </Folha>

                            {saidos.length > 0 && (
                                <Folha traco="vincado">
                                    <FolhaCabecalho>
                                        <h2 className="text-sm font-medium text-graphite">
                                            Já saíram
                                        </h2>
                                        <span className="cota">{saidos.length}</span>
                                    </FolhaCabecalho>
                                    <FolhaCorpo>
                                        <ul className="divide-y divide-graphite-20">
                                            {saidos.map((membro) => (
                                                <li
                                                    key={`${equipa.id}-${membro.utilizadorId}`}
                                                    className="flex items-baseline gap-3 py-2"
                                                >
                                                    <span className="min-w-0 flex-1 truncate text-sm text-graphite-64">
                                                        {
                                                            estado.utilizadores.find(
                                                                (u) =>
                                                                    u.id ===
                                                                    membro.utilizadorId,
                                                            )?.nome ?? membro.utilizadorId
                                                        }
                                                    </span>
                                                    <span className="cota shrink-0">
                                                        saiu a {membro.dataSaida}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </FolhaCorpo>
                                </Folha>
                            )}
                        </div>

                        <Carimbo
                            identidade="SGO · EQUIPA"
                            linhas={[
                                { chave: 'Emitido', valor: dataExtenso(new Date()) },
                                { chave: 'Revisão', valor: 'C' },
                                { chave: 'No livro', valor: numero(noLivro.length) },
                                { chave: 'Saíram', valor: numero(saidos.length) },
                            ]}
                            rodado={0}
                        />
                    </div>
                </div>
            </div>

            <ModalEquipa
                aberto={corrigir}
                equipa={equipa}
                aoFechar={() => definirCorrigir(false)}
            />

            <ModalMembro
                aberto={juntar}
                equipaId={equipa.id}
                membros={membros}
                aoFechar={() => definirJuntar(false)}
            />

            <Confirmacao
                aberto={aRetirar !== null}
                titulo="Registar saída"
                descricao={
                    aRetirar
                        ? `${nomeDe(aRetirar.utilizadorId)} deixa o livro da equipa com a data de hoje ao lado. Continua escrita em «já saíram» — ninguém desaparece desta folha.`
                        : ''
                }
                accao="Registar saída"
                aoFechar={() => definirARetirar(null)}
                aoConfirmar={() => {
                    if (aRetirar) {
                        sair(aRetirar);
                    }

                    definirARetirar(null);
                }}
            />
        </LayoutAdmin>
    );
}

function EquipaInexistente({ id }: { id: string }) {
    return (
        <LayoutAdmin>
            <Head title="Equipa não encontrada" />
            <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
                <Folha traco="carimbado">
                    <FolhaCabecalho>
                        <h1 className="font-display text-xl text-graphite">
                            Esta equipa não existe
                        </h1>
                    </FolhaCabecalho>
                    <FolhaCorpo>
                        <p className="text-sm text-graphite-64">
                            O registo <code className="font-mono text-xs">{id}</code> não está
                            nesta sessão. O SGO guarda tudo em memória: uma equipa criada numa
                            sessão anterior já não existe.
                        </p>
                        <Link href="/admin/equipas" className="mt-4 inline-block">
                            <Botao traco="firme">
                                <ArrowLeft aria-hidden />
                                Voltar às equipas
                            </Botao>
                        </Link>
                    </FolhaCorpo>
                </Folha>
            </div>
        </LayoutAdmin>
    );
}

function Dado({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
    return (
        <div>
            <dt className="cota">{rotulo}</dt>
            <dd className="mt-0.5 truncate text-sm font-medium text-graphite">{valor}</dd>
        </div>
    );
}
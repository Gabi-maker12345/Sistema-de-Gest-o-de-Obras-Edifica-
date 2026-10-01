import { Head, Link } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { CabecalhoFolha } from '@/Components/brand/cabecalho-folha';
import { GRELHA_REGISTOS, useOrdem } from '@/Components/brand/cabecalho-cota';
import { Carimbo } from '@/Components/brand/carimbo';
import { useBusca } from '@/Components/brand/contexto-busca';
import { FiltroChip, FiltrosFolha } from '@/Components/brand/filtros-folha';
import { FolhaRegistos } from '@/Components/brand/folha-registos';
import { NumeroComDetalhe } from '@/Components/brand/lista-coluna';
import { TextoLongo } from '@/Components/brand/texto-longo';
import { Selo } from '@/Components/ui/badge';
import { Botao } from '@/Components/ui/button';
import { useSgo } from '@/Data/SgoContext';
import type { Equipa } from '@/Data/types';
import { LayoutAdmin } from '@/Layouts/LayoutAdmin';
import { dataExtenso, normalizar, numero } from '@/lib/format';
import { cn } from '@/lib/utils';

import { ModalEquipa } from './ModalEquipa';

/**
 * `/admin/equipas` — quem está em cada obra e a fazer o quê.
 *
 * A equipa é a unidade que executa: o projecto diz o que tem de acontecer e a
 * equipa diz com quantas mãos. Por isso o projecto vem logo depois do nome, e
 * uma equipa sem obra aparece na folha como tal — não escondido, porque é
 * exactamente o registo que alguém tem de corrigir.
 *
 * O nome é a porta para `/admin/equipas/{id}`: a folha diz quem é e com que
 * obra; a ficha diz quem está no livro. Corrigir o registo fica no lápis da
 * última coluna, porque são duas coisas diferentes a fazer.
 *
 * A coluna do meio conta quantos estão no livro (entraram e não saíram) face aos
 * que já saíram com data. Um livro vazio numa equipa que tem tarefas atribui-
 * das é o aviso mais útil que esta folha pode dar.
 */
export default function Equipas() {
    const { estado, utilizadorEfectivo, projectosVisiveis } = useSgo();
    const { termo, limpar } = useBusca();

    const [escopo, definirEscopo] = useState<'todas' | 'com_obra' | 'sem_obra'>('todas');
    const [ficha, definirFicha] = useState<{ aberto: boolean; equipa: Equipa | null }>({
        aberto: false,
        equipa: null,
    });

    const { ordem, alternar, ordenar } = useOrdem(COLUNAS, 'nome');

    const linhas = useMemo(() => {
        const alvo = normalizar(termo.trim());

        return estado.equipas
            .map((equipa) => {
                const membros = estado.membrosEquipa.filter(
                    (membro) => membro.equipaId === equipa.id,
                );
                const projecto = estado.projectos.find((p) => p.id === equipa.projectoId);

                return {
                    equipa,
                    projecto: projecto ?? null,
                    membros,
                    noLivro: membros.filter((membro) => membro.dataSaida === null).length,
                    saidos: membros.filter((membro) => membro.dataSaida !== null).length,
                    tarefas: estado.tarefas.filter((tarefa) => tarefa.equipaId === equipa.id)
                        .length,
                };
            })
            .filter((linha) => {
                if (escopo === 'com_obra' && linha.projecto === null) {
                    return false;
                }

                if (escopo === 'sem_obra' && linha.projecto !== null) {
                    return false;
                }

                if (alvo.length === 0) {
                    return true;
                }

                return normalizar(
                    `${linha.equipa.nome} ${linha.equipa.especialidade} ${
                        linha.projecto?.nome ?? ''
                    }`,
                ).includes(alvo);
            });
    }, [escopo, estado.equipas, estado.membrosEquipa, estado.projectos, estado.tarefas, termo]);

    const ordenadas = useMemo(() => ordenar(linhas), [linhas, ordenar]);

    const semObra = estado.equipas.filter((equipa) => equipa.projectoId === null).length;
    const vazias = estado.equipas.filter(
        (equipa) =>
            !estado.membrosEquipa.some(
                (membro) => membro.equipaId === equipa.id && membro.dataSaida === null,
            ),
    ).length;
    const doProjectoActual = estado.equipas.filter((equipa) =>
        projectosVisiveis.some((projecto) => projecto.id === equipa.projectoId),
    ).length;

    const termoActivo = termo.trim().length > 0;

    return (
        <LayoutAdmin>
            <Head title="Equipas — SGO">
                <meta
                    name="description"
                    content="As equipas de execução, o projecto a que pertencem e quem está no livro."
                />
            </Head>

            <div className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6">
                <div className="space-y-12">
                    <CabecalhoFolha
                        cota="Pasta de obra · Sistema"
                        titulo="Equipas"
                        linha={
                            <>
                                {estado.equipas.length} equipas · {doProjectoActual} em obra visível ·{' '}
                                {vazias > 0 ? `${vazias} sem ninguém no livro` : 'todas com gente'}. A
                                ver como{' '}
                                <span className="font-medium text-graphite">
                                    {utilizadorEfectivo.nome}
                                </span>
                                .
                            </>
                        }
                        anotacao="Uma equipa pertence a um projecto. Quem sai da equipa sai com data, não desaparece: o livro da obra guarda essa história."
                        acoes={
                            <Botao
                                traco="firme"
                                onClick={() => definirFicha({ aberto: true, equipa: null })}
                            >
                                <Plus aria-hidden />
                                Nova equipa
                            </Botao>
                        }
                        medicoes={[
                            {
                                rotulo: 'Equipas',
                                valor: numero(estado.equipas.length),
                                nota: 'registadas',
                            },
                            {
                                rotulo: 'Em obra',
                                valor: numero(estado.equipas.length - semObra),
                                nota: 'com projecto',
                            },
                            {
                                rotulo: 'No livro',
                                valor: numero(
                                    estado.membrosEquipa.filter(
                                        (membro) => membro.dataSaida === null,
                                    ).length,
                                ),
                                nota: 'pessoas a trabalhar',
                            },
                            {
                                rotulo: 'Saíram',
                                valor: numero(
                                    estado.membrosEquipa.filter(
                                        (membro) => membro.dataSaida !== null,
                                    ).length,
                                ),
                                nota: 'com data de saída',
                            },
                            {
                                rotulo: 'Tarefas',
                                valor: numero(
                                    estado.tarefas.filter((tarefa) => tarefa.equipaId !== null)
                                        .length,
                                ),
                                nota: 'atribuídas a equipa',
                            },
                            {
                                rotulo: 'Livro vazio',
                                valor: numero(vazias),
                                nota: 'sem ninguém a trabalhar',
                            },
                        ]}
                        folha="05 / 08"
                    />

                    <FiltrosFolha
                        direita={
                            termoActivo ? (
                                <>
                                    {ordenadas.length} de {estado.equipas.length} linhas · «
                                    {termo.trim()}»{' '}
                                    <button
                                        type="button"
                                        onClick={limpar}
                                        className="font-sans text-xs text-graphite underline underline-offset-2 hover:text-graphite-64"
                                    >
                                        limpar
                                    </button>
                                </>
                            ) : (
                                'a pesquisa do topo escreve nesta folha'
                            )
                        }
                    >
                        <FiltroChip
                            premido={escopo === 'todas'}
                            aoPremir={() => definirEscopo('todas')}
                            contagem={estado.equipas.length}
                        >
                            Todas
                        </FiltroChip>

                        <FiltroChip
                            premido={escopo === 'com_obra'}
                            aoPremir={() =>
                                definirEscopo(escopo === 'com_obra' ? 'todas' : 'com_obra')
                            }
                            contagem={estado.equipas.length - semObra}
                        >
                            Em obra
                        </FiltroChip>

                        <FiltroChip
                            premido={escopo === 'sem_obra'}
                            aoPremir={() =>
                                definirEscopo(escopo === 'sem_obra' ? 'todas' : 'sem_obra')
                            }
                            contagem={semObra}
                        >
                            Sem obra
                        </FiltroChip>
                    </FiltrosFolha>

                    <FolhaRegistos
                        titulo="Equipas · uma linha por equipa"
                        grelha={GRELHA}
                        linhas={ordenadas}
                        chaveDe={(linha) => linha.equipa.id}
                        vazio={
                            termoActivo || escopo !== 'todas'
                                ? 'Nenhuma equipa corresponde a estes filtros.'
                                : 'Ainda não há equipas nesta sessão.'
                        }
                        colunas={COLUNAS}
                        ordem={ordem}
                        alternar={alternar}
                    >
                        {(linha) => (
                            <LinhaEquipa
                                linha={linha}
                                aoEditar={() => definirFicha({ aberto: true, equipa: linha.equipa })}
                            />
                        )}
                    </FolhaRegistos>

                    <Carimbo
                        identidade="SGO · EQUIPA"
                        className="w-[280px]"
                        linhas={[
                            { chave: 'Emitido', valor: dataExtenso(new Date()) },
                            { chave: 'Revisão', valor: 'C' },
                            {
                                chave: 'Linhas',
                                valor: `${ordenadas.length} de ${estado.equipas.length}`,
                            },
                            {
                                chave: 'No livro',
                                valor: numero(
                                    estado.membrosEquipa.filter(
                                        (membro) => membro.dataSaida === null,
                                    ).length,
                                ),
                            },
                        ]}
                        rodado={0}
                    />
                </div>

                <p className="sr-only" aria-live="polite">
                    {ordenadas.length} de {estado.equipas.length} equipas na folha.
                </p>
            </div>

            <ModalEquipa
                aberto={ficha.aberto}
                equipa={ficha.equipa}
                aoFechar={() => definirFicha({ aberto: false, equipa: null })}
            />
        </LayoutAdmin>
    );
}

interface Linha {
    equipa: Equipa;
    projecto: { id: string; nome: string } | null;
    membros: Array<{ utilizadorId: string; dataSaida: string | null }>;
    noLivro: number;
    saidos: number;
    tarefas: number;
}

const GRELHA = `${GRELHA_REGISTOS} md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)_minmax(0,1fr)_116px_88px_40px]`;

const COLUNAS = [
    { chave: 'nome', cota: 'Equipa', valor: (linha: Linha) => linha.equipa.nome },
    {
        chave: 'projecto',
        cota: 'Projecto',
        valor: (linha: Linha) => linha.projecto?.nome ?? '',
    },
    {
        chave: 'especialidade',
        cota: 'Especialidade',
        valor: (linha: Linha) => linha.equipa.especialidade,
    },
    {
        chave: 'livro',
        cota: 'No livro',
        alinhamento: 'direita' as const,
        valor: (linha: Linha) => linha.noLivro,
    },
    {
        chave: 'tarefas',
        cota: 'Tarefas',
        alinhamento: 'direita' as const,
        valor: (linha: Linha) => linha.tarefas,
    },
    { chave: 'accao', cota: '', valor: () => '' },
];

function LinhaEquipa({ linha, aoEditar }: { linha: Linha; aoEditar: () => void }) {
    const { equipa, projecto, noLivro, saidos, tarefas } = linha;
    const semObra = projecto === null;

    return (
        <div className={cn(GRELHA, noLivro === 0 && 'bg-paper-sunken/60')}>
            <div className="min-w-0">
                {/* O nome abre a equipa: quem lê a folha quer ir à equipa, não
                    corrigi-la. Corrigir fica no lápis, à direita, onde está escrito
                    o que faz. */}
                <TextoLongo
                    texto={equipa.nome}
                    limite={28}
                    href={`/admin/equipas/${equipa.id}`}
                    className="font-medium text-graphite"
                />
            </div>

            <div className="min-w-0">
                {projecto ? (
                    <p className="text-sm text-graphite">
                        <TextoLongo texto={projecto.nome} limite={26} />
                    </p>
                ) : (
                    // Uma equipa sem obra não é um erro de escrita, é uma equipa
                    // que ninguém ligou a nada. O lápis vermelho fica para atraso
                    // e rejeição, por isso aqui é um selo neutro tracejado.
                    <Selo tinta="grafite" traco="pontilhado">
                        sem obra
                    </Selo>
                )}
            </div>

            <p className="min-w-0 text-sm text-graphite-64">
                <TextoLongo texto={equipa.especialidade ?? ''} limite={24} />
            </p>

            {/* `w-full` + `text-right` para a origem do número não depender do
                conteúdo: sem isto, a equipa com saídas tem o selo largo e a
                vizinha não, e as duas contagens não caem no mesmo sítio. */}
            <div className="md:w-full md:text-right">
                <span
                    className={cn(
                        'font-mono text-sm tabular',
                        noLivro === 0 ? 'text-graphite-48' : 'text-graphite',
                    )}
                >
                    {numero(noLivro)}
                </span>
                {saidos > 0 && (
                    <Selo
                        tinta="neutro"
                        traco="leve"
                        title={`${saidos} já saíram com data registada`}
                    >
                        {saidos} saiu{saidos === 1 ? '' : 'ram'}
                    </Selo>
                )}
            </div>

            <div className="md:w-full md:text-right">
                <NumeroComDetalhe
                    contagem={tarefas}
                    descricao="tarefas"
                    itens={tarefas > 0 ? [`${tarefas} tarefas atribuídas`] : []}
                />
            </div>

            <div className="flex justify-end md:w-full md:justify-end">
                <button
                    type="button"
                    onClick={aoEditar}
                    title={`Corrigir ${equipa.nome}`}
                    className="grid size-8 shrink-0 place-items-center border border-graphite-32 text-graphite-64 transition-colors hover:border-graphite hover:bg-graphite-04 hover:text-graphite focus-visible:border-amber focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none"
                >
                    <Pencil aria-hidden className="size-3.5" />
                    <span className="sr-only">Corrigir {equipa.nome}</span>
                </button>
            </div>
        </div>
    );
}
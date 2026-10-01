import { Head } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { CabecalhoFolha } from '@/Components/brand/cabecalho-folha';
import { GRELHA_REGISTOS, useOrdem } from '@/Components/brand/cabecalho-cota';
import { Carimbo } from '@/Components/brand/carimbo';
import { useBusca } from '@/Components/brand/contexto-busca';
import { FiltroChip, FiltrosFolha } from '@/Components/brand/filtros-folha';
import { FolhaRegistos } from '@/Components/brand/folha-registos';
import { ListaColuna } from '@/Components/brand/lista-coluna';
import { TextoLongo } from '@/Components/brand/texto-longo';
import { ComDica } from '@/Components/ui/dica';
import { Selo } from '@/Components/ui/badge';
import { Botao } from '@/Components/ui/button';
import { useSgo } from '@/Data/SgoContext';
import type { Area } from '@/Data/types';
import { LayoutAdmin } from '@/Layouts/LayoutAdmin';
import { dataExtenso, iniciais, normalizar, numero } from '@/lib/format';
import { cn } from '@/lib/utils';

import { ModalArea } from './ModalArea';

/**
 * `/admin/areas` — quem responde por cada frente da obra.
 *
 * Uma área é uma resposta, não um departamento: existe alguém a quem se pergunta
 * quando a Electricidade falha. Por isso a folha põe o responsável logo à
 * esquerda do nome e nunca o esconde numa coluna de fim — se um director de obra
 * tem de abrir a ficha para saber a quem pertence cada área, a área não está
 * escrita onde devia estar.
 *
 * O Projectos conta quantos estão a cargo de cada área, porque é essa contagem
 * que diz se uma área existe ou é um nome vazio. A pessoa responsável vem do
 * registo de utilizadores: um nome escrito à mão aqui duplicaria a pessoa e
 * acabaria por divergir dela.
 */
export default function Areas() {
    const { estado, utilizadorEfectivo } = useSgo();
    const { termo, limpar } = useBusca();

    const [comProjectos, definirComProjectos] = useState<'todas' | 'com' | 'sem'>('todas');
    const [ficha, definirFicha] = useState<{ aberto: boolean; area: Area | null }>({
        aberto: false,
        area: null,
    });

    const { ordem, alternar, ordenar } = useOrdem(COLUNAS, 'nome');

    const linhas = useMemo(() => {
        const alvo = normalizar(termo.trim());

        return estado.areas
            .map((area) => {
                const projectos = estado.projectos.filter(
                    (projecto) => projecto.areaId === area.id,
                );
                const responsavel = estado.utilizadores.find(
                    (utilizador) => utilizador.id === area.responsavelId,
                );

                return {
                    area,
                    responsavel: responsavel ?? null,
                    projectos: projectos.length,
                    emExecucao: projectos.filter((projecto) => projecto.estadoGeral === 'em_execucao')
                        .length,
                };
            })
            .filter((linha) => {
                if (comProjectos === 'com' && linha.projectos === 0) {
                    return false;
                }

                if (comProjectos === 'sem' && linha.projectos > 0) {
                    return false;
                }

                if (alvo.length === 0) {
                    return true;
                }

                return normalizar(
                    `${linha.area.nome} ${linha.area.descricao} ${linha.responsavel?.nome ?? ''}`,
                ).includes(alvo);
            });
    }, [comProjectos, estado.areas, estado.projectos, estado.utilizadores, termo]);

    const ordenadas = useMemo(() => ordenar(linhas), [linhas, ordenar]);

    const semProjectos = estado.areas.filter(
        (area) => !estado.projectos.some((projecto) => projecto.areaId === area.id),
    ).length;

    const semResponsavel = estado.areas.filter((area) => area.responsavelId === null).length;

    const termoActivo = termo.trim().length > 0;

    return (
        <LayoutAdmin>
            <Head title="Áreas — SGO">
                <meta
                    name="description"
                    content="As frentes da obra e quem responde por cada uma."
                />
            </Head>

            <div className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6">
                <div className="space-y-12">
                    <CabecalhoFolha
                        cota="Pasta de obra · Sistema"
                        titulo="Áreas"
                        linha={
                            <>
                                {estado.areas.length} áreas ·{' '}
                                {semProjectos === 0
                                    ? 'todas a cargo de pelo menos um projecto'
                                    : `${semProjectos} sem projecto atribuído`}
                                {semResponsavel > 0 && ` · ${semResponsavel} sem responsável`}
                                . A ver como{' '}
                                <span className="font-medium text-graphite">
                                    {utilizadorEfectivo.nome}
                                </span>
                                .
                            </>
                        }
                        anotacao="Uma área é uma resposta: existe alguém a quem se pergunta quando a frente falha. O responsável vem do registo de utilizadores, não se escreve aqui."
                        acoes={
                            <Botao
                                traco="firme"
                                onClick={() => definirFicha({ aberto: true, area: null })}
                            >
                                <Plus aria-hidden />
                                Nova área
                            </Botao>
                        }
                        medicoes={[
                            {
                                rotulo: 'Áreas',
                                valor: numero(estado.areas.length),
                                nota: 'frentes registadas',
                            },
                            {
                                rotulo: 'Com projectos',
                                valor: numero(estado.areas.length - semProjectos),
                                nota: 'a receber obra',
                            },
                            {
                                rotulo: 'Sem projecto',
                                valor: numero(semProjectos),
                                nota: 'sem obra atribuída',
                            },
                            {
                                rotulo: 'Sem responsável',
                                valor: numero(semResponsavel),
                                nota: 'ninguém responde',
                            },
                        ]}
                        folha="06 / 08"
                    />

                    <FiltrosFolha
                        direita={
                            termoActivo ? (
                                <>
                                    {ordenadas.length} de {estado.areas.length} linhas · «
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
                            premido={comProjectos === 'todas'}
                            aoPremir={() => definirComProjectos('todas')}
                            contagem={estado.areas.length}
                        >
                            Todas
                        </FiltroChip>

                        <FiltroChip
                            premido={comProjectos === 'com'}
                            aoPremir={() =>
                                definirComProjectos(comProjectos === 'com' ? 'todas' : 'com')
                            }
                            contagem={estado.areas.length - semProjectos}
                        >
                            Com projecto
                        </FiltroChip>

                        <FiltroChip
                            premido={comProjectos === 'sem'}
                            aoPremir={() =>
                                definirComProjectos(comProjectos === 'sem' ? 'todas' : 'sem')
                            }
                            contagem={semProjectos}
                        >
                            Sem projecto
                        </FiltroChip>
                    </FiltrosFolha>

                    <FolhaRegistos
                        titulo="Áreas · uma linha por frente"
                        grelha={GRELHA}
                        linhas={ordenadas}
                        chaveDe={(linha) => linha.area.id}
                        vazio={
                            termoActivo || comProjectos !== 'todas'
                                ? 'Nenhuma área corresponde a estes filtros.'
                                : 'Ainda não há áreas nesta sessão.'
                        }
                        colunas={COLUNAS}
                        ordem={ordem}
                        alternar={alternar}
                    >
                        {(linha) => (
                            <LinhaArea
                                linha={linha}
                                aoEditar={() => definirFicha({ aberto: true, area: linha.area })}
                            />
                        )}
                    </FolhaRegistos>

                    <Carimbo
                        identidade="SGO · ÁREA"
                        className="w-[280px]"
                        linhas={[
                            { chave: 'Emitido', valor: dataExtenso(new Date()) },
                            { chave: 'Revisão', valor: 'C' },
                            { chave: 'Linhas', valor: `${ordenadas.length} de ${estado.areas.length}` },
                            { chave: 'Projectos', valor: numero(estado.projectos.length) },
                        ]}
                        rodado={-1}
                    />
                </div>

                <p className="sr-only" aria-live="polite">
                    {ordenadas.length} de {estado.areas.length} áreas na folha.
                </p>
            </div>

            <ModalArea
                aberto={ficha.aberto}
                area={ficha.area}
                aoFechar={() => definirFicha({ aberto: false, area: null })}
            />
        </LayoutAdmin>
    );
}

interface Linha {
    area: Area;
    responsavel: { nome: string; activo: boolean } | null;
    projectos: number;
    emExecucao: number;
}

const GRELHA = `${GRELHA_REGISTOS} md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.1fr)_112px_40px]`;

const COLUNAS = [
    { chave: 'nome', cota: 'Área', valor: (linha: Linha) => linha.area.nome },
    {
        chave: 'responsavel',
        cota: 'Responsável',
        valor: (linha: Linha) => linha.responsavel?.nome ?? '',
    },
    {
        chave: 'descricao',
        cota: 'Âmbito',
        valor: (linha: Linha) => linha.area.descricao,
    },
    {
        chave: 'projectos',
        cota: 'Projectos',
        alinhamento: 'direita' as const,
        valor: (linha: Linha) => linha.projectos,
    },
    { chave: 'accao', cota: '', valor: () => '' },
];

function LinhaArea({ linha, aoEditar }: { linha: Linha; aoEditar: () => void }) {
    const { area, responsavel, projectos, emExecucao } = linha;

    return (
        <div className={cn(GRELHA, projectos === 0 && 'bg-paper-sunken/60')}>
            <div className="min-w-0">
                <p className="font-medium text-graphite">
                    <TextoLongo texto={area.nome} />
                </p>
                {area.descricao && (
                    <p className="text-xs text-graphite-64 md:hidden">
                        <TextoLongo texto={area.descricao} />
                    </p>
                )}
            </div>

            <div className="min-w-0">
                {responsavel ? (
                    <p className="flex min-w-0 items-center gap-2 text-sm">
                        <span
                            aria-hidden
                            className="grid size-6 shrink-0 place-items-center border border-graphite-32 font-mono text-2xs text-graphite-64"
                        >
                            {iniciais(responsavel.nome)}
                        </span>
                        <span
                            className={cn(
                                'min-w-0 flex-1',
                                responsavel.activo ? 'text-graphite' : 'text-graphite-48',
                            )}
                        >
                            <TextoLongo texto={responsavel.nome} />
                        </span>
                        {!responsavel.activo && (
                            <Selo tinta="grafite" traco="pontilhado" title="Responsável inactivo">
                                inactivo
                            </Selo>
                        )}
                    </p>
                ) : (
                    // Uma frente sem ninguém é o pior estado de uma área, e o
                    // lápis vermelho aqui não é exagero: é a mesma tinta da
                    // rejeição, porque a folha está a dizer que falta resposta.
                    <Selo tinta="lapis" traco="pontilhado">
                        sem responsável
                    </Selo>
                )}
            </div>

            <p className="min-w-0 text-sm text-graphite-64">
                <TextoLongo texto={area.descricao ?? ''} />
            </p>

            {/* Ver `ListaColuna`: a coluna fica com origem fixa e as frentes
                abrem-se na pista ou na janela. */}
            <div className="md:w-full md:text-right">
                <ListaColuna
                    contagem={projectos}
                    descricao="projectos"
                    itens={emExecucao > 0 ? [`${numero(emExecucao)} em execução`] : []}
                />
            </div>

            <div className="flex justify-end md:w-full md:justify-end">
                <ComDica texto={`Corrigir ${area.nome}`}>
                    <button
                        type="button"
                        onClick={aoEditar}
                        className="grid size-8 shrink-0 place-items-center border border-graphite-32 text-graphite-64 transition-colors hover:border-graphite hover:bg-graphite-04 hover:text-graphite focus-visible:border-amber focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none"
                    >
                        <Pencil aria-hidden className="size-3.5" />
                        <span className="sr-only">Corrigir {area.nome}</span>
                    </button>
                </ComDica>
            </div>
        </div>
    );
}
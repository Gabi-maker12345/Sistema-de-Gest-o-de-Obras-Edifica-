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
import { Botao } from '@/Components/ui/button';
import { Selo } from '@/Components/ui/badge';
import { useSgo } from '@/Data/SgoContext';
import type { PerfilUtilizador, Utilizador } from '@/Data/types';
import { LayoutAdmin } from '@/Layouts/LayoutAdmin';
import { dataExtenso, iniciais, normalizar, numero } from '@/lib/format';
import { ROTULOS, rotuloPerfil, rotuloPapel } from '@/lib/rotulos';
import { cn } from '@/lib/utils';

import { ModalUtilizador } from './ModalUtilizador';

/**
 * `/admin/utilizadores` — quem trabalha na obra e com que perfil.
 *
 * O eixo desta folha não é o tempo: é a identidade. Uma linha por pessoa, com o
 * perfil global e os projectos de que tem acesso contados à mão, porque a
 * pergunta que esta folha responde é «quem pode mexer em quê» — e a resposta
 * está nas duas colunas ao lado do nome.
 *
 * O perfil global e o papel no projecto aparecem sempre em separado. Uma
 * consulta num projecto não é o mesmo que um perfil de consulta, e uma folha que
 * misturasse as duas coisas ensinaria a coisa errada.
 */
export default function Utilizadores() {
    const { estado, utilizadorEfectivo, perfilEfectivo } = useSgo();
    const { termo, limpar } = useBusca();

    const [perfilFiltro, definirPerfilFiltro] = useState<PerfilUtilizador | 'todos'>('todos');
    const [ficha, definirFicha] = useState<{ aberto: boolean; utilizador: Utilizador | null }>({
        aberto: false,
        utilizador: null,
    });

    const { ordem, alternar, ordenar } = useOrdem(COLUNAS, 'nome');

    const filtradas = useMemo(() => {
        const alvo = normalizar(termo.trim());

        return estado.utilizadores
            .map((utilizador) => ({
                utilizador,
                projectos: estado.acessos.filter((acesso) => acesso.utilizadorId === utilizador.id)
                    .length,
                papeis: [...new Set(
                    estado.acessos
                        .filter((acesso) => acesso.utilizadorId === utilizador.id)
                        .map((acesso) => rotuloPapel(acesso.papel)),
                )],
            }))
            .filter((linha) => {
                if (perfilFiltro !== 'todos' && linha.utilizador.perfil !== perfilFiltro) {
                    return false;
                }

                if (alvo.length === 0) {
                    return true;
                }

                return normalizar(
                    `${linha.utilizador.nome} ${linha.utilizador.email} ${
                        linha.utilizador.cargo ?? ''
                    } ${ROTULOS.perfil[linha.utilizador.perfil]} ${linha.papeis.join(' ')}`,
                ).includes(alvo);
            });
    }, [estado.acessos, estado.utilizadores, perfilFiltro, termo]);

    // O filtro escolhe o que entra; a ordenação decide em que ordem se lê. São
    // dois gestos diferentes e por isso vivem em dois sítios.
    const linhas = useMemo(() => ordenar(filtradas), [filtradas, ordenar]);

    const contarPorPerfil = useMemo(() => {
        const conta: Partial<Record<PerfilUtilizador, number>> = {};

        for (const utilizador of estado.utilizadores) {
            conta[utilizador.perfil] = (conta[utilizador.perfil] ?? 0) + 1;
        }

        return conta;
    }, [estado.utilizadores]);

    const comAcesso = estado.utilizadores.filter((utilizador) =>
        estado.acessos.some((acesso) => acesso.utilizadorId === utilizador.id),
    ).length;

    const termoActivo = termo.trim().length > 0;

    return (
        <LayoutAdmin>
            <Head title="Utilizadores — SGO">
                <meta
                    name="description"
                    content="Quem trabalha na obra, com que perfil global e com que projectos atribuídos."
                />
            </Head>

            <div className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6">
                <div className="space-y-12">
                    <CabecalhoFolha
                        cota="Pasta de obra · Sistema"
                        titulo="Utilizadores"
                        linha={
                            <>
                                {estado.utilizadores.length} pessoas registadas · a ver como{' '}
                                <span className="font-medium text-graphite">
                                    {utilizadorEfectivo.nome}
                                </span>{' '}
                                ({rotuloPerfil(perfilEfectivo)}).
                            </>
                        }
                        anotacao="O perfil é global e vale em todo o produto. Quem chega a um projecto é o papel, atribuído na aba Acessos de cada obra."
                        acoes={
                            <Botao
                                traco="firme"
                                onClick={() => definirFicha({ aberto: true, utilizador: null })}
                            >
                                <Plus aria-hidden />
                                Novo utilizador
                            </Botao>
                        }
                        medicoes={[
                            {
                                rotulo: 'Registados',
                                valor: numero(estado.utilizadores.length),
                                nota: 'pessoas com conta',
                            },
                            {
                                rotulo: 'Activos',
                                valor: numero(
                                    estado.utilizadores.filter((u) => u.activo).length,
                                ),
                                nota: 'entram nas listas',
                            },
                            {
                                rotulo: 'Com projectos',
                                valor: numero(comAcesso),
                                nota: 'pelo menos um acesso',
                            },
                            {
                                rotulo: 'Acessos',
                                valor: numero(estado.acessos.length),
                                nota: 'papéis atribuídos',
                            },
                            {
                                rotulo: 'Administradores',
                                valor: numero(contarPorPerfil.administrador_proprietario ?? 0),
                                nota: 'veem tudo',
                            },
                            {
                                rotulo: 'Consulta',
                                valor: numero(contarPorPerfil.consulta ?? 0),
                                nota: 'só leem',
                            },
                        ]}
                        folha="07 / 08"
                    />

                    <FiltrosFolha
                        direita={
                            termoActivo ? (
                                <>
                                    {linhas.length} de {estado.utilizadores.length} linhas · «
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
                            premido={perfilFiltro === 'todos'}
                            aoPremir={() => definirPerfilFiltro('todos')}
                            contagem={estado.utilizadores.length}
                        >
                            Todos
                        </FiltroChip>

                        {(
                            Object.entries(ROTULOS.perfil) as Array<[PerfilUtilizador, string]>
                        ).map(([chave, rotulo]) => (
                            <FiltroChip
                                key={chave}
                                premido={perfilFiltro === chave}
                                aoPremir={() =>
                                    definirPerfilFiltro(perfilFiltro === chave ? 'todos' : chave)
                                }
                                contagem={contarPorPerfil[chave] ?? 0}
                            >
                                {rotulo}
                            </FiltroChip>
                        ))}
                    </FiltrosFolha>

                    <FolhaRegistos
                        titulo="Pessoas · uma linha por registo"
                        grelha={GRELHA}
                        linhas={linhas}
                        chaveDe={(linha) => linha.utilizador.id}
                        vazio={
                            termoActivo || perfilFiltro !== 'todos'
                                ? 'Nenhum utilizador corresponde a estes filtros.'
                                : 'Ainda não há utilizadores nesta sessão.'
                        }
                        colunas={COLUNAS}
                        ordem={ordem}
                        alternar={alternar}
                    >
                        {(linha) => (
                            <LinhaUtilizador
                                linha={linha}
                                aoEditar={() =>
                                    definirFicha({ aberto: true, utilizador: linha.utilizador })
                                }
                            />
                        )}
                    </FolhaRegistos>

                    <Carimbo
                        identidade="SGO · UTILIZADOR"
                        className="w-[280px]"
                        linhas={[
                            { chave: 'Emitido', valor: dataExtenso(new Date()) },
                            { chave: 'Revisão', valor: 'C' },
                            { chave: 'Linhas', valor: `${linhas.length} de ${estado.utilizadores.length}` },
                            { chave: 'Acessos', valor: numero(estado.acessos.length) },
                        ]}
                        rodado={-2}
                    />
                </div>

                <p className="sr-only" aria-live="polite">
                    {linhas.length} de {estado.utilizadores.length} utilizadores na folha.
                </p>
            </div>

            <ModalUtilizador
                aberto={ficha.aberto}
                utilizador={ficha.utilizador}
                aoFechar={() => definirFicha({ aberto: false, utilizador: null })}
            />
        </LayoutAdmin>
    );
}

interface Linha {
    utilizador: Utilizador;
    projectos: number;
    papeis: string[];
}

/**
 * A grelha e as colunas vivem aqui porque a linha e a cabeça têm de medir a
 * mesma coisa — é a mesma regra que o painel segue com `COLUNAS` e `GRELHA`.
 */
// A última coluna é o selo de estado mais o lápis. A 40px só cabia o lápis, e o
// selo saía 49px da célula e caía em cima da linha seguinte. 104px é o que o
// selo "Inactivo" mede com o nome ao lado.
const GRELHA = `${GRELHA_REGISTOS} md:grid-cols-[minmax(0,1.4fr)_140px_minmax(0,1fr)_minmax(0,1fr)_124px_104px]`;

const COLUNAS = [
    { chave: 'nome', cota: 'Utilizador', valor: (linha: Linha) => linha.utilizador.nome },
    {
        chave: 'perfil',
        cota: 'Perfil',
        valor: (linha: Linha) => linha.utilizador.perfil,
    },
    {
        chave: 'cargo',
        cota: 'Cargo',
        valor: (linha: Linha) => linha.utilizador.cargo ?? '',
    },
    {
        chave: 'contacto',
        cota: 'Contacto',
        valor: (linha: Linha) => linha.utilizador.email,
    },
    {
        chave: 'projectos',
        cota: 'Projectos',
        alinhamento: 'direita' as const,
        valor: (linha: Linha) => linha.projectos,
    },
    { chave: 'accao', cota: '', valor: () => '' },
];

function LinhaUtilizador({ linha, aoEditar }: { linha: Linha; aoEditar: () => void }) {
    const { utilizador } = linha;
    const inactivo = !utilizador.activo;

    return (
        <div className={cn(GRELHA, inactivo && 'hachura-45 bg-paper-sunken/60')}>
            <div className="min-w-0">
                <p className="flex items-center font-medium text-graphite">
                    <span
                        aria-hidden
                        className="mr-2 inline-grid size-6 shrink-0 place-items-center border border-graphite-32 font-mono text-2xs text-graphite-64 align-middle"
                    >
                        {iniciais(utilizador.nome)}
                    </span>
                    <span className="min-w-0">
                        <TextoLongo texto={utilizador.nome} />
                    </span>
                </p>
            </div>

            {/* «Fiscal/Responsável de Obra» foi o caso que primeiro mostrou o problema:
                26 caracteres numa coluna estreita. Não abre janela — é curto
                demais para isso — mas é cortado, por isso leva a pista. */}
            <div className="min-w-0 text-sm text-graphite">
                <TextoLongo texto={rotuloPerfil(utilizador.perfil)} />
            </div>

            <div className="min-w-0 text-sm text-graphite-64">
                <TextoLongo texto={utilizador.cargo ?? ''} />
            </div>

            {/* O email é mais largo que a coluna e o telefone fica ao lado. Sem
                `flex-1` no email, o flex dá-lhe a largura que o conteúdo pede e o
                telefone sai da célula — era o email a cair em cima da linha
                seguinte. O telefone encolhe; o email é que cede. */}
            <div className="min-w-0 text-sm text-graphite-64">
                <p className="flex min-w-0 items-baseline gap-2">
                    <span className="min-w-0 flex-1">
                        <TextoLongo texto={utilizador.email} className="font-mono text-xs" />
                    </span>
                    {utilizador.telefone && (
                        <span className="cota min-w-0 shrink truncate">{utilizador.telefone}</span>
                    )}
                </p>
            </div>

            {/* A coluna dos projectos encolhe ao conteúdo quando o utilizador
                tem três papéis e o seu vizinho não tem nenhum, e aí o número
                deixa de cair no mesmo sítio da coluna. `w-full` + `text-right`
                dá-lhe sempre a mesma origem; a lista de papéis vive na pista. */}
            <div className="md:w-full md:text-right">
                <ListaColuna
                    contagem={linha.projectos}
                    descricao="projectos"
                    itens={linha.papeis}
                />
            </div>

            {/* O selo e o lápis dividem a célula. `justify-between` sem `shrink-0` dá ao
                selo a largura do conteúdo e empurra o lápis para fora — o texto
                saía 49px da célula. O selo fica com a largura que precisa, o
                lápis encosta à direita. */}
            <div className="flex min-w-0 items-center justify-end gap-2 md:w-full">
                <Selo
                    tinta="grafite"
                    traco={inactivo ? 'pontilhado' : 'medio'}
                    title={inactivo ? 'Inactivo' : 'Activo'}
                >
                    {inactivo ? 'Inactivo' : 'Activo'}
                </Selo>

                <ComDica texto={`Corrigir ${utilizador.nome}`}>
                    <button
                        type="button"
                        onClick={aoEditar}
                        className="grid size-8 shrink-0 place-items-center border border-graphite-32 text-graphite-64 transition-colors hover:border-graphite hover:bg-graphite-04 hover:text-graphite focus-visible:border-amber focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none"
                    >
                        <Pencil aria-hidden className="size-3.5" />
                        <span className="sr-only">Corrigir {utilizador.nome}</span>
                    </button>
                </ComDica>
            </div>
        </div>
    );
}
import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { CabecalhoFolha } from '@/Components/brand/cabecalho-folha';
import { Carimbo } from '@/Components/brand/carimbo';
import { useBusca } from '@/Components/brand/contexto-busca';
import { EspelhoDeDatas, LegendaEspelho } from '@/Components/brand/espelho-datas';
import { FiltroChip, FiltrosFolha } from '@/Components/brand/filtros-folha';
import { Botao } from '@/Components/ui/button';
import { Combo } from '@/Components/ui/combobox';
import { useSgo } from '@/Data/SgoContext';
import type { EstadoProjecto, Projecto } from '@/Data/types';
import { LayoutAdmin } from '@/Layouts/LayoutAdmin';
import { dominioDe, hoje, janelaDe } from '@/lib/espelho';
import type { Janela } from '@/lib/espelho';
import { dataExtenso, moeda, moedaCompacta, numero, normalizar } from '@/lib/format';
import { ROTULOS, rotuloPerfil } from '@/lib/rotulos';

import { ModalProjecto } from './ModalProjecto';

/**
 * `/admin/projectos` — o espelho de datas.
 *
 * A folha inteira é uma medição contra o calendário. Cada obra é uma janela
 * desenhada no eixo dos meses e o que o gestor procura — onde está a frente da
 * obra em relação ao prazo — lê-se sem passar o dedo pelos números. Os números
 * estão à direita, mas como margem de leitura, não como conteúdo.
 *
 * O eixo é comum a todas as janelas de propósito. Com um eixo por obra todas
 * mediriam o mesmo comprimento e o desenho deixaria de comparar, que é a única
 * razão para existirem eixos: o filtro estreita a lista, nunca redimensiona o
 * desenho.
 */
export default function Projectos() {
    const {
        projectosVisiveis,
        execucaoFisica,
        execucaoFinanceira,
        estado,
        perfilEfectivo,
        utilizadorEfectivo,
    } = useSgo();
    const { termo, limpar } = useBusca();

    const [estadoFiltro, definirEstadoFiltro] = useState<'todos' | EstadoProjecto>('todos');
    const [areaFiltro, definirAreaFiltro] = useState<string | null>(null);
    const [ficha, definirFicha] = useState<{ aberto: boolean; projecto: Projecto | null }>({
        aberto: false,
        projecto: null,
    });

    const referencia = useMemo(() => hoje(), []);

    const todasAsJanelas = useMemo<Janela[]>(
        () =>
            projectosVisiveis.map((projecto) =>
                janelaDe(
                    projecto,
                    execucaoFisica(projecto.id),
                    execucaoFinanceira(projecto.id),
                    referencia,
                ),
            ),
        [projectosVisiveis, execucaoFisica, execucaoFinanceira, referencia],
    );

    const dominio = useMemo(
        () => dominioDe(todasAsJanelas, referencia),
        [todasAsJanelas, referencia],
    );

    const janelas = useMemo(() => {
        const alvo = normalizar(termo.trim());

        return todasAsJanelas.filter((janela) => {
            const { projecto } = janela;

            if (estadoFiltro !== 'todos' && projecto.estadoGeral !== estadoFiltro) {
                return false;
            }

            if (areaFiltro !== null && projecto.areaId !== areaFiltro) {
                return false;
            }

            if (alvo.length === 0) {
                return true;
            }

            return normalizar(
                `${projecto.nome} ${projecto.cliente} ${projecto.morada} ${
                    ROTULOS.estadoProjecto[projecto.estadoGeral]
                }`,
            ).includes(alvo);
        });
    }, [todasAsJanelas, estadoFiltro, areaFiltro, termo]);

    // A numeração da folha segue a lista filtrada, para a cota «01» ser sempre a
    // primeira linha que se está a ler e não a primeira do seed.
    const numeros = useMemo(() => {
        const mapa = new Map<string, number>();

        janelas.forEach((janela, indice) => mapa.set(janela.projecto.id, indice + 1));

        return mapa;
    }, [janelas]);

    const nomesDeArea = useMemo(
        () =>
            Object.fromEntries(estado.areas.map((area) => [area.id, area.nome])) as Record<
                string,
                string
            >,
        [estado.areas],
    );

    const contarPorEstado = useMemo(() => {
        const conta: Partial<Record<EstadoProjecto, number>> = {};

        for (const janela of todasAsJanelas) {
            const chave = janela.projecto.estadoGeral;

            conta[chave] = (conta[chave] ?? 0) + 1;
        }

        return conta;
    }, [todasAsJanelas]);

    const emAtraso = janelas.filter((janela) => janela.prazoEstourado).length;
    const termoActivo = termo.trim().length > 0;

    return (
        <LayoutAdmin>
            <Head title="Projectos">
                <meta
                    name="description"
                    content="Espelho de datas dos projectos: a janela de cada obra contra o calendário, com as duas execuções e o desvio."
                />
            </Head>

            <div className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6">
                <div className="space-y-12">
                    <CabecalhoFolha
                        cota="Pasta de obra · Projectos"
                        titulo="Projectos"
                        linha={
                            <>
                                {projectosVisiveis.length} obras visíveis para{' '}
                                <span className="font-medium text-graphite">
                                    {utilizadorEfectivo.nome}
                                </span>{' '}
                                · {rotuloPerfil(perfilEfectivo)}.
                            </>
                        }
                        anotacao="Cada linha é a janela da obra no calendário: a frente é o que está erguido, a hachura é o que está aprovado. A régua vertical é hoje."
                        acoes={
                            <Botao
                                traco="firme"
                                onClick={() => definirFicha({ aberto: true, projecto: null })}
                            >
                                <Plus aria-hidden />
                                Novo projecto
                            </Botao>
                        }
                        medicoes={medicoes(todasAsJanelas, estado.areas.length, emAtraso)}
                        folha="02 / 08"
                    />

                    <section aria-labelledby="espelho" className="space-y-3">
                        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-graphite-32 pb-2">
                            <h2 id="espelho" className="cota text-graphite">
                                Espelho de datas · uma janela por obra
                            </h2>

                            {termoActivo && (
                                <p className="cota flex items-center gap-2">
                                    <span>
                                        {janelas.length} de {todasAsJanelas.length} janelas · «
                                        {termo.trim()}»
                                    </span>
                                    <button
                                        type="button"
                                        onClick={limpar}
                                        className="font-sans text-xs text-graphite underline underline-offset-2 hover:text-graphite-64"
                                    >
                                        limpar
                                    </button>
                                </p>
                            )}
                        </div>

                        <FiltrosFolha
                            direita={
                                <p className="cota">
                                    {emAtraso > 0 ? (
                                        <>
                                            {emAtraso} com prazo fechado
                                        </>
                                    ) : (
                                        'nenhuma obra com prazo fechado'
                                    )}
                                </p>
                            }
                        >
                            <FiltroChip
                                premido={estadoFiltro === 'todos'}
                                aoPremir={() => definirEstadoFiltro('todos')}
                                contagem={todasAsJanelas.length}
                            >
                                Todos
                            </FiltroChip>

                            {(
                                Object.entries(ROTULOS.estadoProjecto) as Array<
                                    [EstadoProjecto, string]
                                >
                            ).map(([chave, rotulo]) => (
                                <FiltroChip
                                    key={chave}
                                    premido={estadoFiltro === chave}
                                    aoPremir={() =>
                                        definirEstadoFiltro(
                                            estadoFiltro === chave ? 'todos' : chave,
                                        )
                                    }
                                    contagem={contarPorEstado[chave] ?? 0}
                                >
                                    {rotulo}
                                </FiltroChip>
                            ))}

                            <Combo
                                className="w-56"
                                valor={areaFiltro}
                                aoEscolher={definirAreaFiltro}
                                aoLimpar={() => definirAreaFiltro(null)}
                                placeholder="Todas as áreas"
                                opcoes={estado.areas.map((area) => ({
                                    valor: area.id,
                                    rotulo: area.nome,
                                }))}
                            />
                        </FiltrosFolha>

                        <LegendaEspelho />

                        <EspelhoDeDatas
                            janelas={janelas}
                            dominio={dominio}
                            referencia={referencia}
                            numeroDe={(id) => numeros.get(id) ?? 0}
                            areas={nomesDeArea}
                            vazio={
                                termoActivo || estadoFiltro !== 'todos' || areaFiltro !== null
                                    ? 'Nenhum projecto corresponde a estes filtros.'
                                    : 'Este perfil não tem projectos atribuídos na aba Acessos.'
                            }
                        />
                    </section>

                    <Carimbo
                        identidade="SGO · PROJECTO"
                        className="w-[280px]"
                        linhas={[
                            { chave: 'Emitido', valor: dataExtenso(new Date()) },
                            { chave: 'Revisão', valor: 'C' },
                            { chave: 'Janelas', valor: `${janelas.length} de ${todasAsJanelas.length}` },
                            {
                                chave: 'Contratual',
                                valor: moeda(
                                    janelas.reduce(
                                        (soma, janela) => soma + janela.projecto.valorContratual,
                                        0,
                                    ),
                                ),
                            },
                        ]}
                        rodado={-2}
                    />
                </div>

                <p className="sr-only" aria-live="polite">
                    {janelas.length} de {todasAsJanelas.length} projectos na folha.
                </p>
            </div>

            <ModalProjecto
                aberto={ficha.aberto}
                projecto={ficha.projecto}
                aoFechar={() => definirFicha({ aberto: false, projecto: null })}
            />
        </LayoutAdmin>
    );
}

/**
 * As seis leituras que mandam no canto da folha. O que entra aqui é o que se lê
 * primeiro e o que decide se a folha é triste: quantas obras estão vivas, a
 * frente média e quantas fecharam o prazo com trabalho por fazer.
 */
function medicoes(janelas: Janela[], areas: number, emAtraso: number) {
    const vivas = janelas.filter((janela) => janela.projecto.estadoGeral === 'em_execucao');
    const media = (valores: number[]) =>
        valores.length === 0 ? 0 : valores.reduce((soma, valor) => soma + valor, 0) / valores.length;
    const contratual = janelas.reduce(
        (soma, janela) => soma + janela.projecto.valorContratual,
        0,
    );

    return [
        {
            rotulo: 'Projectos visíveis',
            valor: numero(janelas.length),
            nota: 'com acesso atribuído',
        },
        {
            rotulo: 'Em execução',
            valor: numero(vivas.length),
            nota: 'com obra a decorrer',
        },
        {
            rotulo: 'Execução física',
            valor: String(Math.round(media(janelas.map((janela) => janela.fisica)))),
            unidade: '%',
            nota: 'média das janelas',
        },
        {
            rotulo: 'Prazo fechado',
            valor: numero(emAtraso),
            critico: emAtraso > 0,
            nota: emAtraso > 0 ? 'com obra por fazer' : 'sem atrasos',
        },
        {
            rotulo: 'Áreas',
            valor: numero(areas),
            nota: 'especialidades',
        },
        {
            rotulo: 'Contratual',
            valor: moedaCompacta(contratual),
            nota: 'soma das janelas',
        },
    ];
}
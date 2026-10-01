import { Head } from '@inertiajs/react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts';

import { BlocoTitulo } from '@/Components/brand/bloco-titulo';
import { Carimbo } from '@/Components/brand/carimbo';
import { LinhaCota } from '@/Components/brand/linha-cota';
import { QuadroMedicoes } from '@/Components/brand/quadro-medicoes';
import { EstadoSelo } from '@/Components/ui/badge';
import { Medidor } from '@/Components/ui/progress';
import { useBusca } from '@/Components/brand/contexto-busca';
import { useSgo } from '@/Data/SgoContext';
import { LayoutAdmin } from '@/Layouts/LayoutAdmin';
import { dataExtenso, moeda, numero } from '@/lib/format';
import type { Despesa, PapelProjecto, PerfilUtilizador } from '@/Data/types';
import { rotuloPapel, rotuloPerfil } from '@/lib/rotulos';
import { cn } from '@/lib/utils';

import { COLUNAS, GRELHA, numeroFolha, useLinhas } from './use-linhas-dashboard';
import type { Coluna, Linha } from './use-linhas-dashboard';

/**
 * `/admin/dashboard` — a folha de cotas.
 *
 * Três zonas separadas por 48px, como manda o contrato do painel. Em cima, o que
 * se lê primeiro: quem assina, o que está em risco, e as medições do desenho.
 * No meio, a cota: uma linha por projecto, com o estado, as duas execuções
 * separadas e o desvio entre elas. Em baixo, a comparação em gráfico e o que
 * está à espera de decisão — porque um painel só serve se disser o que fazer a
 * seguir.
 */
export default function Dashboard() {
    const {
        utilizadorEfectivo,
        perfilEfectivo,
        veTodosOsProjectos,
        papelEmProjecto,
        despesas,
        estado,
    } = useSgo();
    const { linhas, total, vaziaPorFiltro, termoActivo, ordem, alternar } = useLinhas();
    const { termo, limpar } = useBusca();

    const idsVisiveis = useMemo(() => new Set(linhas.map((linha) => linha.projecto.id)), [linhas]);

    const medicoes = useMemo(() => {
        const activas = linhas.filter(
            (linha) => linha.projecto.estadoGeral === 'em_execucao',
        ).length;
        const media = (valores: number[]) =>
            valores.length === 0 ? 0 : valores.reduce((soma, v) => soma + v, 0) / valores.length;

        const tarefas = estado.tarefas.filter((tarefa) => idsVisiveis.has(tarefa.projectoId));
        const emAtraso = tarefas.filter((tarefa) => tarefa.estado === 'atrasada').length;

        // Efectivo presente: o último diário registado em cada projecto, porque o
        // quadro mede quem está em obra hoje e não a soma de todos os dias.
        const efectivo = [...idsVisiveis].reduce((soma, id) => {
            const diario = estado.diarios
                .filter((registo) => registo.projectoId === id)
                .sort((a, b) => b.data.localeCompare(a.data))[0];

            return soma + (diario?.efectivoPresente ?? 0);
        }, 0);

        return {
            activas,
            fisicaMedia: media(linhas.map((linha) => linha.fisica)),
            financeiraMedia: media(linhas.map((linha) => linha.financeira)),
            pendentes: tarefas.filter((tarefa) => tarefa.estado !== 'concluida').length,
            emAtraso,
            efectivo,
        };
    }, [linhas, estado.tarefas, estado.diarios, idsVisiveis]);

    const aEspera = useMemo(
        () =>
            despesas
                .filter(
                    (despesa) =>
                        despesa.projectoId !== null &&
                        idsVisiveis.has(despesa.projectoId) &&
                        despesa.estadoAprovacao === 'pendente',
                )
                .sort((a, b) => b.valor - a.valor),
        [despesas, idsVisiveis],
    );

    return (
        <LayoutAdmin>
            <Head title="Painel — SGO">
                <meta
                    name="description"
                    content="Painel de gestão de projectos, obras e trabalho do SGO."
                />
            </Head>

            <div className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6">
                <div className="space-y-12">
                    <ZonaCabecalho
                        nome={utilizadorEfectivo.nome}
                        perfil={perfilEfectivo}
                        total={total}
                        veTodos={veTodosOsProjectos}
                        medicoes={medicoes}
                        aEspera={aEspera.length}
                    />

                    <ZonaCota
                        linhas={linhas}
                        total={total}
                        vaziaPorFiltro={vaziaPorFiltro}
                        termoActivo={termoActivo}
                        termo={termo}
                        aLimpar={limpar}
                        papelEmProjecto={papelEmProjecto}
                        ordem={ordem}
                        alternar={alternar}
                    />

                    <ZonaGrafico linhas={linhas} />

                    <ZonaEspera linhas={linhas} despesas={aEspera} />
                </div>

                <p className="sr-only" aria-live="polite">
                    {linhas.length} de {total} projectos visíveis.
                </p>
            </div>
        </LayoutAdmin>
    );
}

interface Medicoes {
    activas: number;
    fisicaMedia: number;
    financeiraMedia: number;
    pendentes: number;
    emAtraso: number;
    efectivo: number;
}

function ZonaCabecalho({
    nome,
    perfil,
    total,
    veTodos,
    medicoes,
    aEspera,
}: {
    nome: string;
    perfil: PerfilUtilizador;
    total: number;
    veTodos: boolean;
    medicoes: Medicoes;
    aEspera: number;
}) {
    return (
        <header className="flex flex-wrap items-start justify-between gap-8">
            <div className="min-w-0 max-w-md space-y-3">
                <p className="cota">Painel · folha de rosto</p>

                {/*
                 * O h1 é o assunto do dia, e o conteúdo tem de o igualar: um
                 * nome próprio acima de seis números a 11px era hierarquia
                 * invertida — o painel dizia "olá" em vez de dizer o estado da
                 * obra. A saudação é o que fica em baixo, como metadado.
                 */}
                <h1 className="text-4xl font-semibold tracking-tight text-graphite">
                    Situação da obra
                </h1>

                <p className="text-sm text-graphite-64">
                    {nome} · a ver como{' '}
                    <span className="font-medium text-graphite">{rotuloPerfil(perfil)}</span>.{' '}
                    {total} {total === 1 ? 'linha' : 'linhas'} para ler.
                </p>

                <p className="anotacao normal-case">
                    {veTodos
                        ? 'Administrador: vê todos os projectos, independentemente da aba Acessos.'
                        : 'Só entram nesta folha os projectos com acesso atribuído.'}
                </p>
            </div>

            <div className="w-full space-y-3 sm:w-[420px]">
                {/* O bloco de título do desenho é a massa escura da folha. Vai
                    sobre a tábua para ser a primeira coisa em que o olho cai,
                    e não uma faixa de números a cinzento sobre papel. */}
                <QuadroMedicoes
                    colunas={2}
                    superficie="tabua"
                    medicoes={[
                        {
                            rotulo: 'Projectos activos',
                            valor: String(medicoes.activas),
                            nota: 'em execução nesta folha',
                        },
                        {
                            rotulo: 'Execução física',
                            valor: `${Math.round(medicoes.fisicaMedia)}`,
                            unidade: '%',
                            nota: 'média das linhas',
                        },
                        {
                            rotulo: 'Execução financeira',
                            valor: `${Math.round(medicoes.financeiraMedia)}`,
                            unidade: '%',
                            nota: 'aprovado ÷ contratual',
                        },
                        {
                            rotulo: 'Tarefas pendentes',
                            valor: String(medicoes.pendentes),
                            nota: 'por fazer',
                        },
                        {
                            rotulo: 'Tarefas atrasadas',
                            valor: String(medicoes.emAtraso),
                            critico: medicoes.emAtraso > 0,
                            nota: medicoes.emAtraso > 0 ? 'Atraso detectado' : 'Sem atraso',
                        },
                        {
                            rotulo: 'Efectivo presente',
                            valor: String(medicoes.efectivo),
                            nota: 'último diário de cada projecto',
                        },
                    ]}
                />

                <BlocoTitulo
                    className="w-full"
                    folha="01 / 08"
                    escala="1:1"
                    revisao="C"
                    emitidoEm={dataExtenso(new Date())}
                />

                <p className="cota">
                    {aEspera > 0 && (
                        <span className="mr-2 inline-block border-2 border-red-pencil bg-red-pencil px-1.5 py-px font-semibold text-paper">
                            {aEspera} {aEspera === 1 ? 'despesa à espera' : 'despesas à espera'}
                        </span>
                    )}
                    {total} {total === 1 ? 'projecto visível' : 'projectos visíveis'}
                </p>
            </div>
        </header>
    );
}

function ZonaCota({
    linhas,
    total,
    vaziaPorFiltro,
    termoActivo,
    termo,
    aLimpar,
    papelEmProjecto,
    ordem,
    alternar,
}: {
    linhas: Linha[];
    total: number;
    vaziaPorFiltro: boolean;
    termoActivo: boolean;
    termo: string;
    aLimpar: () => void;
    papelEmProjecto: (projectoId: string) => PapelProjecto | null;
    ordem: { coluna: Coluna; sentido: 'asc' | 'desc' };
    alternar: (coluna: Coluna) => void;
}) {
    return (
        <section aria-labelledby="cota" className="space-y-2">
            {/* A zona fecha com régua dupla, como o bloco de desenho. Sem ela,
                as três zonas do painel eram só espaço em branco e o olho não
                sabia onde um assunto acabava e o seguinte começava. */}
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-graphite-32 pb-2">
                <h2 id="cota" className="cota text-graphite">
                    Projectos · uma linha por folha
                </h2>
                {termoActivo && (
                    <p className="cota flex items-center gap-2">
                        <span>
                            {linhas.length} de {total} linhas · «{termo.trim()}»
                        </span>
                        <button
                            type="button"
                            onClick={aLimpar}
                            className="font-sans text-xs text-graphite underline underline-offset-2 hover:text-graphite-64"
                        >
                            limpar
                        </button>
                    </p>
                )}
            </div>

            <LinhaCota
                colunas={COLUNAS.map((coluna) => coluna.cota)}
                grelha={GRELHA}
                className="hidden md:grid"
            />

            {linhas.length === 0 ? (
                <p className="border border-dashed border-graphite-32 p-6 text-sm text-graphite-64">
                    {vaziaPorFiltro
                        ? 'Nenhum projecto corresponde a esse texto.'
                        : 'Este perfil não tem projectos atribuídos na aba Acessos.'}
                </p>
            ) : (
                <>
                    <CabecalhoCota ordem={ordem} alternar={alternar} />

                    <ul>
                        {linhas.map((linha) => (
                            <LinhaProjecto
                                key={linha.projecto.id}
                                linha={linha}
                                total={total}
                                papel={papelEmProjecto(linha.projecto.id)}
                            />
                        ))}
                    </ul>
                </>
            )}
        </section>
    );
}

function CabecalhoCota({
    ordem,
    alternar,
}: {
    ordem: { coluna: Coluna; sentido: 'asc' | 'desc' };
    alternar: (coluna: Coluna) => void;
}) {
    return (
        <div className={`${GRELHA} hidden border-b border-graphite-20 pb-1.5 md:grid`}>
            {COLUNAS.map((coluna) => {
                const activa = ordem.coluna === coluna.chave;
                const Icone = !activa ? ArrowDown : ordem.sentido === 'asc' ? ArrowUp : ArrowDown;

                return (
                    <button
                        key={coluna.chave}
                        type="button"
                        onClick={() => alternar(coluna.chave)}
                        aria-label={
                            activa
                                ? `${coluna.cota}. Folha ordenada por ${coluna.cota}, ${
                                      ordem.sentido === 'asc' ? 'crescente' : 'decrescente'
                                  }. Premir para inverter.`
                                : `${coluna.cota}. Premir para ordenar a folha por esta coluna.`
                        }
                            className={
                                'flex items-center gap-1 font-mono text-2xs tracking-[0.08em] uppercase ' +
                                (coluna.alinhamento === 'direita' ? 'justify-end' : 'justify-start') +
                                (activa
                                    ? 'text-graphite'
                                    : 'text-graphite-64 hover:text-graphite')
                            }
                    >
                        {coluna.cota}
                        {activa && <Icone aria-hidden className="size-3 shrink-0" />}
                    </button>
                );
            })}
        </div>
    );
}

function LinhaProjecto({
    linha,
    total,
    papel,
}: {
    linha: Linha;
    total: number;
    papel: PapelProjecto | null;
}) {
    const atrasado = linha.desvio >= 10;
    const papelTexto = papel ? rotuloPapel(papel) : null;
    const numeroDaFolha = numeroFolha(linha.numero, total);

    return (
        <li
            className={cn(
                GRELHA,
                'items-baseline gap-x-4 gap-y-2 border-b border-graphite-20 py-3 md:items-center',
            )}
        >
            <span className="cota hidden font-mono md:block">{numeroDaFolha}</span>

            <div className="min-w-0">
                <p className="truncate font-medium text-graphite">
                    <span className="font-mono text-xs text-graphite-64 md:hidden">
                        {numeroDaFolha}{' '}
                    </span>
                    {linha.projecto.nome}
                </p>
                <p className="truncate text-xs text-graphite-64">
                    {linha.projecto.cliente}
                    {papelTexto && <span className="cota ml-2">{papelTexto}</span>}
                </p>
            </div>

            <div className="md:justify-self-start">
                <EstadoSelo estado={linha.projecto.estadoGeral} />
            </div>

            <div className="flex items-center justify-between gap-2 md:justify-self-end">
                <span className="cota md:sr-only">Fís.</span>
                <Medidor className="w-full md:w-20" valor={linha.fisica} rotulo="Execução física" />
                <span className="w-9 shrink-0 text-right font-mono text-xs tabular text-graphite">
                    {Math.round(linha.fisica)}%
                </span>
            </div>

            <div className="flex items-center justify-between gap-2 md:justify-self-end">
                <span className="cota md:sr-only">Fin.</span>
                <Medidor
                    className="w-full md:w-20"
                    valor={linha.financeira}
                    rotulo="Execução financeira"
                    marca={linha.fisica}
                    marcaRotulo={`Execução física ${Math.round(linha.fisica)}%`}
                />
                <span className="w-9 shrink-0 text-right font-mono text-xs tabular text-graphite">
                    {Math.round(linha.financeira)}%
                </span>
            </div>

            <div className="flex items-center justify-between gap-2 md:justify-self-end">
                <span className="cota md:sr-only">Desvio</span>
                <span
                    title="Execução física menos execução financeira"
                    className={
                        atrasado
                            ? 'font-mono text-xs font-semibold tabular text-red-pencil'
                            : 'font-mono text-xs tabular text-graphite-64'
                    }
                >
                    {linha.desvio >= 0 ? '+' : '−'}
                    {Math.abs(Math.round(linha.desvio))} pp
                </span>
            </div>

            <div className="flex items-center justify-between gap-2 md:justify-self-end">
                <span className="cota md:sr-only">Espera</span>
                {linha.espera > 0 ? (
                        <span
                            title="Despesas à espera de aprovação"
                            className="border-2 border-red-pencil bg-red-pencil px-1.5 font-mono text-xs font-semibold tabular text-paper"
                        >
                            {linha.espera}
                        </span>
                ) : (
                    <span aria-hidden className="text-graphite-64">
                        —
                    </span>
                )}
            </div>
        </li>
    );
}

function ZonaGrafico({ linhas }: { linhas: Linha[] }) {
    const dados = useMemo(
        () =>
            linhas.slice(0, 8).map((linha) => ({
                curta: linha.projecto.nome.split(' ')[0],
                fisica: Math.round(linha.fisica),
                financeira: Math.round(linha.financeira),
            })),
        [linhas],
    );

    return (
        <section
            aria-labelledby="comparacao"
            className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]"
        >
            <div className="min-w-0 space-y-2">
                <h2
                    id="comparacao"
                    className="cota border-b border-graphite-32 pb-2 text-graphite"
                >
                    Execuções · as duas barras na mesma escala
                </h2>

                {dados.length === 0 ? (
                    <p className="border border-dashed border-graphite-32 p-6 text-sm text-graphite-64">
                        Sem linhas para comparar.
                    </p>
                ) : (
                    <div className="border border-graphite-32 bg-paper-raised p-3">
                        <BarChart
                            data={dados}
                            layout="vertical"
                            margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
                            barGap={3}
                            barSize={15}
                        >
                            {/*
                             * A hachura não é enfeite: é a mesma codificação do
                             * medidor. Físico sólido é o que está construído, um
                             * facto; financeiro hachurado é o que está aprovado,
                             * um cálculo sobre o contrato. Duas barras cinzentas
                             *chapadas diziam apenas "duas quantidades", e era a
                             * diferença entre as duas execuções que este painel
                             * existe para mostrar.
                             */}
                            <defs>
                                <pattern
                                    id="sgo-hachura-financeira"
                                    width="5"
                                    height="5"
                                    patternUnits="userSpaceOnUse"
                                    patternTransform="rotate(45)"
                                >
                                    <rect width="5" height="5" fill="var(--color-graphite-64)" />
                                    <line
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="5"
                                        stroke="var(--color-paper-raised)"
                                        strokeWidth="1.5"
                                    />
                                </pattern>
                            </defs>

                            <CartesianGrid horizontal={false} stroke="var(--color-graphite-12)" />
                            <XAxis
                                type="number"
                                domain={[0, 100]}
                                ticks={[0, 25, 50, 75, 100]}
                                tick={{
                                    fill: 'var(--color-graphite-64)',
                                    fontSize: 11,
                                }}
                                tickLine={false}
                                axisLine={{
                                    stroke: 'var(--color-graphite-32)',
                                }}
                            />
                            <YAxis
                                type="category"
                                dataKey="curta"
                                width={104}
                                tick={{
                                    fill: 'var(--color-graphite-64)',
                                    fontSize: 11,
                                }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <ReferenceLine
                                x={100}
                                stroke="var(--color-graphite-32)"
                                strokeDasharray="2 2"
                            />
                            <Bar
                                dataKey="fisica"
                                fill="var(--color-graphite)"
                                isAnimationActive={false}
                            />
                            <Bar
                                dataKey="financeira"
                                fill="url(#sgo-hachura-financeira)"
                                isAnimationActive={false}
                            />
                        </BarChart>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <h2 className="cota border-b border-graphite-32 pb-2 text-graphite">Como ler</h2>
                <dl className="grid gap-px border border-graphite-32 bg-graphite-32">
                    <Explicacao
                        termo="Execução física"
                        texto="Média da % de conclusão das actividades do projecto."
                    />
                    <Explicacao
                        termo="Execução financeira"
                        texto="Despesas aprovadas ÷ valor contratual × 100."
                    />
                    <Explicacao
                        termo="Desvio"
                        texto="Física menos financeira. Acima de 10 pp o trabalho já foi feito e ainda não foi pago."
                    />
                </dl>
                <p className="anotacao normal-case">
                    Hachura a 45° nos medidores e na barra financeira: o que está
                    medido é sempre derivado de registos, não um valor escrito à
                    mão. O encerramento administrativo é independente destas duas
                    execuções e só aparece no detalhe do projecto.
                </p>
            </div>
        </section>
    );
}

function Explicacao({ termo, texto }: { termo: string; texto: string }) {
    return (
        <div className="bg-paper px-3 py-2">
            <dt className="cota">{termo}</dt>
            <dd className="mt-0.5 text-xs text-graphite-64">{texto}</dd>
        </div>
    );
}

function ZonaEspera({ linhas, despesas }: { linhas: Linha[]; despesas: Despesa[] }) {
    const { estado } = useSgo();
    const visiveis = useMemo(() => new Set(linhas.map((linha) => linha.projecto.id)), [linhas]);
    const aMostrar = useMemo(() => despesas.slice(0, 5), [despesas]);

    return (
        <section aria-labelledby="espera" className="space-y-2">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-graphite-32 pb-2">
                <h2 id="espera" className="cota text-graphite">
                    À espera de aprovação
                </h2>
                <p className="cota">
                    {numero(aMostrar.length)} de {numero(despesas.length)} despesas · ordenada por
                    valor
                </p>
            </div>

            <LinhaCota
                colunas={['Despesa', 'Projecto', 'Valor', 'Registo', 'Estado']}
                grelha="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_116px_128px_100px]"
                className="hidden md:grid"
            />

            {aMostrar.length === 0 ? (
                <p className="border border-dashed border-graphite-32 p-6 text-sm text-graphite-64">
                    Nada à espera de aprovação nesta folha.
                </p>
            ) : (
                <ul className="grid gap-px border-x border-b border-graphite-32 bg-graphite-32">
                    {aMostrar.map((despesa) => {
                        const projecto = estado.projectos.find((p) => p.id === despesa.projectoId);
                        const registadaPor = estado.utilizadores.find(
                            (u) => u.id === despesa.registadoPor,
                        );

                        return (
                            <li
                                key={despesa.id}
                                className="grid grid-cols-1 items-baseline gap-x-4 gap-y-1 bg-paper px-3 py-2.5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_116px_128px_100px] md:items-center"
                            >
                                <span className="truncate text-sm text-graphite">
                                    {despesa.descricao}
                                </span>
                                <span className="truncate text-sm text-graphite-64">
                                    {projecto?.nome ?? 'Sem projecto'}
                                </span>
                                <span className="font-mono text-sm tabular text-graphite">
                                    {moeda(despesa.valor)}
                                </span>
                                <span className="cota">
                                    por {registadaPor?.nome.split(' ')[0] ?? '—'}
                                </span>
                                <span>
                                    <EstadoSelo estado={despesa.estadoAprovacao} />
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}

            <p className="cota">
                abrir a despesa e registar o pagamento chegam com o módulo Financeiro
            </p>

            <Carimbo
                identidade="SGO · PAINEL"
                className="mt-6 w-[260px]"
                linhas={[
                    { chave: 'Emitido', valor: dataExtenso(new Date()) },
                    { chave: 'Revisão', valor: 'C' },
                    { chave: 'Linhas', valor: `${linhas.length} visíveis` },
                ]}
                rodado={-2}
            />
        </section>
    );
}

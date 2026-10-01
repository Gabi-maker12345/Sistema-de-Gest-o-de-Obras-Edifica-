import { cn } from '@/lib/utils';

/**
 * O quadro de medicoes: o bloco de titulo de uma folha, onde o desenho escreve
 * os numeros que mandam. Seis leituras tabulares, sem cartao e sem faixa de KPI.
 *
 * `nota` escreve a definicao ao pe da leitura, a lapis, como quem assina uma
 * nota de rodape numa prancha. Existe porque a media so e verdadeira com o
 * criterio escrito ao lado.
 *
 * `superficie` escolhe o substrato. Sobre `papel` as celulas sao de papel com a
 * grelha a grafite; sobre `tabua` sao a prancheta escura com a regua a tinta.
 * O painel usa `tabua` porque o bloco de titulo de um desenho e a unica massa
 * escura da folha — e e ai que o olho tem de cair primeiro. Sem essa massa, seis
 * numeros a graphite sobre papel leem-se como seis etiquetas e a folha fica
 * lavada por dentro, com o escuro todo acumulado na moldura.
 */
export interface Medicao {
    rotulo: string;
    valor: string;
    /** Numero cru, para ordenar e para o `title`. */
    numero?: number;
    /** O unico uso legitimo do lapis vermelho numa leitura: atraso, erro. */
    critico?: boolean;
    nota?: string;
    unidade?: string;
}

export function QuadroMedicoes({
    medicoes,
    className,
    colunas = 2,
    superficie = 'papel',
}: {
    medicoes: Medicao[];
    className?: string;
    colunas?: 2 | 3;
    superficie?: 'papel' | 'tabua';
}) {
    const tabua = superficie === 'tabua';

    return (
        <dl
            className={cn(
                'grid gap-px',
                // A grelha e o fundo do contentor; a celula e a placa. Sobre a
                // tabua a grelha e a regua (tinta) e nao o grafite em alfa, que
                // sobre um fundo escuro desaparece.
                tabua
                    ? 'border border-regua-32 bg-regua-12'
                    : 'border border-graphite-32 bg-graphite-20',
                colunas === 3 ? 'grid-cols-3' : 'grid-cols-2',
                className,
            )}
        >
            {medicoes.map((medicao) => (
                <div
                    key={medicao.rotulo}
                    className={cn('px-3 py-2.5', tabua ? 'bg-tabua' : 'bg-paper')}
                >
                    <dt className={tabua ? 'cota-t' : 'cota'}>{medicao.rotulo}</dt>
                    <dd
                        title={medicao.numero === undefined ? undefined : String(medicao.numero)}
                        className={cn(
                            'mt-1 flex items-baseline gap-1 font-mono text-3xl leading-none font-medium tabular',
                            medicao.critico
                                ? tabua
                                    ? 'text-red-pencil-alto'
                                    : 'text-red-pencil'
                                : tabua
                                  ? 'text-tinta'
                                  : 'text-graphite',
                        )}
                    >
                        {medicao.valor}
                        {medicao.unidade && (
                            <span
                                className={
                                    tabua
                                        ? 'text-2xs font-normal text-tinta-72'
                                        : 'text-2xs font-normal text-graphite-64'
                                }
                            >
                                {medicao.unidade}
                            </span>
                        )}
                    </dd>
                    {medicao.nota && (
                        <p
                            className={cn(
                                'mt-1.5 border-l-2 pl-1.5 normal-case',
                                tabua ? 'anotacao-t border-regua-32' : 'anotacao border-graphite-32',
                            )}
                        >
                            {medicao.nota}
                        </p>
                    )}
                </div>
            ))}
        </dl>
    );
}

/**
 * As duas execucoes na mesma escala, uma sobre a outra, com o desvio entre
 * elas escrito ao lado.
 *
 * Este e o mecanismo do produto: o que se construiu e o que se gastou vivem
 * separadas e discordam. Uma tabela de dois numeros obriga a compara-los na
 * cabeca; duas barras na mesma regua mostram a distancia sem a calcular.
 * E por isso que o solido e a fisica — um facto, o que esta erguido — e o
 * hachurado e a financeira — um calculo sobre o contrato. A mesma codificacao
 * do medidor da folha, sem legenda nova.
 */
export function LeituraExecucoes({
    fisica,
    financeira,
    className,
    superficie = 'papel',
}: {
    fisica: number;
    financeira: number;
    className?: string;
    superficie?: 'papel' | 'tabua';
}) {
    const desvio = fisica - financeira;
    const atrasada = desvio >= 10;
    const tabua = superficie === 'tabua';

    return (
        <div className={cn('px-3 py-2.5', tabua ? 'bg-tabua' : 'bg-paper', className)}>
            <div className="flex items-baseline justify-between gap-2">
                <dt className={tabua ? 'cota-t' : 'cota'}>Execuções · mesma escala</dt>
                <span
                    className={cn(
                        'font-mono text-sm font-semibold tabular',
                        atrasada
                            ? tabua
                                ? 'text-red-pencil-alto'
                                : 'text-red-pencil'
                            : tabua
                              ? 'text-tinta'
                              : 'text-graphite',
                    )}
                    title="Execução física menos execução financeira, em pontos percentuais"
                >
                    {desvio >= 0 ? '+' : '−'}
                    {Math.abs(Math.round(desvio))} pp
                </span>
            </div>

            <div className="mt-2.5 space-y-2">
                <BarraExecucao
                    rotulo="Física"
                    valor={fisica}
                    legenda={`${Math.round(fisica)}% concluído, média das actividades`}
                    tabua={tabua}
                />
                <BarraExecucao
                    rotulo="Financeira"
                    valor={financeira}
                    derivado
                    legenda={`${Math.round(financeira)}% do valor contratual já aprovado`}
                    tabua={tabua}
                />
            </div>

            <p
                className={cn(
                    'mt-2.5 border-l-2 pl-1.5 normal-case',
                    tabua
                        ? 'anotacao-t border-regua-32'
                        : 'anotacao border-graphite-32',
                )}
            >
                {atrasada
                    ? 'O trabalho já foi executado e ainda não está pago: a medição está à frente do aprovado.'
                    : 'Aprovado e executado à mesma frente. Acima de 10 pp o desenho está a correr à frente da factura.'}
            </p>
        </div>
    );
}

function BarraExecucao({
    rotulo,
    valor,
    derivado = false,
    legenda,
    tabua = false,
}: {
    rotulo: string;
    valor: number;
    derivado?: boolean;
    legenda: string;
    tabua?: boolean;
}) {
    const limitado = Math.max(0, Math.min(100, valor));

    return (
        <div className="grid grid-cols-[64px_1fr_40px] items-center gap-2">
            <span className={tabua ? 'cota-t truncate' : 'cota truncate'}>{rotulo}</span>
            <div
                className={tabua ? 'medidor-t h-2' : 'medidor h-2'}
                role="img"
                aria-label={legenda}
                style={
                    {
                        '--medidor-preenchimento': `${limitado}%`,
                    } as React.CSSProperties
                }
            >
                <span data-medido={derivado ? 'derivado' : 'registo'} className="medir" />
            </div>
            <span
                className={
                    tabua
                        ? 'text-right font-mono text-xs font-medium tabular text-tinta'
                        : 'text-right font-mono text-xs font-medium tabular text-graphite'
                }
            >
                {Math.round(limitado)}%
            </span>
        </div>
    );
}

import { cn } from '@/lib/utils';

/**
 * O quadro de medicoes: o bloco de titulo de uma folha, onde o desenho escreve
 * os numeros que mandam. Seis leituras tabulares, sem cartao e sem faixa de KPI.
 *
 * `nota` escreve a definicao ao pe da leitura, a lapis, como quem assina uma
 * nota de rodape numa prancha. Existe porque a media so e verdadeira com o
 * criterio escrito ao lado.
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
}: {
    medicoes: Medicao[];
    className?: string;
    colunas?: 2 | 3;
}) {
    return (
        <dl
            className={cn(
                'grid gap-px border border-graphite-32 bg-graphite-20',
                colunas === 3 ? 'grid-cols-3' : 'grid-cols-2',
                className,
            )}
        >
            {medicoes.map((medicao) => (
                <div key={medicao.rotulo} className="bg-paper px-3 py-2">
                    <dt className="cota">{medicao.rotulo}</dt>
                    <dd
                        title={medicao.numero === undefined ? undefined : String(medicao.numero)}
                        className={cn(
                            'mt-0.5 flex items-baseline gap-1 font-mono text-2xl leading-none font-medium tabular',
                            medicao.critico ? 'text-red-pencil' : 'text-graphite',
                        )}
                    >
                        {medicao.valor}
                        {medicao.unidade && (
                            <span className="text-2xs font-normal text-graphite-48">
                                {medicao.unidade}
                            </span>
                        )}
                    </dd>
                    {medicao.nota && (
                        <p className="anotacao mt-1 border-l-2 border-graphite-12 pl-1.5 normal-case">
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
}: {
    fisica: number;
    financeira: number;
    className?: string;
}) {
    const desvio = fisica - financeira;
    const atrasada = desvio >= 10;

    return (
        <div className={cn('bg-paper px-3 py-2.5', className)}>
            <div className="flex items-baseline justify-between gap-2">
                <dt className="cota">Execuções · mesma escala</dt>
                <span
                    className={cn(
                        'font-mono text-sm font-semibold tabular',
                        atrasada ? 'text-red-pencil' : 'text-graphite',
                    )}
                    title="Execução física menos execução financeira, em pontos percentuais"
                >
                    {desvio >= 0 ? '+' : '−'}
                    {Math.abs(Math.round(desvio))} pp
                </span>
            </div>

            <div className="mt-2 space-y-1.5">
                <BarraExecucao
                    rotulo="Física"
                    valor={fisica}
                    legenda={`${Math.round(fisica)}% concluído, média das actividades`}
                />
                <BarraExecucao
                    rotulo="Financeira"
                    valor={financeira}
                    derivado
                    legenda={`${Math.round(financeira)}% do valor contratual já aprovado`}
                />
            </div>

            <p className="anotacao mt-2 border-l-2 border-graphite-12 pl-1.5 normal-case">
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
}: {
    rotulo: string;
    valor: number;
    derivado?: boolean;
    legenda: string;
}) {
    const limitado = Math.max(0, Math.min(100, valor));

    return (
        <div className="grid grid-cols-[64px_1fr_40px] items-center gap-2">
            <span className="cota truncate">{rotulo}</span>
            <div
                className="medidor h-2"
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
            <span className="text-right font-mono text-xs font-medium tabular text-graphite">
                {Math.round(limitado)}%
            </span>
        </div>
    );
}

import { NuvemCortada } from '@/Components/brand/selo-sincronizacao';
import { EstadoSelo, Selo } from '@/Components/ui/badge';
import { useSgo } from '@/Data/SgoContext';
import type { Projecto } from '@/Data/types';
import { cn } from '@/lib/utils';

/**
 * O índice das obras: a prancha onde se escolhe o que se vai ler.
 *
 * Substitui a lista de nomes. A lista dizia que havia obras, não o que havia
 * dentro delas, e quem entra num módulo quer comparar antes de escolher — quantos
 * registos, como vão as execuções, se está atrasada, o que ainda não subiu. Por
 * isso cada linha é uma linha de obra completa e carregável: as mesmas que o
 * quadro de datas desenha, sem o eixo temporal que aqui não interessa.
 *
 * Mostramos também as obras sem registo. A lista anterior filtrava-as por
 * serem um destino morto, mas não são: uma obra sem diário é a obra onde o
 * primeiro dia ainda se vai escrever, e escondê-la é esconder o trabalho que
 * está por fazer. O zero conta-o, e a folha que abre à frente já diz que não há
 * registos.
 */
export function IndiceObras({
    obras,
    contar,
    porSubir,
    aoEscolher,
    className,
}: {
    obras: Projecto[];
    /** Quantos registos o módulo tem nesta obra. */
    contar: (projectoId: string) => number;
    /** Quantos desses registos ainda não subiram. Fica de fora nos módulos sem sincronização. */
    porSubir?: (projectoId: string) => number;
    aoEscolher: (projectoId: string) => void;
    className?: string;
}) {
    const { execucaoFisica, execucaoFinanceira } = useSgo();

    if (obras.length === 0) {
        return (
            <p className={cn('hachura-90 border border-dashed border-graphite-32 p-8 text-sm text-graphite-64', className)}>
                Nenhuma obra visível a este utilizador. As obras aparecem aqui quando
                o acesso lhes é atribuído no separador Acessos.
            </p>
        );
    }

    const comRegistos = obras.filter((obra) => contar(obra.id) > 0).length;

    return (
        <section aria-labelledby="indice-obras" className={cn('min-w-0', className)}>
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 border-b border-graphite-32 pb-2">
                <h2 className="cota text-graphite" id="indice-obras">
                    Índice das obras
                </h2>
                <p className="cota">
                    {comRegistos} de {obras.length} com registo · escolha a obra em leitura
                </p>
            </div>

            <ul className="border-x border-b border-graphite-32">
                {obras.map((obra, posicao) => {
                    const registos = contar(obra.id);
                    const pendentes = porSubir?.(obra.id) ?? 0;
                    const fisica = execucaoFisica(obra.id);
                    const financeira = execucaoFinanceira(obra.id);

                    return (
                        <li key={obra.id} className="border-t border-graphite-20 first:border-t-0">
                            <button
                                type="button"
                                onClick={() => aoEscolher(obra.id)}
                                className="grid w-full grid-cols-1 gap-3 px-3 py-3 text-left transition-colors hover:bg-graphite-04 focus-visible:bg-graphite-04 focus-visible:outline-offset-[-2px] md:grid-cols-[3rem_minmax(0,1fr)_13rem_11rem] md:items-center md:gap-4"
                            >
                                <span className="cota tabular text-graphite-48">
                                    {String(posicao + 1).padStart(2, '0')}
                                </span>

                                <span className="min-w-0">
                                    <span
                                        className={cn(
                                            'block truncate text-sm font-medium',
                                            registos > 0 ? 'text-graphite' : 'text-graphite-64',
                                        )}
                                    >
                                        {obra.nome}
                                    </span>
                                    <span className="mt-0.5 block truncate text-xs text-graphite-64">
                                        {[obra.cliente, obra.morada].filter(Boolean).join(' · ')}
                                    </span>
                                </span>

                                <span className="space-y-1">
                                    <span className="cota block">Execuções</span>
                                    <span className="flex items-center gap-2">
                                        <span className="cota w-7 shrink-0">Fís.</span>
                                        <Barra valor={fisica} />
                                        <span className="w-8 text-right font-mono text-xs font-medium tabular text-graphite">
                                            {Math.round(fisica)}%
                                        </span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="cota w-7 shrink-0">Fin.</span>
                                        <Barra valor={financeira} derivado />
                                        <span className="w-8 text-right font-mono text-xs font-medium tabular text-graphite">
                                            {Math.round(financeira)}%
                                        </span>
                                    </span>
                                </span>

                                <span className="flex flex-wrap items-center gap-2 md:justify-end">
                                    <EstadoSelo estado={obra.estadoGeral} />

                                    {pendentes > 0 && (
                                        <Selo
                                            tinta="ambar"
                                            traco="pontilhado"
                                            title={`${pendentes} por sincronizar`}
                                        >
                                            <NuvemCortada />
                                            {pendentes}
                                            <span className="sr-only">por sincronizar</span>
                                        </Selo>
                                    )}

                                    <span
                                        className={cn(
                                            'cota tabular',
                                            registos > 0 ? 'text-graphite-64' : 'text-graphite-48',
                                        )}
                                    >
                                        {registos}
                                        <span className="normal-case">
                                            {registos === 1 ? ' registo' : ' registos'}
                                        </span>
                                    </span>
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

/**
 * A barra de execução na mesma codificação do quadro de medições: sólido o que
 * se viu, hachurado o que está derivado do contrato.
 */
function Barra({ valor, derivado = false }: { valor: number; derivado?: boolean }) {
    const limitado = Math.max(0, Math.min(100, valor));

    return (
        <span
            className="medidor h-2 flex-1"
            role="img"
            aria-label={`${Math.round(limitado)}%`}
            style={{ '--medidor-preenchimento': `${limitado}%` } as React.CSSProperties}
        >
            <span data-medido={derivado ? 'derivado' : 'registo'} className="medir" />
        </span>
    );
}
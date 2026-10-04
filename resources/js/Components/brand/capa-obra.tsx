import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

import { EstadoSelo, Selo } from '@/Components/ui/badge';
import { Botao } from '@/Components/ui/button';
import { useSgo } from '@/Data/SgoContext';
import type { Projecto } from '@/Data/types';
import { data, moeda } from '@/lib/format';
import { rotuloPapel } from '@/lib/rotulos';
import { cn } from '@/lib/utils';

import { DadoFicha } from './ficha-registo';
import { LeituraExecucoes, type Medicao, QuadroMedicoes } from './quadro-medicoes';

/**
 * A capa da obra: quem é a obra, e o que este módulo tem nela.
 *
 * Antes, escolher a obra era um campo e o módulo abria logo para uma folha solta
 * no ecrã. Era uma lista com o nome da obra em cima e nada que dissesse se valia
 * a pena ficar lá dentro. A capa é a peça que falta: identidade à esquerda, as
 * quatro medidas do módulo à direita e um caminho para a ficha completa.
 *
 * A identidade vem primeiro porque a pergunta de quem chega aqui é «de que obra
 * é isto?» — e as medidas só interessam depois dessa resposta.
 *
 * O cabeçalho mede o módulo inteiro; a capa mede a obra. São dois números
 * diferentes e não podem ser o mesmo: um agregado acima da escolha obriga o
 * gestor a subtrair para saber da sua obra, e a folha que o obriga a fazer contas
 * perdeu o trabalho que tinha.
 */
export function CapaObra({
    projecto,
    leituras,
    className,
}: {
    projecto: Projecto;
    /** As quatro medidas do módulo nesta obra, no dialecto do quadro de medições. */
    leituras: Medicao[];
    className?: string;
}) {
    const { estado, execucaoFisica, execucaoFinanceira, papelEmProjecto } = useSgo();

    const area = estado.areas.find((a) => a.id === projecto.areaId) ?? null;
    const gestor = estado.utilizadores.find((u) => u.id === projecto.gestorId) ?? null;
    const papel = papelEmProjecto(projecto.id);

    const fim = projecto.dataFimReal ?? projecto.dataFimPrevista;

    return (
        <section
            aria-labelledby="capa-obra"
            className={cn(
                // Uma grelha de duas colunas com a régua do papel a mostrar por
                // baixo: a massa escura da folha é a do cabeçalho, e a capa é a
                // pergunta local, escrita em papel.
                'grid gap-px border border-graphite-32 bg-graphite-20 lg:grid-cols-[minmax(0,1fr)_22rem]',
                className,
            )}
        >
            <div className="min-w-0 space-y-4 bg-paper p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="cota text-graphite" id="capa-obra">
                        Obra em leitura
                    </p>
                    <p className="cota tabular">
                        {data(projecto.dataInicio)} → {data(fim)}
                    </p>
                </div>

                <h2 className="text-2xl leading-tight font-semibold tracking-tight text-graphite">
                    {projecto.nome}
                </h2>

                <p className="text-sm text-graphite-64">
                    {[projecto.cliente, area?.nome, gestor?.nome].filter(Boolean).join(' · ')}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                    <EstadoSelo estado={projecto.estadoGeral} />

                    {papel && (
                        <Selo tinta="carimbo" traco="leve">
                            {rotuloPapel(papel)}
                        </Selo>
                    )}

                    <Selo tinta="neutro" traco="leve">
                        {moeda(projecto.valorContratual)} contratual
                    </Selo>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-graphite-20 pt-4">
                    <DadoFicha rotulo="Cliente">{projecto.cliente}</DadoFicha>
                    <DadoFicha rotulo="Morada">{projecto.morada}</DadoFicha>
                </dl>

                {/* As duas execuções na mesma escala: o que se construiu contra o
                    que se aprovou é o mecanismo do produto, e a capa é onde ele se
                    lê sem abrir a ficha. */}
                <dl className="border border-graphite-32">
                    <LeituraExecucoes
                        fisica={execucaoFisica(projecto.id)}
                        financeira={execucaoFinanceira(projecto.id)}
                    />
                </dl>

                <Botao asChild variante="carimbo" tamanho="sm">
                    <Link href={route('admin.projectos.mostrar', { projecto: projecto.id })}>
                        Ficha da obra
                        <ArrowUpRight aria-hidden />
                    </Link>
                </Botao>
            </div>

            <QuadroMedicoes
                colunas={2}
                superficie="papel"
                medicoes={leituras}
                className="border-0"
            />
        </section>
    );
}
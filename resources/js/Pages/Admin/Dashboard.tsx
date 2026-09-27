import { Head } from '@inertiajs/react';

import { useSgo } from '@/Data/SgoContext';
import { LayoutAdmin } from '@/Layouts/LayoutAdmin';
import { dataExtenso } from '@/lib/format';
import { rotuloPerfil } from '@/lib/rotulos';

import { BlocoTitulo } from '@/Components/brand/bloco-titulo';
import { Carimbo } from '@/Components/brand/carimbo';
import { Medidor } from '@/Components/ui/progress';
import { Selo, EstadoSelo } from '@/Components/ui/badge';

/**
 * `/admin/dashboard` — folha de rosto do painel.
 *
 * A secção 2 da spec (agenda, tarefas, projectos administrativos, obras e
 * finanças) não está implementada. O que fica aqui é o mínimo honesto: a
 * sessão tem destino, o selector «Ver como» filtra o que é visível, e os
 * projectos visíveis listam-se com a execução física e financeira calculadas a
 * partir dos registos em memória.
 */
export default function Dashboard() {
    const {
        utilizadorEfectivo,
        perfilEfectivo,
        veTodosOsProjectos,
        projectosVisiveis,
        execucaoFisica,
        execucaoFinanceira,
    } = useSgo();

    return (
        <LayoutAdmin>
            <Head title="Painel — SGO">
                <meta name="description" content="Painel de gestão de projectos, obras e trabalho do SGO." />
            </Head>

            <div className="space-y-12">
                <header className="flex flex-wrap items-end justify-between gap-6">
                    <div className="space-y-2">
                        <p className="cota">Painel</p>
                        <h1 className="text-3xl font-semibold tracking-tight text-graphite">
                            Bom dia, {utilizadorEfectivo.nome.split(' ')[0]}
                        </h1>
                        <p className="text-graphite-64">
                            A ver como {rotuloPerfil(perfilEfectivo)} ·{' '}
                            {veTodosOsProjectos
                                ? `${projectosVisiveis.length} projectos, todos visíveis.`
                                : `${projectosVisiveis.length} de ${projectosVisiveis.length} projectos atribuídos a si.`}
                        </p>
                    </div>

                    <BlocoTitulo
                        folha={`01 / ${String(projectosVisiveis.length).padStart(2, '0')}`}
                        escala="1:1"
                        revisao="C"
                        emitidoEm={dataExtenso(new Date())}
                    />
                </header>

                <div className="flex flex-wrap items-center gap-2 border-y border-graphite-12 py-3">
                    <Selo tinta="carimbo" traco="firme">
                        Sessão real
                    </Selo>
                    <Selo tinta="grafite" traco="leve">
                        Selector «Ver como» activo
                    </Selo>
                    <Selo tinta="grafite" traco="pontilhado">
                        Secção 2 por implementar
                    </Selo>
                </div>

                <section aria-labelledby="projectos" className="space-y-4">
                    <h2 id="projectos" className="cota">
                        Projectos visíveis
                    </h2>

                    {projectosVisiveis.length === 0 ? (
                        <p className="border border-dashed border-graphite-32 p-6 text-graphite-64">
                            Este perfil não tem projectos atribuídos na aba Acessos.
                        </p>
                    ) : (
                        <ul className="grid gap-px border border-graphite-12 bg-graphite-12 sm:grid-cols-2">
                            {projectosVisiveis.map((projecto) => {
                                const fisica = execucaoFisica(projecto.id);
                                const financeira = execucaoFinanceira(projecto.id);

                                return (
                                    <li key={projecto.id} className="space-y-3 bg-paper p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-graphite">
                                                    {projecto.nome}
                                                </p>
                                                <p className="truncate text-sm text-graphite-64">
                                                    {projecto.cliente}
                                                </p>
                                            </div>
                                            <EstadoSelo estado={projecto.estadoGeral} />
                                        </div>

                                        <div className="space-y-2.5">
                                            <div className="space-y-1">
                                                <p className="flex justify-between font-mono text-2xs tracking-[0.06em] text-graphite-48 uppercase">
                                                    <span>Execução física</span>
                                                    <span>{Math.round(fisica)}%</span>
                                                </p>
                                                <Medidor valor={fisica} rotulo="Execução física" />
                                            </div>

                                            <div className="space-y-1">
                                                <p className="flex justify-between font-mono text-2xs tracking-[0.06em] text-graphite-48 uppercase">
                                                    <span>Execução financeira</span>
                                                    <span>{Math.round(financeira)}%</span>
                                                </p>
                                                <Medidor
                                                    valor={financeira}
                                                    rotulo="Execução financeira"
                                                />
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <section className="flex flex-wrap items-center justify-between gap-6 border-t border-graphite-12 pt-8">
                    <p className="max-w-md text-sm text-graphite-64">
                        A agenda, as tarefas, os projectos administrativos, as obras e as finanças
                        são a secção 2 da especificação. O que está aqui é a folha de rosto: sessão,
                        selector e leitura dos registos.
                    </p>
                    <Carimbo
                        identidade="SGO · PAINEL"
                        linhas={[
                            { chave: 'Perfil', valor: rotuloPerfil(perfilEfectivo) },
                            { chave: 'Projectos', valor: String(projectosVisiveis.length) },
                        ]}
                        rodado={-2}
                    />
                </section>
            </div>
        </LayoutAdmin>
    );
}

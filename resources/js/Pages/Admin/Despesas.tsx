import { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';

import { LayoutAdmin } from '@/Layouts/LayoutAdmin';
import { PaginaSemCabecalho } from '@/Components/brand/pagina-sem-cabecalho';
import { BlocoTitulo } from '@/Components/brand/bloco-titulo';
import { useSgo } from '@/Data/SgoContext';
import type { Despesa } from '@/Data/types';
import { data, dinheiro } from '@/lib/format';
import { SeloSincronizacao } from '@/Components/brand/selo-sincronizacao';
import { ROTULOS } from '@/lib/rotulos';

export default function Despesas() {
    const { estado } = useSgo();
    const [despesaAberta, definirDespesaAberta] = useState<Despesa | null>(null);

    const despesas = useMemo(() => [...estado.despesas].sort((a, b) => b.data.localeCompare(a.data)), [estado.despesas]);

    return (
        <LayoutAdmin>
            <Head title="Despesas" />
            <PaginaSemCabecalho>
                <BlocoTitulo titulo="Despesas" subtitulo="Registo de despesas da obra, com estados de aprovação e sincronização." />
                <section className="space-y-3">
                    <div className="grid grid-cols-1 gap-2 px-3 py-2 text-xs text-graphite-64 md:grid-cols-[minmax(0,1fr)_96px_120px_96px_96px] md:items-center md:gap-3">
                        <span>Descrição</span>
                        <span>Categoria</span>
                        <span>Fornecedor</span>
                        <span className="md:text-right">Valor</span>
                        <span className="md:text-right">Estado</span>
                    </div>
                    {despesas.length === 0 ? (
                        <p className="border border-dashed border-graphite-32 p-6 text-sm text-graphite-64">
                            Ainda não existem despesas registadas.
                        </p>
                    ) : (
                        <ul className="divide-y divide-graphite-20 border border-graphite-32">
                            {despesas.map((despesa) => {
                                const fornecedor = estado.fornecedores.find((f) => f.id === despesa.fornecedorId);
                                const projecto = despesa.projectoId
                                    ? estado.projectos.find((p) => p.id === despesa.projectoId)
                                    : null;
                                return (
                                    <li key={despesa.id} className="px-3 py-3 hover:bg-graphite-04">
                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_96px_120px_96px_96px] md:items-center md:gap-3">
                                            <div className="min-w-0 space-y-1">
                                                <p className="truncate text-sm font-medium text-graphite">{despesa.descricao}</p>
                                                <p className="anotacao flex flex-wrap items-center gap-x-2 gap-y-1 normal-case">
                                                    {data(despesa.data)}
                                                    {projecto && <span>· {projecto.nome}</span>}
                                                </p>
                                            </div>
                                            <span className="anotacao normal-case">
                                                {ROTULOS.categoriaDespesa[despesa.categoria]}
                                            </span>
                                            <span className="truncate text-sm text-graphite">{fornecedor?.nome ?? '—'}</span>
                                            <span className="text-sm font-medium text-graphite md:text-right">
                                                {dinheiro(despesa.valor)}
                                            </span>
                                            <div className="flex items-center justify-start md:justify-end">
                                                <SeloSincronizacao sincronizado={despesa.sincronizado} />
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </PaginaSemCabecalho>
        </LayoutAdmin>
    );
}
import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { dataExtenso } from '@/lib/format';

import { BlocoTitulo } from '@/Components/brand/bloco-titulo';
import { Carimbo } from '@/Components/brand/carimbo';
import { Marca } from '@/Components/brand/marca';
import { Toaster } from '@/Components/ui/toaster';

/**
 * O ecrã de entrada é a folha de rosto do rolo: à esquerda a capa escrita
 * como quem preenche um documento, à direita a folha com o formulário.
 */
export function LayoutAuth({ children }: { children: ReactNode }) {
    return (
        <div className="fibra-papel min-h-dvh bg-paper lg:grid lg:grid-cols-2">
            <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-graphite-12 bg-paper-sunken p-10 lg:flex">
                <div aria-hidden className="malha-prancha pointer-events-none absolute inset-0" />
                <div aria-hidden className="hachura-45 pointer-events-none absolute inset-x-0 bottom-0 h-1/3 opacity-70" />

                <Link href={route('inicio')} className="relative w-fit" aria-label="SGO, início">
                    <Marca />
                </Link>

                <div className="relative max-w-lg space-y-6">
                    <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight text-graphite">
                        Uma prancha só
                        <br />
                        para o trabalho.
                    </h1>
                    <p className="max-w-md text-base text-graphite-64">
                        O SGO reúne agenda, tarefas, projectos administrativos, obras e finanças
                        numa única fonte de informação. O estado de cada registo vive na mesma
                        folha que os seus números.
                    </p>

                    <BlocoTitulo
                        className="max-w-md"
                        folha="00 / 00"
                        escala="1:1"
                        revisao="C"
                        emitidoEm={dataExtenso(new Date())}
                    />
                </div>

                <div className="relative flex items-end justify-between gap-6">
                    <p className="cota max-w-[18rem] normal-case">
                        Autenticação real. O selector «Ver como» decide apenas que dados são
                        mostrados.
                    </p>
                    <Carimbo
                        identidade="ACESSO · DEMONSTRAÇÃO"
                        linhas={[
                            { chave: 'Perfis', valor: '5' },
                            { chave: 'Sessão', valor: 'Real' },
                        ]}
                    />
                </div>
            </aside>

            <main className="flex flex-col">
                <div className="flex items-center justify-between border-b border-graphite-12 px-6 py-4 lg:hidden">
                    <Link href={route('inicio')} aria-label="SGO, início">
                        <Marca compacta />
                    </Link>
                    <Link href={route('inicio')} className="cota hover:text-graphite">
                        Voltar ao site
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-center px-6 py-10">
                    <div className="w-full max-w-lg">{children}</div>
                </div>
            </main>

            <Toaster />
        </div>
    );
}

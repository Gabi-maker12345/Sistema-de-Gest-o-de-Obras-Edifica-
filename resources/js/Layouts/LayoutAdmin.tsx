import { Link } from '@inertiajs/react';
import { PanelLeft } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { BuscaTopo } from '@/Components/brand/busca-topo';
import { IndiceFolhas, IndiceFolhasAndarinho } from '@/Components/brand/indice-folhas';
import { Marca } from '@/Components/brand/marca';
import { SelectorVerComo } from '@/Components/brand/selector-ver-como';
import { SinoNotificacoes } from '@/Components/brand/sino-notificacoes';
import { Selo } from '@/Components/ui/badge';
import { ComDica } from '@/Components/ui/dica';
import { Toaster } from '@/Components/ui/toaster';

import { useSgo } from '@/Data/SgoContext';
import { iniciais } from '@/lib/format';
import { rotuloPerfil } from '@/lib/rotulos';

/**
 * A casca do painel: a mesa de desenho.
 *
 * A tábua é de grafite e a folha é de papel pousada em cima. É a inversão do
 * ecrã anterior, em que tudo era papel e não havia mesa onde a folha pousasse
 * — e é ela que resolve o ecrã lavado: a folha só se lê como folha porque tem
 * tábua em volta, e a tábua é o grafite do registo a 100%.
 *
 * A barra é opaca e sem desfocagem — o papel não esbatido por baixo do texto.
 *
 * Estão emitidos o dashboard e os quatro cadastros base (Projectos, com a sua
 * ficha, Equipas, Áreas e Utilizadores). Os restantes módulos aparecem no índice
 * a lápis, sem ligação.
 */
export function LayoutAdmin({ children }: { children: ReactNode }) {
    const [indiceAberto, definirIndiceAberto] = useState(false);

    return (
        <div data-superficie="tabua" className="min-h-dvh bg-tabua malha-t">
            <div className="flex">
                <div className="sticky top-0 hidden h-dvh lg:block">
                    <IndiceFolhas />
                </div>

                <IndiceFolhasAndarinho
                    aberto={indiceAberto}
                    fechar={() => definirIndiceAberto(false)}
                />

                <div className="flex min-w-0 flex-1 flex-col">
                    <BarraAdmin abrirIndice={() => definirIndiceAberto(true)} />

                    {/* A folha. Ocupa a largura toda e é a tábua que lhe dá a
                        aresta: em ecrã largo vê-se o caixilho dos dois lados. */}
                    <main id="conteudo" className="flex-1 bg-tabua">
                        <div className="folha flex min-h-[calc(100dvh-3.5rem)] flex-col xl:my-6 xl:mr-6">
                            {/* A margem de plotação: a faixa onde a fibra do papel
                                se vê, porque é aí que a folha respira antes do
                                desenho. Antes esta textura estava no contentor do
                                `children` — ou seja, em cima de toda a tabela — e o
                                que era ruído de margem acabava por ser ruído de
                                conteúdo, a tirar nitidez ao grafite. */}
                            <div className="h-8 shrink-0 border-b border-graphite-20 margem-plotacao" />

                            <div className="flex-1">{children}</div>
                        </div>
                    </main>

                    <RodapeAdmin />
                </div>
            </div>

            <Toaster />
        </div>
    );
}

function BarraAdmin({ abrirIndice }: { abrirIndice: () => void }) {
    return (
        <header className="sticky top-0 z-40 border-b border-regua-12 bg-tabua">
            <div className="flex h-14 items-center gap-2 px-4 sm:gap-3 sm:px-6">
                <ComDica texto="Índice de folhas">
                    <button
                        type="button"
                        onClick={abrirIndice}
                        className="grid size-9 shrink-0 place-items-center text-tinta-72 transition-colors hover:bg-placa hover:text-tinta lg:hidden"
                    >
                        <PanelLeft aria-hidden className="size-4" />
                        <span className="sr-only">Abrir índice de folhas</span>
                    </button>
                </ComDica>

                <Link href={route('admin.dashboard')} aria-label="SGO, painel" className="lg:hidden">
                    <Marca compacta sobreTabua />
                </Link>

                <BuscaTopo />

                <div className="ml-auto flex shrink-0 items-center gap-1.5">
                    <SelectorVerComo />
                    <SinoNotificacoes />
                </div>
            </div>
        </header>
    );
}

function RodapeAdmin() {
    const { utilizadorEfectivo, veTodosOsProjectos } = useSgo();

    return (
        <footer className="border-t border-regua-12 bg-tabua">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <p className="cota-t normal-case">
                    A ver como{' '}
                    <span className="text-tinta">
                        {rotuloPerfil(utilizadorEfectivo.perfil)} ·{' '}
                        {iniciais(utilizadorEfectivo.nome)}
                    </span>{' '}
                    ·{' '}
                    <span className="font-mono normal-case">
                        {veTodosOsProjectos ? 'todos os projectos' : 'projectos atribuídos'}
                    </span>
                </p>
                <Selo tinta="tinta" traco="leve">
                    Dados de demonstração em memória
                </Selo>
            </div>
        </footer>
    );
}

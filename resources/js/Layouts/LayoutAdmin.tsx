import { Head, Link } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import type { ReactNode } from 'react';

import { ProvedorSgo, useSgo } from '@/Data/SgoContext';
import { rotuloPerfil } from '@/lib/rotulos';
import { iniciais } from '@/lib/format';

import { Marca } from '@/Components/brand/marca';
import { SelectorVerComo } from '@/Components/brand/selector-ver-como';
import { Toaster } from '@/Components/ui/toaster';
import { Botao } from '@/Components/ui/button';
import { Selo } from '@/Components/ui/badge';

/**
 * A casca do painel. A secção 2 da spec (agenda, tarefas, obras, finanças) não
 * está implementada: o que existe aqui é o mínimo para que a sessão tenha
 * destino, mais o selector «Ver como», que fica permanentemente disponível no
 * painel superior.
 */
export function LayoutAdmin({ children }: { children: ReactNode }) {
    return (
        <ProvedorSgo>
            <div className="fibra-papel flex min-h-dvh flex-col bg-paper">
                <header className="sticky top-0 z-40 border-b border-graphite-12 bg-paper/95 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
                        <Link href={route('admin.dashboard')} aria-label="SGO, painel">
                            <Marca />
                        </Link>

                        <span aria-hidden className="h-6 w-px bg-graphite-20" />

                        <p className="cota hidden sm:block">Painel</p>

                        <div className="ml-auto flex items-center gap-3">
                            <SelectorVerComo />

                            <Botao asChild variante="contorno" tamanho="sm">
                                <Link href={route('logout')} method="post" as="button">
                                    <LogOut aria-hidden />
                                    Sair
                                </Link>
                            </Botao>
                        </div>
                    </div>
                </header>

                <main id="conteudo" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
                    {children}
                </main>

                <RodapeAdmin />
            </div>

            <Toaster />
        </ProvedorSgo>
    );
}

function RodapeAdmin() {
    const { utilizadorEfectivo } = useSgo();

    return (
        <footer className="border-t border-graphite-12 bg-paper-sunken">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <p className="cota normal-case">
                    Sessão real de{' '}
                    <span className="font-mono">{utilizadorEfectivo.email}</span> · ver como{' '}
                    {rotuloPerfil(utilizadorEfectivo.perfil)} ({iniciais(utilizadorEfectivo.nome)})
                </p>
                <Selo tinta="grafite" traco="leve">
                    Dados de demonstração em memória
                </Selo>
            </div>
        </footer>
    );
}

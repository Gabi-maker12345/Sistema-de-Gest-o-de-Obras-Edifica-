import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { ProvedorSgo } from '@/Data/SgoContext';
import { dataExtenso } from '@/lib/format';
import { cn } from '@/lib/utils';

import { LinkEstacao } from '@/Components/brand/link-estacao';
import { BarraRevisao } from '@/Components/brand/barra-revisao';
import { Carimbo } from '@/Components/brand/carimbo';
import { Marca } from '@/Components/brand/marca';
import { Toaster } from '@/Components/ui/toaster';
import { Botao } from '@/Components/ui/button';

/**
 * O percurso público é um diagrama de metro: uma linha, estações, e a estação
 * em que estamos é a folha mais escura do tabuleiro. Nenhuma cor a mais.
 */

const ESTACOES = [
    { nome: 'Início', rota: 'inicio' },
    { nome: 'Funcionalidades', rota: 'funcionalidades' },
    { nome: 'Sobre', rota: 'sobre' },
    { nome: 'Contacto', rota: 'contacto' },
] as const;

const REVISOES = [
    { revisao: 'A', nota: 'Primeira emissão do site público' },
    { revisao: 'B', nota: 'Módulos de obra com destaque' },
    { revisao: 'C', nota: 'Posicionamento de gestão de projectos' },
];

export function LayoutPublico({ children }: { children: ReactNode }) {
    const [aberto, definirAberto] = useState(false);

    return (
        <ProvedorSgo>
            <div className="fibra-papel min-h-dvh bg-paper">
                {/* Borda de plotagem: onde a folha se prende ao rolo. */}
                <div className="hidden border-b border-graphite-12 bg-paper-sunken lg:block">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-1">
                        <p className="cota">
                            SGO — sistema de gestão de trabalho, projectos e obras
                        </p>
                        <p className="cota">Luanda · WAT</p>
                    </div>
                </div>

                <header className="sticky top-0 z-40 border-b border-graphite-12 bg-paper/95 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
                        <Link href={route('inicio')} className="shrink-0" aria-label="SGO, início">
                            <Marca />
                        </Link>

                        <nav aria-label="Principal" className="hidden flex-1 md:block">
                            <ol className="flex items-center gap-1">
                                {ESTACOES.map((estacao) => (
                                    <li key={estacao.rota}>
                                        <LinkEstacao href={route(estacao.rota)}>
                                            {estacao.nome}
                                        </LinkEstacao>
                                    </li>
                                ))}
                            </ol>
                        </nav>

                        <div className="ml-auto flex items-center gap-2">
                            <Botao asChild tamanho="sm" variante="primario">
                                <Link href={route('login')}>Entrar</Link>
                            </Botao>

                            <button
                                type="button"
                                onClick={() => definirAberto(!aberto)}
                                aria-expanded={aberto}
                                aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
                                className="grid size-9 place-items-center border border-graphite-32 md:hidden"
                            >
                                {aberto ? <X aria-hidden className="size-4" /> : <Menu aria-hidden className="size-4" />}
                            </button>
                        </div>
                    </div>

                    {aberto && (
                        <nav aria-label="Principal" className="border-t border-graphite-12 md:hidden">
                            <ol className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
                                {ESTACOES.map((estacao) => (
                                    <li key={estacao.rota}>
                                        <LinkEstacao
                                            href={route(estacao.rota)}
                                            onClick={() => definirAberto(false)}
                                            className="border-b border-graphite-08"
                                        >
                                            {estacao.nome}
                                        </LinkEstacao>
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    )}
                </header>

                <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 sm:px-6 sm:py-12">
                    <main id="conteudo" className="min-w-0 flex-1">
                        {children}
                    </main>

                    <BarraRevisao revisoes={REVISOES} className="w-16 shrink-0" />
                </div>

                <RodapePublico />
            </div>

            <Toaster />
        </ProvedorSgo>
    );
}

function RodapePublico() {
    return (
        <footer className="border-t border-graphite-12 bg-paper-sunken">
            <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[2fr_1fr_1fr]">
                <div className="space-y-4">
                    <Marca />
                    <p className="max-w-md text-sm text-graphite-64">
                        Uma plataforma pessoal de gestão de trabalho: agenda, tarefas, projectos
                        administrativos, obras e finanças numa única fonte de informação.
                    </p>
                    <p className="anotacao normal-case">
                        Demonstração com dados de exemplo. Nada é gravado: tudo vive no navegador
                        durante a sessão.
                    </p>
                </div>

                <nav aria-label="Navegação do rodapé">
                    <p className="cota mb-2">Navegação</p>
                    <ul className="space-y-1 text-sm">
                        {ESTACOES.map((estacao) => (
                            <li key={estacao.rota}>
                                <Link
                                    href={route(estacao.rota)}
                                    className="text-graphite-64 hover:text-graphite"
                                >
                                    {estacao.nome}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div>
                    <p className="cota mb-2">Bremente disponível</p>
                    <ul className="space-y-1 text-sm text-graphite-32">
                        {['Google Drive', 'Google Calendar', 'WhatsApp', 'E-mail', 'Inteligência artificial'].map(
                            (integracao) => (
                                <li key={integracao} className="flex items-center gap-2">
                                    <span aria-hidden className="inline-block size-2.5 border border-graphite-20" />
                                    {integracao}
                                </li>
                            ),
                        )}
                    </ul>
                </div>
            </div>

            <div className="border-t border-graphite-12">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
                    <p className="cota normal-case">
                        {dataExtenso(new Date())} · SGO · rev. {REVISOES.at(-1)?.revisao}
                    </p>
                    <Carimbo
                        identidade="SGO · DEMONSTRAÇÃO"
                        linhas={[
                            { chave: 'Estado', valor: 'Pré-construção' },
                            { chave: 'Dados', valor: 'Em memória' },
                        ]}
                        rodado={0}
                        className="opacity-80"
                    />
                </div>
            </div>
        </footer>
    );
}

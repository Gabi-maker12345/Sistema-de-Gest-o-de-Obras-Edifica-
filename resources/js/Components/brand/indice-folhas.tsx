import { Link } from '@inertiajs/react';
import {
    Banknote,
    CalendarDays,
    Camera,
    ChartNoAxesColumn,
    ClipboardList,
    FileChartColumn,
    FileText,
    FolderKanban,
    Gavel,
    ListChecks,
    ListOrdered,
    NotebookPen,
    Package,
    Receipt,
    Settings2,
    Shapes,
    Truck,
    UserRound,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import { useEstacaoActiva } from './link-estacao';

type Icone = typeof CalendarDays;

interface Folha {
    nome: string;
    /**
     * Só as folhas emitidas têm rota. `route()` corre no módulo, por isso uma
     * folha sem rota escreve-se sem `href` e fica a lápis no índice.
     */
    href?: string;
    icone: Icone;
}

/**
 * O menu lateral é o índice de folhas de uma pasta de desenho pousada na
 * tábua: cada módulo é uma folha, e só as folhas já emitidas são ligação. O
 * que falta à frente fica escrito a lápis, com a cota e sem ligação — nada de
 * item activo fantasma nem de rota inventada.
 *
 * As separadoras são de cartao manila (a pasta), e a folha em que estamos é
 * a separadora puxada para fora: a pasta acesa dentro de um índice escuro.
 * Antes era uma margem âmbar de 2px num menu claro, que se perdia na pagina
 * inteira — o registo de estação é o mais forte dos quatro e é o que se lê
 * primeiro quando se abre o painel.
 */
const FOLHAS: Array<{ grupo: string; folhas: Folha[] }> = [
    {
        grupo: 'Geral',
        folhas: [
            {
                nome: 'Dashboard',
                href: route('admin.dashboard'),
                icone: ChartNoAxesColumn,
            },
            { nome: 'Agenda', icone: CalendarDays },
            { nome: 'As minhas tarefas', icone: ListChecks },
        ],
    },
    {
        grupo: 'Trabalho',
        folhas: [
            {
                nome: 'Projectos',
                href: route('admin.projectos'),
                icone: FolderKanban,
            },
            { nome: 'Actividades', icone: ListOrdered },
            {
                nome: 'Equipas',
                href: route('admin.equipas'),
                icone: Users,
            },
        ],
    },
    {
        grupo: 'Financeiro',
        folhas: [
            { nome: 'Despesas', icone: Receipt },
            { nome: 'Pagamentos', icone: Banknote },
            { nome: 'Materiais', icone: Package },
            { nome: 'Requisições de materiais', icone: ClipboardList },
            { nome: 'Fornecedores', icone: Truck },
        ],
    },
    {
        grupo: 'Registo de campo',
        folhas: [
            { nome: 'Diário de obra', icone: NotebookPen },
            { nome: 'Fotografias', icone: Camera },
            { nome: 'Documentos', icone: FileText },
        ],
    },
    {
        grupo: 'Colaboração',
        folhas: [
            { nome: 'Reuniões', icone: Users },
            { nome: 'Decisões', icone: Gavel },
        ],
    },
    {
        grupo: 'Análise',
        folhas: [
            { nome: 'Indicadores', icone: ChartNoAxesColumn },
            { nome: 'Relatórios', icone: FileChartColumn },
        ],
    },
    {
        grupo: 'Sistema',
        folhas: [
            {
                nome: 'Utilizadores',
                href: route('admin.utilizadores'),
                icone: UserRound,
            },
            {
                nome: 'Áreas',
                href: route('admin.areas'),
                icone: Shapes,
            },
            { nome: 'Configurações', icone: Settings2 },
        ],
    },
];

const CHAVE = 'sgo.indice-colapsado';

function useRecolhida() {
    const [recolhida, definirRecolhida] = useState(
        () => typeof window !== 'undefined' && window.localStorage.getItem(CHAVE) === '1',
    );

    useEffect(() => {
        window.localStorage.setItem(CHAVE, recolhida ? '1' : '0');
    }, [recolhida]);

    return [recolhida, definirRecolhida] as const;
}

export function IndiceFolhas({ andarinho = false }: { andarinho?: boolean }) {
    const [recolhida, definirRecolhida] = useRecolhida();
    const estreito = recolhida && !andarinho;

    return (
        <nav
            aria-label="Índice de folhas"
            className={cn(
                'flex h-dvh shrink-0 flex-col overflow-y-auto overscroll-contain',
                'border-r border-regua-12 bg-tabua',
                !andarinho && 'transition-[width] duration-150',
                estreito ? 'w-[68px]' : andarinho ? 'w-[268px]' : 'w-[248px]',
            )}
        >
            {andarinho && (
                <div className="flex items-center justify-between border-b border-regua-12 px-3 py-2.5">
                    <span className="cota-t">Índice de folhas</span>
                    <BotaoFechar />
                </div>
            )}

            <div className={cn('flex-1 py-4', estreito ? 'px-2' : 'px-3')}>
                {!estreito && <MarcaPasta />}

                {FOLHAS.map((seccao) => (
                    <section key={seccao.grupo} className="mb-5 last:mb-0">
                        {!estreito && <SeparadorPasta nome={seccao.grupo} />}

                        <ul className={cn('space-y-px', !estreito && 'mt-1.5')}>
                            {seccao.folhas.map((folha) => (
                                <li key={folha.nome}>
                                    <ItemFolha folha={folha} estreito={estreito} />
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>

            {!andarinho && (
                <button
                    type="button"
                    onClick={() => definirRecolhida(!recolhida)}
                    aria-expanded={!recolhida}
                    className={cn(
                        'cota-t sticky bottom-0 flex items-center gap-2 border-t border-regua-12',
                        'bg-tabua px-3 py-2.5 transition-colors hover:bg-placa hover:text-tinta',
                    )}
                >
                    {recolhida ? '›' : '‹'}
                    {!recolhida && <span>Recolher índice</span>}
                </button>
            )}
        </nav>
    );
}

/**
 * Aidentity da pasta, no topo do índice: a chapa de papel colada ao cartao,
 * com o carimbo do produto em tinta de carimbo — a pressão de cima, porque
 * o carimbo de `#31409E` sobre a tábua dá 2,2:1 e não se lê.
 */
function MarcaPasta() {
    return (
        <div className="mb-5 bg-pasta-clara px-2.5 py-2 shadow-selo">
            <p className="font-mono text-2xs leading-none font-bold tracking-[0.2em] text-stamp uppercase">
                SGO
            </p>
            <p className="cota mt-1.5 text-pasta-ink normal-case">
                Pasta de obra · índice de folhas
            </p>
            <p className="anotacao mt-0.5 text-pasta-ink normal-case">
                07 separadoras · 01 emitida
            </p>
        </div>
    );
}

/** A separadora de cada grupo: o cartao manila com o nome escrito na chapa. */
function SeparadorPasta({ nome }: { nome: string }) {
    return (
        <div className="flex items-center gap-2">
            <span aria-hidden className="size-2 shrink-0 bg-pasta" />
            <h2 className="cota-t flex-1 truncate text-pasta">{nome}</h2>
            <span aria-hidden className="h-px flex-1 bg-pasta-32" />
        </div>
    );
}

/** O botão que fecha o índice no ecrã pequeno; vive dentro do painel. */
function BotaoFechar() {
    return (
        <button
            type="button"
            onClick={() => document.dispatchEvent(new CustomEvent('sgo:fechar-indice'))}
            className="grid size-8 place-items-center text-tinta-72 transition-colors hover:bg-placa hover:text-tinta"
        >
            <X aria-hidden className="size-4" />
            <span className="sr-only">Fechar índice de folhas</span>
        </button>
    );
}

/**
 * Abaixo de `lg` o índice não tem lugar ao lado da folha, por isso passa a ser
 * um painel sobreposto. Sem isto o menu simplesmente desaparecia.
 */
export function IndiceFolhasAndarinho({ aberto, fechar }: { aberto: boolean; fechar: () => void }) {
    useEffect(() => {
        if (!aberto) return;

        function aoTeclar(evento: KeyboardEvent) {
            if (evento.key === 'Escape') fechar();
        }

        document.addEventListener('keydown', aoTeclar);

        return () => document.removeEventListener('keydown', aoTeclar);
    }, [aberto, fechar]);

    useEffect(() => {
        function aoFechar() {
            fechar();
        }

        document.addEventListener('sgo:fechar-indice', aoFechar);

        return () => document.removeEventListener('sgo:fechar-indice', aoFechar);
    }, [fechar]);

    if (!aberto) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <button
                type="button"
                onClick={fechar}
                className="absolute inset-0 bg-tabua/70"
                aria-label="Fechar índice de folhas"
            />
            <div className="absolute inset-y-0 left-0 shadow-folha">
                <IndiceFolhas andarinho />
            </div>
        </div>
    );
}

function ItemFolha({ folha, estreito }: { folha: Folha; estreito: boolean }) {
    // O gancho corre sempre: `folha.href` só muda entre folhas diferentes, mas
    // um menu que cresce a partir da secção 3 passa a ser dinamico e um gancho
    // condicional aqui rebentaria a ordem de chamadas.
    const activa = useEstacaoActiva(folha.href ?? '');
    const Icone = folha.icone;

    if (!folha.href) {
        return (
            <span
                aria-disabled
                title={`${folha.nome} — ainda não emitido`}
                className={cn(
                    'flex items-center gap-2 border-l border-dashed border-regua-20 py-1.5 pr-2 pl-2.5',
                    // O que falta à frente continua legível, não um fantasma: a
                    // 14px `tinta-32` dá 2,6:1. É o traço a lápis que diz "ainda
                    // não", não a cor que o apaga.
                    'text-tinta-72',
                    estreito && 'justify-center border-l-0 pr-0 pl-0',
                )}
            >
                <Icone className="size-4 shrink-0" strokeWidth={1.25} />
                {!estreito && <span className="truncate text-sm">{folha.nome}</span>}
            </span>
        );
    }

    return (
        <Link
            href={folha.href}
            aria-current={activa ? 'page' : undefined}
            title={estreito ? folha.nome : undefined}
            className={cn(
                'group flex items-center gap-2 border-l-2 py-1.5 pr-2 pl-2 transition-colors',
                estreito && 'justify-center pr-0 pl-0',
                // A folha em que estamos é a separadora puxada: cartao manila
                // aceso com o nome em grafite. A estação activa é o registo
                // mais forte do painel e passa a ler-se à distância.
                activa
                    ? 'border-l-graphite bg-pasta font-semibold text-graphite shadow-folha'
                    : 'border-l-transparent text-tinta-72 hover:border-l-pasta hover:bg-placa hover:text-tinta',
            )}
        >
            <Icone className="size-4 shrink-0" strokeWidth={activa ? 2 : 1.5} />
            {!estreito && <span className="truncate">{folha.nome}</span>}
        </Link>
    );
}

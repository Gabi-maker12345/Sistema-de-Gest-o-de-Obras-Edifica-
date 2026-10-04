import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { Bolha, BolhaConteudo } from './popover';
import { ComDica } from './dica';

/**
 * O combo: o campo das entidades relacionadas.
 *
 * A spec proíbe o `<select>` nativo — as opções de um projecto são nomes com
 * acentos, cinco ou trinta, e o menu do sistema não é uma folha deste produto.
 * Este é o mesmo campo com pesquisa, com teclado completo e com a pressão
 * correcta: o que está escolhido escreve-se a grafite, o placeholder é a
 * cota mais ténue, e o foco é âmbar porque o foco é acção.
 */
export interface OpcaoCombo {
    valor: string;
    rotulo: string;
    /** A linha de baixo: o cargo, a área, o estado. Nunca obrigatória. */
    nota?: string;
}

export function Combo({
    id,
    valor,
    opcoes,
    aoEscolher,
    aoLimpar,
    vazio = 'Sem registos para escolher.',
    placeholder = 'Escolher…',
    desactivado = false,
    placeholderDesactivado,
    className,
}: {
    id?: string;
    valor: string | null;
    opcoes: OpcaoCombo[];
    aoEscolher: (valor: string) => void;
    aoLimpar?: () => void;
    vazio?: string;
    placeholder?: string;
    desactivado?: boolean;
    /** O que se lê enquanto o campo pai não está preenchido. */
    placeholderDesactivado?: string;
    className?: string;
}) {
    const [aberto, definirAberto] = useState(false);
    const [termo, definirTermo] = useState('');
    const [activo, definirActivo] = useState(0);
    const listaRef = useRef<HTMLUListElement>(null);

    const escrita = desactivado && placeholderDesactivado ? placeholderDesactivado : placeholder;
    const escolhida = opcoes.find((opcao) => opcao.valor === valor) ?? null;

    const filtradas = useMemo(() => {
        const alvo = termo.trim().toLowerCase();

        if (!alvo) {
            return opcoes;
        }

        return opcoes.filter((opcao) =>
            `${opcao.rotulo} ${opcao.nota ?? ''}`.toLowerCase().includes(alvo),
        );
    }, [opcoes, termo]);

    // Abrir o combo repõe a lista: o campo esvazia-se e o activo volta para a
    // opção já escolhida, para que Enter reaproveite o que estava marcado em vez
    // de saltar para a primeira linha. As listas chegam como array novo a cada
    // desenho do ecrã, por isso o-effect de abertura lê-las por referência: se
    // dependesse delas, cada tecla reporia o activo e o teclado não andava.
    const ultimas = useRef({ opcoes, valor });

    useEffect(() => {
        ultimas.current = { opcoes, valor };
    });

    useEffect(() => {
        if (aberto) {
            definirTermo('');
            definirActivo(
                Math.max(0, ultimas.current.opcoes.findIndex((o) => o.valor === ultimas.current.valor)),
            );
        }
    }, [aberto]);

    useEffect(() => {
        definirActivo((actual) => Math.min(actual, Math.max(0, filtradas.length - 1)));
    }, [filtradas.length]);

    // A opção activa desce até ao fim da lista quando o rato desce; o teclado não
    // a deixa a meio caminho de um `overflow` que ninguém vê.
    useEffect(() => {
        if (!aberto) {
            return;
        }

        listaRef.current
            ?.querySelectorAll<HTMLElement>('[role="option"]')
            [activo]?.scrollIntoView({ block: 'nearest' });
    }, [activo, aberto]);

    function escolher(opcao: OpcaoCombo) {
        aoEscolher(opcao.valor);
        definirAberto(false);
    }

    function aoTeclar(evento: React.KeyboardEvent) {
        if (evento.key === 'ArrowDown') {
            evento.preventDefault();
            definirActivo((actual) => Math.min(filtradas.length - 1, actual + 1));
        } else if (evento.key === 'ArrowUp') {
            evento.preventDefault();
            definirActivo((actual) => Math.max(0, actual - 1));
        } else if (evento.key === 'Enter' && aberto) {
            evento.preventDefault();

            const opcao = filtradas[activo];

            if (opcao) {
                escolher(opcao);
            }
        } else if (evento.key === 'Home' && aberto) {
            evento.preventDefault();
            definirActivo(0);
        } else if (evento.key === 'End' && aberto) {
            evento.preventDefault();
            definirActivo(Math.max(0, filtradas.length - 1));
        }
    }

    return (
        <PopoverPrimitive.Root open={aberto} onOpenChange={definirAberto}>
            <div className={cn('flex gap-1', className)}>
                <PopoverPrimitive.Trigger
                    id={id}
                    disabled={desactivado}
                    className={cn(
                        'flex h-10 min-w-0 flex-1 items-center justify-between gap-2 rounded-nib border border-graphite-32 bg-paper-raised px-3 py-2 text-left text-sm',
                        'transition-colors hover:border-graphite-48',
                        'focus-visible:border-amber focus-visible:ring-1 focus-visible:ring-amber focus-visible:outline-none',
                        'aria-invalid:border-red-pencil',
                        'disabled:cursor-not-allowed disabled:bg-graphite-04 disabled:text-graphite-32',
                    )}
                >
                    <span
                        className={cn(
                            'truncate',
                            !escolhida && !desactivado && 'text-graphite-32',
                        )}
                    >
                        {escolhida ? escolhida.rotulo : escrita}
                    </span>
                    <ChevronDown aria-hidden className="size-4 shrink-0 text-graphite-48" />
                </PopoverPrimitive.Trigger>

                {aoLimpar && valor && !desactivado && (
                    <ComDica texto="Limpar escolha">
                        <button
                            type="button"
                            onClick={aoLimpar}
                            className="grid size-10 shrink-0 place-items-center border border-graphite-32 text-graphite-64 transition-colors hover:border-graphite hover:text-graphite"
                        >
                            <X aria-hidden className="size-4" />
                            <span className="sr-only">Limpar escolha</span>
                        </button>
                    </ComDica>
                )}
            </div>

            <BolhaConteudo
                align="start"
                className="w-[var(--radix-popover-trigger-width)] min-w-64 p-0"
                onKeyDown={aoTeclar}
            >
                <div className="flex items-center gap-2 border-b border-graphite-12 px-3 py-2">
                    <Search aria-hidden className="size-3.5 shrink-0 text-graphite-48" />
                    <input
                        value={termo}
                        onChange={(evento) => {
                            definirTermo(evento.target.value);
                            definirActivo(0);
                        }}
                        aria-label="Pesquisar opções"
                        placeholder="Pesquisar…"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-graphite-32"
                    />
                </div>

                {filtradas.length === 0 ? (
                    <p className="px-3 py-3 text-sm text-graphite-64">{vazio}</p>
                ) : (
                    <ul ref={listaRef} role="listbox" aria-label={escrita} className="max-h-60 overflow-y-auto p-1">
                        {filtradas.map((opcao, indice) => {
                            const marcada = opcao.valor === valor;

                            return (
                                <li key={opcao.valor} role="option" aria-selected={marcada}>
                                    <button
                                        type="button"
                                        onClick={() => escolher(opcao)}
                                        onMouseEnter={() => definirActivo(indice)}
                                        className={cn(
                                            'flex w-full items-center gap-2 rounded-nib px-2 py-1.5 text-left text-sm',
                                            indice === activo ? 'bg-amber text-graphite' : 'text-graphite',
                                        )}
                                    >
                                        <span
                                            aria-hidden
                                            className={cn(
                                                'grid size-3.5 shrink-0 place-items-center',
                                                !marcada && 'opacity-0',
                                            )}
                                        >
                                            <Check className="size-3.5" strokeWidth={3} />
                                        </span>

                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate">{opcao.rotulo}</span>
                                            {opcao.nota && (
                                                <span
                                                    className={cn(
                                                        'cota block truncate',
                                                        indice === activo
                                                            ? 'text-graphite'
                                                            : 'text-graphite-64',
                                                    )}
                                                >
                                                    {opcao.nota}
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </BolhaConteudo>
        </PopoverPrimitive.Root>
    );
}

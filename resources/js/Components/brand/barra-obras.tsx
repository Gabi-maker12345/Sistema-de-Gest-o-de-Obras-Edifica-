import { useEffect, useRef } from 'react';

import type { Projecto } from '@/Data/types';
import { cn } from '@/lib/utils';

/**
 * A barra de estações: as obras visíveis como separadoras de pasta.
 *
 * Substitui o combo da escolha da obra, e a substituição não é cosmética. O
 * combo escondia a escolha dentro de um campo: para saber se alguma obra tinha
 * registo tinha de se abrir o menu, e a lista que abria caía fora da folha — por
 * cima do título e encostada à margem do ecrã, porque a folha não tinha onde a
 * receber. Aqui a escolha está à vista, inteira, e o que se escolhe fica escrito
 * numa separadora puxada para fora.
 *
 * A gramática é a do índice de folhas: a estação em que estamos é cartão manila
 * com o nome a grafite, as outras são traço a lápis. É a mesma leitura no mesmo
 * lugar — quem aprendeu o índice sabe escolher a obra sem o aprender.
 *
 * A barra rola na horizontal quando as obras não cabem: no estaleiro não há
 * largura para seis separadoras, e encoluê-las até ao `truncate` de cada nome
 * seria trocar a escolha por um enigma. Com `tablist` e tabindex a correr, as
 * setas passam de estação em estação, que é o que se espera de uma tira de
 * separadoras.
 */
export function BarraObras({
    obras,
    contar,
    activo,
    aoEscolher,
    className,
}: {
    obras: Projecto[];
    contar: (projectoId: string) => number;
    /** A obra em leitura. `null` é o índice: a primeira separadora da pasta. */
    activo: string | null;
    aoEscolher: (projectoId: string | null) => void;
    className?: string;
}) {
    const trilhoRef = useRef<HTMLDivElement>(null);

    // A estação escolhida sai do ecrã quando há muitas obras, e uma escolha que
    // não se vê parece uma escolha que não aconteceu.
    useEffect(() => {
        trilhoRef.current
            ?.querySelector<HTMLElement>('[data-estacao-activa="sim"]')
            ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }, [activo]);

    function aoTeclar(evento: React.KeyboardEvent<HTMLDivElement>) {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(evento.key)) {
            return;
        }

        evento.preventDefault();

        // A primeira estação é o índice da pasta e entra na sequência: é por ela
        // que se volta a ver as obras todas.
        const ids: Array<string | null> = [null, ...obras.map((obra) => obra.id)];
        const actual = ids.indexOf(activo);

        const destino =
            evento.key === 'Home'
                ? 0
                : evento.key === 'End'
                  ? ids.length - 1
                  : evento.key === 'ArrowRight'
                    ? (actual + 1 + ids.length) % ids.length
                    : (actual - 1 + ids.length) % ids.length;

        aoEscolher(ids[destino]);
    }

    return (
        <div className={cn('min-w-0', className)}>
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 border-b border-graphite-32 pb-2">
                <p className="cota text-graphite">Estações · a obra em leitura</p>
                <p className="cota">
                    {obras.length === 0
                        ? 'nenhuma obra visível a este utilizador'
                        : `${obras.length} ${obras.length === 1 ? 'obra visível' : 'obras visíveis'}`}
                </p>
            </div>

            <div
                ref={trilhoRef}
                role="tablist"
                aria-label="Escolher a obra em leitura"
                aria-orientation="horizontal"
                onKeyDown={aoTeclar}
                className="flex gap-px overflow-x-auto"
            >
                <Estacao
                    nome="Índice das obras"
                    contagem={obras.length}
                    activa={activo === null}
                    aoEscolher={() => aoEscolher(null)}
                />

                {obras.map((obra) => (
                    <Estacao
                        key={obra.id}
                        nome={obra.nome}
                        contagem={contar(obra.id)}
                        activa={activo === obra.id}
                        aoEscolher={() => aoEscolher(obra.id)}
                    />
                ))}
            </div>
        </div>
    );
}

function Estacao({
    nome,
    contagem,
    activa,
    aoEscolher,
}: {
    nome: string;
    contagem: number;
    activa: boolean;
    aoEscolher: () => void;
}) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={activa}
            tabIndex={activa ? 0 : -1}
            data-estacao-activa={activa ? 'sim' : undefined}
            onClick={aoEscolher}
            title={nome}
            className={cn(
                'flex shrink-0 items-center gap-2 rounded-t-nib border border-b-0 px-3 py-2 transition-colors',
                // O anel de foco para dentro: a barra rola e um anel por fora
                // seria cortado pelo bordo do trilho.
                'focus-visible:outline-offset-[-2px]',
                activa
                    ? 'border-graphite-32 bg-pasta text-graphite'
                    : 'border-graphite-20 text-graphite-64 hover:bg-graphite-04 hover:text-graphite',
            )}
        >
            <span className="max-w-[18rem] truncate text-sm">{nome}</span>
            <span className={cn('cota tabular', activa ? 'text-pasta-ink' : 'text-graphite-48')}>
                {contagem}
            </span>
        </button>
    );
}
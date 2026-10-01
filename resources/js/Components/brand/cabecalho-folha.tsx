import type { ReactNode } from 'react';

import { dataExtenso } from '@/lib/format';
import { cn } from '@/lib/utils';

import { BlocoTitulo } from './bloco-titulo';
import type { Medicao } from './quadro-medicoes';
import { QuadroMedicoes } from './quadro-medicoes';

/**
 * O cabeçalho de uma folha de registo: à esquerda o assunto e a acção, à
 * direita o bloco de título do desenho.
 *
 * É a mesma peça em Projectos, Utilizadores, Áreas e Equipas, e é o que faz
 * os quatro cadastros lerem-se como folhas da mesma pasta e não como quatro
 * ecrãs. O que muda entre elas é a cotação, não a gramática.
 *
 * O `h1` é o assunto e o conteúdo tem de o igualar: por isso as leituras do
 * bloco de título vivem sobre a tábua, que é a massa escura da folha, e não
 * seis números a cinzento por baixo de um título. Uma saudação acima de uma
 * tabela a 11px era hierarquia invertida.
 */
export function CabecalhoFolha({
    cota,
    titulo,
    linha,
    anotacao,
    acoes,
    medicoes,
    folha,
    revisao = 'C',
    escala = '1:1',
    larguraMedicoes = 'sm:w-[420px]',
    className,
}: {
    /** A proveniência: que folha é esta e de que registo. */
    cota: string;
    titulo: string;
    /** A linha de quem está a ver e o que a folha tem para ler. */
    linha: ReactNode;
    /** A letra a lápis do canto do desenho. */
    anotacao?: ReactNode;
    acoes?: ReactNode;
    medicoes: Medicao[];
    folha: string;
    revisao?: string;
    escala?: string;
    larguraMedicoes?: string;
    className?: string;
}) {
    return (
        <header className={cn('flex flex-wrap items-start justify-between gap-8', className)}>
            <div className="min-w-0 max-w-md space-y-3">
                <p className="cota">{cota}</p>

                <h1 className="text-4xl font-semibold tracking-tight text-graphite">{titulo}</h1>

                <p className="text-sm text-graphite-64">{linha}</p>

                {anotacao && <p className="anotacao normal-case">{anotacao}</p>}

                {acoes && <div className="pt-1">{acoes}</div>}
            </div>

            <div className={cn('w-full space-y-3', larguraMedicoes)}>
                <QuadroMedicoes colunas={2} superficie="tabua" medicoes={medicoes} />

                <BlocoTitulo
                    className="w-full"
                    folha={folha}
                    escala={escala}
                    revisao={revisao}
                    emitidoEm={dataExtenso(new Date())}
                />
            </div>
        </header>
    );
}

import { useMemo, useState } from 'react';

import { useBusca } from '@/Components/brand/contexto-busca';
import { useSgo } from '@/Data/SgoContext';
import type { Projecto } from '@/Data/types';
import { folha } from '@/lib/format';

/** As colunas da folha de cotas, na ordem em que são medidas. */
export type Coluna =
    'folha' | 'projecto' | 'estado' | 'fisica' | 'financeira' | 'desvio' | 'espera';

/**
 * A grelha da folha. Em ecrã estreito as células caem uma abaixo da outra, cada
 * uma com a sua cota à esquerda; a partir de `md` cada linha é a própria grelha
 * e cai exactamente por baixo da linha de cota que a mede.
 */
export const GRELHA =
    'grid grid-cols-1 md:grid-cols-[52px_minmax(0,1fr)_104px_132px_132px_64px_56px]';

export const COLUNAS: Array<{
    chave: Coluna;
    cota: string;
    alinhamento?: 'direita';
}> = [
    { chave: 'folha', cota: 'Folha' },
    { chave: 'projecto', cota: 'Projecto · cliente' },
    { chave: 'estado', cota: 'Estado' },
    { chave: 'fisica', cota: 'Exec. física', alinhamento: 'direita' },
    { chave: 'financeira', cota: 'Exec. financeira', alinhamento: 'direita' },
    { chave: 'desvio', cota: 'Desvio', alinhamento: 'direita' },
    { chave: 'espera', cota: 'Espera', alinhamento: 'direita' },
];

export interface Linha {
    numero: number;
    projecto: Projecto;
    fisica: number;
    financeira: number;
    desvio: number;
    /** Despesas deste projecto à espera de aprovação. */
    espera: number;
}

type Sentido = 'asc' | 'desc';

function normalizar(valor: string): string {
    return valor
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '');
}

/**
 * As linhas da folha: um número de executes por projecto, ordenadas pelo maior
 * desvio — a leitura que o gestor procura primeiro, a diferença entre o que
 * está feito e o que está pago. Tocar numa cota volta a folha ao contrário.
 */
export function useLinhas() {
    const { projectosVisiveis, execucaoFisica, execucaoFinanceira, despesas } = useSgo();
    const { termo } = useBusca();
    const [ordem, definirOrdem] = useState<{
        coluna: Coluna;
        sentido: Sentido;
    }>({
        coluna: 'desvio',
        sentido: 'desc',
    });

    const linhas = useMemo<Linha[]>(() => {
        const todas = projectosVisiveis.map((projecto, indice) => {
            const fisica = execucaoFisica(projecto.id);
            const financeira = execucaoFinanceira(projecto.id);

            return {
                numero: indice + 1,
                projecto,
                fisica,
                financeira,
                desvio: fisica - financeira,
                espera: despesas.filter(
                    (despesa) =>
                        despesa.projectoId === projecto.id &&
                        despesa.estadoAprovacao === 'pendente',
                ).length,
            };
        });

        const procurado = normalizar(termo.trim());

        const filtradas = procurado
            ? todas.filter((linha) =>
                  normalizar(
                      `${linha.projecto.nome} ${linha.projecto.cliente} ${linha.projecto.estadoGeral}`,
                  ).includes(procurado),
              )
            : todas;

        const [nomeDe, numeroDe] = [
            (linha: Linha) => linha.projecto.nome.toLowerCase(),
            (linha: Linha) => linha.numero,
        ];

        const valores: Record<Coluna, (linha: Linha) => number | string> = {
            folha: numeroDe,
            projecto: nomeDe,
            estado: (linha) => linha.projecto.estadoGeral,
            fisica: (linha) => linha.fisica,
            financeira: (linha) => linha.financeira,
            desvio: (linha) => Math.abs(linha.desvio),
            espera: (linha) => linha.espera,
        };

        const valor = valores[ordem.coluna];
        const direccao = ordem.sentido === 'asc' ? 1 : -1;

        return [...filtradas].sort((a, b) => {
            const va = valor(a);
            const vb = valor(b);

            if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * direccao;
            return String(va).localeCompare(String(vb), 'pt') * direccao;
        });
    }, [projectosVisiveis, despesas, execucaoFisica, execucaoFinanceira, ordem, termo]);

    const vaziaPorFiltro = linhas.length === 0 && projectosVisiveis.length > 0;

    const alternar = (coluna: Coluna) => {
        definirOrdem((actual) => {
            if (actual.coluna !== coluna) {
                // A folha abre pelo maior desvio; ao escolher outra coluna
                // começa pelo lado que o desenho esconde: o maior.
                return { coluna, sentido: 'desc' };
            }

            return {
                coluna,
                sentido: actual.sentido === 'desc' ? 'asc' : 'desc',
            };
        });
    };

    return {
        linhas,
        total: projectosVisiveis.length,
        vaziaPorFiltro,
        termoActivo: termo.trim().length > 0,
        ordem,
        alternar,
    };
}

/** O rótulo de folha que cada linha usa, para a cota e para o carimbo. */
export function numeroFolha(numero: number, total: number): string {
    return folha(numero, Math.max(total, 8));
}

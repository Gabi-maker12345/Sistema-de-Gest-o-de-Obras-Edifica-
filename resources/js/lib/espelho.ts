import type { Projecto } from '@/Data/types';

/**
 * A aritmética do espelho de datas.
 *
 * O espelho não é um cronograma: é a janela de cada projecto — a cota com
 * traços de extremo — desenhada sobre um eixo de calendário, com o enchimento
 * da execução a medir o que está dentro dela. A régua de hoje é a linha que
 * separa o que ainda tem prazo do que já não tem, e o que está atrasado é a
 * única coisa da folha que pode levantar o lápis vermelho.
 *
 * Vivem aqui as contas para que a folha de projectos, o detalhe e os estados
 * vazios nunca desenhem a mesma janela duas vezes com regras diferentes.
 */

/** `hoje` em meia-noite local, para a régua não cair a meio do dia. */
export function hoje(): Date {
    const agora = new Date();

    return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
}

/**
 * Uma data ISO curta escrita em hora local. `new Date('2026-03-14')` seria
 * meia-noite UTC, que num fuso atrás do meridiano recua um dia e desalinha a
 * janela do projecto do dia em que ela termina.
 */
export function dataLocal(iso: string | null | undefined): Date | null {
    if (!iso) {
        return null;
    }

    const [ano, mes, dia] = iso.slice(0, 10).split('-').map(Number);

    if (!ano || !mes || !dia) {
        return null;
    }

    return new Date(ano, mes - 1, dia);
}

export interface Janela {
    projecto: Projecto;
    /** Início previsto em obra. */
    inicio: Date;
    /** Fim real quando existe, fim previsto caso contrário. */
    fim: Date;
    fisica: number;
    financeira: number;
    /** Física menos financeira, em pontos percentuais. */
    desvio: number;
    /**
     * O prazo fechou e o trabalho não chegou ao fim. Um projecto cancelado não
     * está atrasado: parou, e parar é uma decisão, não um atraso.
     */
    prazoEstourado: boolean;
    /** O que ficou por construir depois do fim previsto. */
    restante: number;
}

export function janelaDe(
    projecto: Projecto,
    fisica: number,
    financeira: number,
    referencia = hoje(),
): Janela {
    const inicio = dataLocal(projecto.dataInicio) ?? referencia;
    const fimReal = dataLocal(projecto.dataFimReal);
    const fim = fimReal ?? dataLocal(projecto.dataFimPrevista) ?? referencia;
    const desvio = fisica - financeira;
    const encerrado = projecto.estadoGeral === 'cancelado';

    return {
        projecto,
        inicio,
        fim,
        fisica,
        financeira,
        desvio,
        prazoEstourado: !fimReal && !encerrado && referencia > fim && fisica < 100,
        restante: Math.max(0, 100 - fisica),
    };
}

const MESES = new Intl.DateTimeFormat('pt-PT', { month: 'short' });

export interface Dominio {
    de: Date;
    ate: Date;
    /** Duração total em dias, para as percentagens não saltarem em janelas curtas. */
    dias: number;
    meses: Array<{ de: Date; rotulo: string }>;
}

/**
 * O domínio é a casa comum: do primeiro dia do mês em que a obra mais antiga
 * começa ao último dia do mês em que a obra mais recente acaba, e nunca menos
 * que o mês corrente. Uma obra que termina dentro do mesmo mês em que começa
 * não pode encolher o eixo para um dia só.
 */
export function dominioDe(janelas: Janela[], referencia = hoje()): Dominio {
    const limites = janelas.flatMap((janela) => [janela.inicio, janela.fim]);

    const maisAntigo = limites.reduce<Date>(
        (menor, data) => (data < menor ? data : menor),
        referencia,
    );
    const maisRecente = limites.reduce<Date>(
        (maior, data) => (data > maior ? data : maior),
        referencia,
    );

    const de = new Date(maisAntigo.getFullYear(), maisAntigo.getMonth(), 1);
    const ultimoMes = new Date(maisRecente.getFullYear(), maisRecente.getMonth() + 1, 0);
    const ate = new Date(ultimoMes.getFullYear(), ultimoMes.getMonth() + 1, 1);

    const meses: Dominio['meses'] = [];
    const cursor = new Date(de);

    while (cursor < ate) {
        meses.push({ de: new Date(cursor), rotulo: MESES.format(cursor).replace('.', '') });
        cursor.setMonth(cursor.getMonth() + 1);
    }

    return { de, ate, dias: Math.max(1, Math.round((ate.getTime() - de.getTime()) / 86_400_000)), meses };
}

/** A posição de uma data no eixo, em percentagem da largura da folha. */
export function posicao(data: Date, dominio: Dominio): number {
    const passado = (data.getTime() - dominio.de.getTime()) / 86_400_000;

    return Math.max(0, Math.min(100, (passado / dominio.dias) * 100));
}

/** A largura de uma janela, em percentagem da folha. */
export function largura(janela: Janela, dominio: Dominio): number {
    return Math.max(0, posicao(janela.fim, dominio) - posicao(janela.inicio, dominio));
}

/** `1 a 7` — o que a cota do eixo escreve por cima de cada mês. */
export function numeroDoMes(data: Date): number {
    return data.getMonth() + 1;
}

/** A hora de hoje em percentagem, para a régua e para as suas legendas. */
export function reguaDeHoje(dominio: Dominio, referencia = hoje()): number {
    return posicao(referencia, dominio);
}

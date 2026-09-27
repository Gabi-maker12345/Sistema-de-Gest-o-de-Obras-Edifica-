/**
 * Formatadores do SGO.
 *
 * D2: a moeda é o kwanza (AOA), prefixo `Kz`, e todos os valores monetários do
 * produto passam por aqui — nunca há `€` nem formatação manual.
 */

const KZ = new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

const KZ_CENTIMOS = new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

/** 12 500 000 → `Kz 12 500 000` */
export function moeda(valor: number | null | undefined, comCentimos = false): string {
    if (valor === null || valor === undefined || Number.isNaN(valor)) {
        return '—';
    }

    const formato = comCentimos ? KZ_CENTIMOS : KZ;

    return `Kz ${formato.format(valor)}`;
}

/** 12 500 000 → `12 500 000`, para eixos de gráficos e campos com prefixo `Kz`. */
export function numero(valor: number | null | undefined): string {
    if (valor === null || valor === undefined || Number.isNaN(valor)) {
        return '—';
    }

    return KZ.format(valor);
}

/** 62.4 → `62%` */
export function percentagem(valor: number | null | undefined, casas = 0): string {
    if (valor === null || valor === undefined || Number.isNaN(valor)) {
        return '—';
    }

    return `${valor.toLocaleString('pt-PT', {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas,
    })}%`;
}

/** 1 240 000 → `1,24 M` — para eixos densos. */
export function moedaCompacta(valor: number | null | undefined): string {
    if (valor === null || valor === undefined || Number.isNaN(valor)) {
        return '—';
    }

    const escala = Math.abs(valor);

    if (escala >= 1_000_000_000) {
        return `Kz ${(valor / 1_000_000_000).toLocaleString('pt-PT', { maximumFractionDigits: 1 })} MM`;
    }

    if (escala >= 1_000_000) {
        return `Kz ${(valor / 1_000_000).toLocaleString('pt-PT', { maximumFractionDigits: 1 })} M`;
    }

    if (escala >= 1_000) {
        return `Kz ${(valor / 1_000).toLocaleString('pt-PT', { maximumFractionDigits: 0 })} mil`;
    }

    return `Kz ${KZ.format(valor)}`;
}

const DATA = new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
});

const DATA_HORA = new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

const DIA = new Intl.DateTimeFormat('pt-PT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
});

const HORA = new Intl.DateTimeFormat('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
});

/** '2026-03-14' → `14/03/2026` */
export function data(valor: string | Date | null | undefined): string {
    const d = toDate(valor);

    return d ? DATA.format(d) : '—';
}

/** '2026-03-14T09:30' → `14/03/2026 09:30` */
export function dataHora(valor: string | Date | null | undefined): string {
    const d = toDate(valor);

    return d ? DATA_HORA.format(d) : '—';
}

/** `sexta-feira, 27 de setembro de 2026` */
export function dataExtenso(valor: string | Date | null | undefined): string {
    const d = toDate(valor);

    return d ? DIA.format(d) : '—';
}

export function hora(valor: string | Date | null | undefined): string {
    const d = toDate(valor);

    return d ? HORA.format(d) : '—';
}

/** Data ISO curta para atributos e para a prancha. */
export function dataIso(valor: string | Date | null | undefined): string {
    const d = toDate(valor);

    return d ? d.toISOString().slice(0, 10) : '';
}

/** 'há 3 dias' / 'em 2 semanas' — a escala de revisão é relativa. */
export function relativo(valor: string | Date | null | undefined): string {
    const d = toDate(valor);

    if (!d) {
        return '—';
    }

    const segundos = Math.round((d.getTime() - Date.now()) / 1000);
    const absoluto = Math.abs(segundos);

    const unidades: Array<[Intl.RelativeTimeFormatUnit, number]> = [
        ['year', 31_536_000],
        ['month', 2_592_000],
        ['day', 86_400],
        ['hour', 3_600],
        ['minute', 60],
    ];

    const formatador = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });

    for (const [unidade, tamanho] of unidades) {
        if (absoluto >= tamanho) {
            return formatador.format(Math.round(segundos / tamanho), unidade);
        }
    }

    return formatador.format(Math.round(segundos), 'second');
}

function toDate(valor: string | Date | null | undefined): Date | null {
    if (valor === null || valor === undefined || valor === '') {
        return null;
    }

    const d = valor instanceof Date ? valor : new Date(valor);

    return Number.isNaN(d.getTime()) ? null : d;
}

/** Iniciais para o carimbo: `Ana Maria Fernandes` → `AF`. */
export function iniciais(nome: string): string {
    return nome
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0]?.toUpperCase() ?? '')
        .join('');
}

/** Número de folha da prancha: `01`, `02`, … */
export function folha(n: number, total = 8): string {
    return String(n).padStart(2, '0');
}

export { folha as numeroFolha };

/**
 * A malha do calendário.
 *
 * A Agenda é a única folha do produto que se lê no tempo em vez de se ler em
 * lista, e por isso precisa de aritmética própria: a semana começa à segunda
 * (é assim que se escreve em obra, não ao domingo), o mês é uma grade de seis
 * linhas para não mudar de altura ao mudar de mês, e o dia é a chave de tudo —
 * dois eventos são do mesmo dia quando a parte da data coincide, mesmo que a
 * hora seja diferente.
 *
 * As funções daqui são só de calendário. Nada de React, nada de estado.
 */

/** A semana na ordem em que a obra escreve: segunda a domingo. */
export const DIAS_SEMANA = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

export const DIAS_SEMANA_LONGOS = [
    'segunda-feira',
    'terça-feira',
    'quarta-feira',
    'quinta-feira',
    'sexta-feira',
    'sábado',
    'domingo',
];

/** `2026-09-14` — a chave de um dia, sem hora. */
export function chaveDia(data: Date): string {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(
        data.getDate(),
    ).padStart(2, '0')}`;
}

/** A parte da data de um `YYYY-MM-DDTHH:mm:ss`, ou do próprio `YYYY-MM-DD`. */
export function diaDe(iso: string): string {
    return iso.slice(0, 10);
}

/** `2026-09-14T09:00:00` → a data local. Evita o `new Date(iso)` deslocado a UTC. */
export function instanteDe(iso: string): Date {
    return new Date(iso);
}

/** A segunda-feira da semana de `data`. */
export function inicioDaSemana(data: Date): Date {
    const novo = new Date(data.getFullYear(), data.getMonth(), data.getDate());
    const desvio = (novo.getDay() + 6) % 7;

    novo.setDate(novo.getDate() - desvio);

    return novo;
}

export function deslocarDias(data: Date, dias: number): Date {
    const novo = new Date(data.getFullYear(), data.getMonth(), data.getDate());

    novo.setDate(novo.getDate() + dias);

    return novo;
}

/**
 * Os 42 dias do mês: seis linhas de sete, para o mês não mudar de altura ao
 * mudar de mês. Os dias do mês vizinho entram esbatidos — é o que permite
 * ler a semana que atravessa a virada do mês sem sair do ecrã.
 */
export function gradeDoMes(referencia: Date): Date[] {
    const primeiro = new Date(referencia.getFullYear(), referencia.getMonth(), 1);

    return gradeDaSemana(inicioDaSemana(primeiro));
}

export function gradeDaSemana(referencia: Date): Date[] {
    const inicio = inicioDaSemana(referencia);

    return Array.from({ length: 7 }, (_, indice) => deslocarDias(inicio, indice));
}

export function mesmoDia(a: Date, b: Date): boolean {
    return chaveDia(a) === chaveDia(b);
}

export function mesmoMes(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** `setembro de 2026` — o cabeçalho do mês, em minúsculas como a spec escreve. */
export function rotuloMes(data: Date): string {
    const nome = new Intl.DateTimeFormat('pt-PT', { month: 'long' }).format(data);

    return `${nome} de ${data.getFullYear()}`;
}

export function rotuloMesCurto(data: Date): string {
    return new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' }).format(data);
}

/** `14/03` — a etiqueta de dia no eixo. */
export function diaMes(iso: string): string {
    const data = instanteDe(iso);

    return `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(
        2,
        '0',
    )}`;
}

/** `sem 14/03 a dom 20/03` — o intervalo de uma semana, escrito como se lê. */
export function rotuloSemana(referencia: Date): string {
    const dias = gradeDaSemana(referencia);
    const inicio = dias[0];
    const fim = dias[6];
    const mesmoMes = inicio.getMonth() === fim.getMonth();

    if (mesmoMes) {
        return `${inicio.getDate()} a ${fim.getDate()} ${MESES_CURTOS[inicio.getMonth()]}`;
    }

    return `${inicio.getDate()} ${MESES_CURTOS[inicio.getMonth()]} a ${
        fim.getDate()
    } ${MESES_CURTOS[fim.getMonth()]}`;
}

const MESES_CURTOS = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
];

/**
 * A semana em que cai um dia, como intervalo fechado de dias. É o que separa
 * «Esta semana» de «Para hoje» nos filtros rápidos: esta é a segunda-feira a
 * domingo à volta do dia, não os próximos sete dias.
 */
export function semanaDoDia(data: Date): { inicio: string; fim: string } {
    const dias = gradeDaSemana(data);

    return { inicio: chaveDia(dias[0]), fim: chaveDia(dias[6]) };
}

/** Um dia empilhado sobre outro, com a data colada com hora e segundos. */
export function juntarDataHora(dia: string, horaMinuto: string): string {
    const hora = horaMinuto.length === 0 ? '00:00' : horaMinuto;

    return `${dia}T${hora}:00`;
}

/** `2026-09-14T09:00:00` → `09:00`, que é o que o campo de hora escreve. */
export function horaDe(iso: string): string {
    return iso.length >= 16 ? iso.slice(11, 16) : '00:00';
}

/**
 * Meia-noite local de `YYYY-MM-DD`. `new Date('2026-09-14')` é lido como UTC e
 * em Angola perde o dia, que é a pior falha possível numa agenda.
 */
export function diaDeChave(chave: string): Date {
    const [ano, mes, dia] = chave.split('-').map(Number);

    return new Date(ano, mes - 1, dia);
}
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { focarPrimeiroInvalido } from '@/Components/ui/modal-forma';
import { toast } from '@/Components/ui/toaster';

/**
 * A ficha aberta em memória.
 *
 * Não há servidor por trás (D1), por isso o `useForm` do Inertia não serve aqui:
 * o registo é escrito directamente no contexto. O que a spec exige continua a
 * valer — validar no cliente antes de escrever, mostrar o erro no campo e não
 * num aviso, avisar do resultado, e nunca perder escrita por fechar a janela.
 *
 * Quem abre a ficha é quem a fecha: o gancho não tem estado de abertura, para
 * não haver duas verdades sobre a mesma janela. `preparar` carrega os valores e
 * `aoFechar` fecha depois de guardar.
 *
 * `sujo` compara com os valores de entrada, não com os vazios: uma edição que
 * acaba igual ao que estava não é escrita por guardar, e uma ficha em que o
 * utilizador escreveu e voltou atrás também não pergunta nada.
 */
export type Erros = Record<string, string>;

export interface Ficha<T> {
    dados: T;
    erros: Erros;
    pendente: boolean;
    sujo: boolean;
    /** Carrega a ficha com um registo, ou com os vazios quando não recebe nada. */
    preparar: (dados?: T) => void;
    definir: <C extends keyof T>(campo: C, valor: T[C]) => void;
    guardar: () => void;
}

/** A latência mínima da escrita, para o estado «a guardar» existir no ecrã. */
const LATENCIA = 350;

export function useFicha<T extends Record<string, unknown>>({
    vazio,
    validar,
    aoGuardar,
    aoFechar,
    mensagem,
}: {
    vazio: T;
    validar: (dados: T) => Erros;
    aoGuardar: (dados: T) => void;
    /** Fecha a janela depois de gravar. */
    aoFechar: () => void;
    /** O que o aviso escreve quando a ficha fecha. */
    mensagem: (dados: T) => string;
}): Ficha<T> {
    const [dados, definirDados] = useState<T>(vazio);
    const [entrada, definirEntrada] = useState<T>(vazio);
    const [erros, definirErros] = useState<Erros>({});
    const [pendente, definirPendente] = useState(false);

    /**
     * A escrita a caminho é cancelada se a ficha deixar de existir antes do fim:
     * quem navega para outra folha durante os 350ms não deve ver um aviso de
     * «guardado» de uma ficha que já não está no ecrã.
     */
    const vivo = useRef(true);

    useEffect(() => {
        vivo.current = true;

        return () => {
            vivo.current = false;
        };
    }, []);

    const preparar = useCallback(
        (novos?: T) => {
            definirDados(novos ?? vazio);
            definirEntrada(novos ?? vazio);
            definirErros({});
            definirPendente(false);
        },
        [vazio],
    );

    const definir = useCallback(<C extends keyof T>(campo: C, valor: T[C]) => {
        definirDados((actuais) => ({ ...actuais, [campo]: valor }));
        // O erro sai quando o campo muda: a ficha não volta a acusar o que já
        // foi corrigido, e o lápis vermelho fica livre assim que há escrita.
        definirErros((actuais) => {
            if (!(campo in actuais)) {
                return actuais;
            }

            const copia = { ...actuais };

            delete copia[String(campo)];

            return copia;
        });
    }, []);

    const sujo = useMemo(() => !igual(dados, entrada), [dados, entrada]);

    const guardar = useCallback(() => {
        if (pendente) {
            return;
        }

        const encontrados = validar(dados);

        if (Object.keys(encontrados).length > 0) {
            definirErros(encontrados);
            focarPrimeiroInvalido();

            return;
        }

        definirPendente(true);

        window.setTimeout(() => {
            aoGuardar(dados);

            if (!vivo.current) {
                return;
            }

            toast.success(mensagem(dados));
            definirPendente(false);
            aoFechar();
        }, LATENCIA);
    }, [aoFechar, aoGuardar, dados, mensagem, pendente, validar]);

    return { dados, erros, pendente, sujo, preparar, definir, guardar };
}

/** Igualdade por valor, campo a campo, para saber se há escrita por guardar. */
export function igual<T extends Record<string, unknown>>(a: T, b: T): boolean {
    return (Object.keys(a) as Array<keyof T>).every((campo) => a[campo] === b[campo]);
}

/**
 * As regras que os quatro cadastros partilham. Devolve os erros por campo, e o
 * modal escreve-os no campo correspondente — nunca num aviso solto.
 */
export const REGRAS = {
    obrigatorio: (valor: unknown, rotulo: string): string | null =>
        typeof valor === 'string' && valor.trim().length === 0 ? `${rotulo} é obrigatório.` : null,

    /** Exige um mínimo de caracteres, para não haver «El.» a sério. */
    minimo: (valor: string, tamanho: number, rotulo: string): string | null => {
        const limpo = valor.trim();

        return limpo.length > 0 && limpo.length < tamanho
            ? `${rotulo} precisa de pelo menos ${tamanho} caracteres.`
            : null;
    },

    /** Um campo que obriga a escolher uma opção em vez de ficar vazio. */
    seleccionado: (valor: string | null, rotulo: string): string | null =>
        valor === null || valor.trim().length === 0
            ? `Escolha ${rotulo}: este campo não fica por preencher.`
            : null,

    email: (valor: string): string | null =>
        valor.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim())
            ? 'E-mail inválido.'
            : null,

    telefone: (valor: string): string | null =>
        valor.trim().length > 0 && !/^[+\d][\d\s()-]{6,}$/.test(valor.trim())
            ? 'Telefone inválido.'
            : null,

    /** Monta o mapa de erros a partir de pares `[campo, mensagem]`. */
    juntar: (...pares: Array<[string, string | null]>): Erros =>
        pares.reduce<Erros>((erros, [campo, mensagem]) => {
            if (mensagem) {
                erros[campo] = mensagem;
            }

            return erros;
        }, {}),

    /** Um montante escrito em kwanzas: dígitos, separadores e vírgula decimal. */
    montante: (valor: string, rotulo: string): string | null => {
        const limpo = valor.replace(/[\s.]/g, '').replace(',', '.');

        if (limpo.length === 0) {
            return null;
        }

        return /^\d+(\.\d{1,2})?$/.test(limpo) ? null : `${rotulo} inválido.`;
    },

    /** Converte o que se escreve no campo em número, ou `null` se não é número. */
    paraNumero: (valor: string): number | null => {
        const limpo = valor.replace(/[\s.]/g, '').replace(',', '.');

        return limpo.length > 0 && !Number.isNaN(Number(limpo)) ? Number(limpo) : null;
    },

    /** Verifica que o fim não é anterior ao início. */
    datas: (inicio: string, fim: string): string | null => {
        if (!inicio || !fim) {
            return null;
        }

        return fim < inicio ? 'O fim não pode ser anterior ao início.' : null;
    },
};

/** Um identificador de registo novo, no mesmo formato do seed. */
export function novoId(prefixo: string): string {
    return `${prefixo}${Date.now().toString(36)}`;
}
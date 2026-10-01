import { useCallback, useEffect } from 'react';

import { Campo } from '@/Components/ui/field';
import { Input } from '@/Components/ui/input';
import { ModalForma } from '@/Components/ui/modal-forma';
import { Textarea } from '@/Components/ui/textarea';
import { Combo } from '@/Components/ui/combobox';
import { useSgo } from '@/Data/SgoContext';
import type { Area, Utilizador } from '@/Data/types';

import { REGRAS, novoId, useFicha } from './formulario-local';

/**
 * A ficha da área.
 *
 * Uma área em Angola tem nome curto e longo — «Eletricidade» e
 * «Instalações Elétricas» — e o registo guarda os dois porque o caderno de obra
 * usa um e o relatório usa o outro. O responsável é uma pessoa, não um cargo:
 * quem responde pela área vê-se, e um responsável inactivo não pode ficar
 * escolhido porque ninguém responderia por ela.
 *
 * A sigla de duas ou três letras não entra. O nome curto já faz esse trabalho, e
 * duas siglasiguais numa folha de seis colunas lêem-se como duas áreas que são a
 * mesma.
 */
type DadosArea = {
    id: string;
    nome: string;
    descricao: string;
    responsavelId: string | null;
};

const VAZIO: DadosArea = {
    id: '',
    nome: '',
    descricao: '',
    responsavelId: null,
};

function de(area: Area): DadosArea {
    return {
        id: area.id,
        nome: area.nome,
        descricao: area.descricao,
        responsavelId: area.responsavelId,
    };
}

export function ModalArea({
    aberto,
    area,
    aoFechar,
}: {
    aberto: boolean;
    /** `null` é abrir uma ficha nova. */
    area: Area | null;
    aoFechar: () => void;
}) {
    const { estado, criar, actualizar } = useSgo();

    const guardar = useCallback(
        (dados: DadosArea) => {
            const registo: Area = {
                id: dados.id || novoId('ar'),
                nome: dados.nome.trim(),
                descricao: dados.descricao.trim(),
                responsavelId: dados.responsavelId,
            };

            if (dados.id) {
                actualizar('areas', dados.id, registo);
            } else {
                criar('areas', registo);
            }
        },
        [actualizar, criar],
    );

    const ficha = useFicha<DadosArea>({
        vazio: VAZIO,
        // O responsável é opcional por contrato (§246): uma área nasce sem dono
        // e ganha um quando houver quem responda por ela. Tê-lo obrigatório
        // inventava um responsável para dar de si.
        validar: (dados) =>
            REGRAS.juntar(
                ['nome', REGRAS.obrigatorio(dados.nome, 'O nome da área')],
                ['nome', REGRAS.minimo(dados.nome, 2, 'O nome da área')],
                ['nome', duplicado(dados.nome, dados.id)],
            ),
        aoGuardar: guardar,
        aoFechar,
        mensagem: (dados) =>
            dados.id ? `Área actualizada: ${dados.nome}.` : `Área registada: ${dados.nome}.`,
    });

    useEffect(() => {
        if (aberto) {
            ficha.preparar(area ? de(area) : undefined);
        }
    }, [aberto, area]);

    const { dados, erros, definir, guardar: submeter, pendente, sujo } = ficha;
    const emEdicao = dados.id !== '';

    /**
     * Só quem está activo pode ficar responsável: um responsável inactivo é
     * alguém a quem a obra continua a mandar perguntas sem resposta. Inactivos
     * continuam na lista — com uma nota — para se ver quem está lá dentro.
     */
    const responsaveis: Array<{ valor: string; rotulo: string }> = estado.utilizadores.map(
        (utilizador: Utilizador) => ({
            valor: utilizador.id,
            rotulo: `${utilizador.nome}${utilizador.activo ? '' : ' (inactivo)'}`,
        }),
    );

    function duplicado(nome: string, id: string): string | null {
        const alvo = normaliza(nome);

        if (alvo.length === 0) {
            return null;
        }

        return estado.areas.some((outra) => outra.id !== id && normaliza(outra.nome) === alvo)
            ? 'Já existe uma área com este nome.'
            : null;
    }

    return (
        <ModalForma
            aberto={aberto}
            aoFechar={aoFechar}
            titulo={emEdicao ? 'Corrigir área' : 'Nova área'}
            descricao={
                emEdicao
                    ? 'O nome curto é o que a folha escreve; a descrição é o que o relatório explica.'
                    : 'A área passa a existir nas listas de escolha e a poder receber projectos.'
            }
            notaCabecalho={`Área · ${emEdicao ? 'correcção' : 'abertura'}`}
            sujo={sujo}
            pendente={pendente}
            accao={emEdicao ? 'Guardar correcção' : 'Registar área'}
rodapeNota="Uma área pode nascer sem responsável. Fica escrita como «sem responsável» na folha até haver quem responda por ela."
            aoGuardar={submeter}
        >
            <Campo rotulo="Nome" htmlFor="area-nome" obrigatorio erro={erros.nome}>
                <Input
                    id="area-nome"
                    value={dados.nome}
                    onChange={(evento) => definir('nome', evento.target.value)}
                    aria-invalid={Boolean(erros.nome)}
                    placeholder="Instalações Elétricas"
                    autoFocus
                />
            </Campo>

            <Campo
                rotulo="Descrição"
                htmlFor="area-descricao"
                ajuda="Uma linha. Aparece na ficha do projecto e no relatório mensal."
            >
                <Textarea
                    id="area-descricao"
                    value={dados.descricao}
                    onChange={(evento) => definir('descricao', evento.target.value)}
                    rows={3}
                    placeholder="Projectos de electricidade predial e de infra-estruturas."
                />
            </Campo>

            <Campo
                rotulo="Responsável"
                htmlFor="area-responsavel"
                ajuda="Opcional. Quem responde por esta frente."
                erro={erros.responsavelId}
            >
                <Combo
                    id="area-responsavel"
                    valor={dados.responsavelId}
                    opcoes={responsaveis}
                    aoEscolher={(valor) => definir('responsavelId', valor)}
                    aoLimpar={() => definir('responsavelId', null)}
                    placeholder="Escolher responsável…"
                    vazio="Ninguém registado ainda."
                    className="w-full"
                />
            </Campo>
        </ModalForma>
    );
}

function normaliza(texto: string): string {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}
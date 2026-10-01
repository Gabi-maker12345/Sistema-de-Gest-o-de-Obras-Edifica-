import { useCallback, useEffect } from 'react';

import { Campo } from '@/Components/ui/field';
import { ModalForma } from '@/Components/ui/modal-forma';
import { Combo } from '@/Components/ui/combobox';
import {
    Seletor,
    SeletorConteudo,
    SeletorDisparador,
    SeletorItem,
    SeletorValor,
} from '@/Components/ui/select';
import { useSgo } from '@/Data/SgoContext';
import type { AcessoProjecto, PapelProjecto } from '@/Data/types';
import { ROTULOS } from '@/lib/rotulos';

import { REGRAS, novoId, useFicha } from './formulario-local';

/**
 * «Adicionar acesso» (spec §305) — a janela `sm` que dá entrada a alguém na
 * obra.
 *
 * É um modal de relação, não um campo: os acessos não vivem no modal do
 * projecto (checklist §316) porque o projecto não tem membros, tem quem pode
 * entrar nele. Por isso vive aqui, aberto a partir da aba Acessos, e por isso
 * o combobox de pessoa **exclui quem já tem acesso** — um acesso repetido não
 * dá mais poder nenhum, só dá duas linhas iguais na folha.
 *
 * O papel é um `select` de valores fechados (gestor, colaborador, fiscal,
 * consulta) e vale só nesta obra: não é o perfil global do utilizador.
 */
type DadosAcesso = {
    utilizadorId: string | null;
    papel: PapelProjecto;
};

const VAZIO: DadosAcesso = {
    utilizadorId: null,
    papel: 'consulta',
};

export function ModalAcesso({
    aberto,
    projectoId,
    acessos,
    aoFechar,
}: {
    aberto: boolean;
    projectoId: string;
    /** Quem já tem acesso a este projecto: quem não pode entrar outra vez. */
    acessos: AcessoProjecto[];
    aoFechar: () => void;
}) {
    const { estado, criar } = useSgo();

    const gravar = useCallback(
        (dados: DadosAcesso) => {
            criar('acessos', {
                id: novoId('ac'),
                projectoId,
                utilizadorId: dados.utilizadorId ?? '',
                papel: dados.papel,
            });
        },
        [criar, projectoId],
    );

    const nomeDe = useCallback(
        (utilizadorId: string) =>
            estado.utilizadores.find((utilizador) => utilizador.id === utilizadorId)?.nome ??
            utilizadorId,
        [estado.utilizadores],
    );

    const ficha = useFicha<DadosAcesso>({
        vazio: VAZIO,
        validar: (dados) =>
            REGRAS.juntar(
                [
                    'utilizadorId',
                    REGRAS.seleccionado(dados.utilizadorId, 'a pessoa a quem dar acesso'),
                ],
                [
                    'utilizadorId',
                    dados.utilizadorId &&
                        acessos.some((acesso) => acesso.utilizadorId === dados.utilizadorId)
                        ? 'Esta pessoa já tem acesso a este projecto.'
                        : null,
                ],
            ),
        aoGuardar: gravar,
        aoFechar,
        mensagem: (dados) =>
            `Acesso concedido a ${nomeDe(dados.utilizadorId ?? '')}: ${ROTULOS.papelProjecto[dados.papel]}.`,
    });

    useEffect(() => {
        if (aberto) {
            ficha.preparar();
        }
    }, [aberto]);

    const { dados, erros, definir, guardar: submeter, pendente, sujo } = ficha;

    const comAcesso = new Set(acessos.map((acesso) => acesso.utilizadorId));
    const disponiveis = estado.utilizadores.filter(
        (utilizador) => utilizador.activo && !comAcesso.has(utilizador.id),
    );

    return (
        <ModalForma
            aberto={aberto}
            aoFechar={aoFechar}
            titulo="Adicionar acesso"
            descricao="Quem entra nesta obra e com que papel."
            notaCabecalho="Projecto · acesso"
            largura="sm"
            sujo={sujo}
            pendente={pendente}
            accao="Dar acesso"
            rodapeNota={
                disponiveis.length === 0
                    ? 'Não há mais pessoas activas para entrar nesta obra.'
                    : undefined
            }
            aoGuardar={submeter}
        >
            <Campo
                rotulo="Utilizador"
                htmlFor="acesso-utilizador"
                obrigatorio
                ajuda="Exclui quem já tem acesso a este projecto."
                erro={erros.utilizadorId}
            >
                <Combo
                    id="acesso-utilizador"
                    valor={dados.utilizadorId}
                    opcoes={disponiveis.map((utilizador) => ({
                        valor: utilizador.id,
                        rotulo: utilizador.nome,
                    }))}
                    aoEscolher={(valor) => definir('utilizadorId', valor)}
                    aoLimpar={() => definir('utilizadorId', null)}
                    placeholder="Escolher pessoa…"
                    vazio="Toda a gente activa já tem acesso a esta obra."
                    className="w-full"
                />
            </Campo>

            <Campo
                rotulo="Papel no projecto"
                htmlFor="acesso-papel"
                obrigatorio
                ajuda="Vale só nesta obra — o perfil global continua a valer em todo o produto."
                erro={erros.papel}
            >
                <Seletor
                    value={dados.papel}
                    onValueChange={(valor) => definir('papel', valor as PapelProjecto)}
                >
                    <SeletorDisparador id="acesso-papel">
                        <SeletorValor />
                    </SeletorDisparador>
                    <SeletorConteudo>
                        {Object.entries(ROTULOS.papelProjecto).map(([valor, rotulo]) => (
                            <SeletorItem key={valor} value={valor}>
                                {rotulo}
                            </SeletorItem>
                        ))}
                    </SeletorConteudo>
                </Seletor>
            </Campo>
        </ModalForma>
    );
}
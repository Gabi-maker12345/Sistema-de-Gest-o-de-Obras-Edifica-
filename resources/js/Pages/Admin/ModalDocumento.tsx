import { useCallback, useEffect, useMemo } from 'react';

import { Campo } from '@/Components/ui/field';
import { Input } from '@/Components/ui/input';
import { ModalForma } from '@/Components/ui/modal-forma';
import { Combo } from '@/Components/ui/combobox';
import {
    Seletor,
    SeletorConteudo,
    SeletorDisparador,
    SeletorGrupo,
    SeletorGrupoRotulo,
    SeletorItem,
    SeletorValor,
} from '@/Components/ui/select';
import { useSgo } from '@/Data/SgoContext';
import type { DocumentoSgo, EntidadeDocumento, TipoDocumento } from '@/Data/types';
import { ROTULOS } from '@/lib/rotulos';

import { REGRAS, novoId, useFicha } from './formulario-local';

/**
 * A ficha do documento.
 *
 * O documento é o único anexo do produto e a spec trata-o de forma diferente de
 * tudo o resto: nasce sempre na versão 1, e «próximas versões sobem o número
 * automaticamente ao re-anexar no mesmo registo». Ou seja, carregar um ficheiro
 * com o mesmo nome não cria um documento novo — sobe a versão do que já lá está,
 * e o histórico da folha continua a mostrar que houve re-anexação.
 *
 * A ordem de escolher é a dos campos: primeiro *a que se liga*, depois
 * *o que se liga*. Invertida, a lista de entidades não se sabe de que tabela
 * tirar e o utilizador escolheria uma tarefa na lista de fornecedores.
 */
type DadosDocumento = {
    id: string;
    associarA: EntidadeDocumento;
    entidadeRelacionadaId: string | null;
    tipoDocumento: TipoDocumento;
    nomeFicheiro: string;
    tamanho: string;
};

const VAZIO: DadosDocumento = {
    id: '',
    associarA: 'projecto',
    entidadeRelacionadaId: null,
    tipoDocumento: 'contrato',
    nomeFicheiro: '',
    tamanho: '',
};

function de(documento: DocumentoSgo): DadosDocumento {
    return {
        id: documento.id,
        // Um documento sem associação explícita é, por omissão, da obra.
        associarA: documento.associarA ?? 'projecto',
        entidadeRelacionadaId:
            documento.entidadeRelacionadaId ?? documento.projectoId ?? null,
        tipoDocumento: documento.tipoDocumento,
        nomeFicheiro: documento.nomeFicheiro,
        tamanho: documento.tamanho,
    };
}

export function ModalDocumento({
    aberto,
    documento,
    aoFechar,
}: {
    aberto: boolean;
    /** `null` é abrir uma ficha nova. */
    documento: DocumentoSgo | null;
    aoFechar: () => void;
}) {
    const { estado, criar, actualizar, utilizadorEfectivo } = useSgo();

    /** As quatro listas, cada uma com o rótulo que o registo traz. */
    const listas: Record<EntidadeDocumento, { rotulo: string; opcoes: { valor: string; rotulo: string }[] }> =
        useMemo(
            () => ({
                projecto: {
                    rotulo: 'Projecto',
                    opcoes: estado.projectos.map((p) => ({ valor: p.id, rotulo: p.nome })),
                },
                tarefa: {
                    rotulo: 'Tarefa',
                    opcoes: estado.tarefas.map((t) => ({ valor: t.id, rotulo: t.titulo })),
                },
                despesa: {
                    rotulo: 'Despesa',
                    opcoes: estado.despesas.map((d) => ({ valor: d.id, rotulo: d.descricao })),
                },
                fornecedor: {
                    rotulo: 'Fornecedor',
                    opcoes: estado.fornecedores.map((f) => ({ valor: f.id, rotulo: f.nome })),
                },
            }),
            [estado.projectos, estado.tarefas, estado.despesas, estado.fornecedores],
        );

    const guardar = useCallback(
        (dados: DadosDocumento) => {
            const ficheiro = dados.nomeFicheiro.trim();
            const entidadeId = dados.entidadeRelacionadaId ?? '';

            /**
             * Re-anexar é o caminho das versões: o mesmo nome de ficheiro no
             * mesmo sítio sobe a versão em vez de criar um segundo documento.
             * A folha passa a mostrar duas versões do mesmo anexo com a mesma
             * data, que é a verdade do que aconteceu.
             */
            const anterior = dados.id
                ? null
                : estado.documentos.find(
                      (outro) =>
                          outro.nomeFicheiro === ficheiro &&
                          (outro.associarA ?? 'projecto') === dados.associarA &&
                          (outro.entidadeRelacionadaId ?? outro.projectoId) === entidadeId,
                  );

            const registo: DocumentoSgo = {
                id: dados.id || anterior?.id || novoId('doc'),
                // A obra que a folha lista: se o anexo está preso a uma tarefa,
                // a obra vem do caminho da tarefa, senão é o próprio alvo.
                projectoId:
                    dados.associarA === 'projecto'
                        ? entidadeId
                        : obraDoAnexo(estado.tarefas, estado.despesas, dados),
                tipoDocumento: dados.tipoDocumento,
                nomeFicheiro: ficheiro,
                versao: anterior ? anterior.versao + 1 : documento?.versao ?? 1,
                tamanho: dados.tamanho.trim() || documento?.tamanho || '—',
                uploadPor: utilizadorEfectivo.id,
                criadoEm: new Date().toISOString().slice(0, 10),
                associarA: dados.associarA,
                entidadeRelacionadaId: entidadeId,
            };

            if (dados.id) {
                actualizar('documentos', dados.id, registo);
            } else if (anterior) {
                actualizar('documentos', anterior.id, registo);
            } else {
                criar('documentos', registo);
            }
        },
        [actualizar, criar, documento, estado, utilizadorEfectivo.id],
    );

    const ficha = useFicha<DadosDocumento>({
        vazio: VAZIO,
        validar: (dados) =>
            REGRAS.juntar(
                [
                    'entidadeRelacionadaId',
                    REGRAS.seleccionado(
                        dados.entidadeRelacionadaId,
                        `a ${listas[dados.associarA].rotulo.toLowerCase()}`,
                    ),
                ],
                ['nomeFicheiro', REGRAS.obrigatorio(dados.nomeFicheiro.trim(), 'o ficheiro')],
            ),
        aoGuardar: guardar,
        aoFechar,
        mensagem: (dados) =>
            dados.id
                ? 'Documento actualizado com sucesso'
                : 'Documento anexado com sucesso',
    });

    useEffect(() => {
        if (aberto) {
            ficha.preparar(documento ? de(documento) : VAZIO);
        }
    }, [aberto, documento]);

    const { definir, dados, erros, sujo, pendente, guardar: submeter } = ficha;
    const lista = listas[dados.associarA];

    return (
        <ModalForma
            aberto={aberto}
            aoFechar={aoFechar}
            titulo={ficha.dados.id ? 'Editar documento' : 'Anexar documento'}
            largura="md"
            sujo={sujo}
            pendente={pendente}
            accao={ficha.dados.id ? 'Guardar alterações' : 'Anexar documento'}
            erro={erros.entidadeRelacionadaId}
            rodapeNota={`Versão ${documento?.versao ?? 1}. Re-anexar o mesmo ficheiro no mesmo sítio sobe o número em vez de criar outro documento.`}
            aoGuardar={submeter}
        >
            <Campo rotulo="Associar a" htmlFor="documento-associar" obrigatorio>
                <Seletor
                    value={dados.associarA}
                    onValueChange={(valor) => {
                        definir('associarA', valor as EntidadeDocumento);
                        // A entidade escolhida era de outra lista: o id não
                        // significa nada na lista nova.
                        definir('entidadeRelacionadaId', null);
                    }}
                >
                    <SeletorDisparador id="documento-associar" aria-label="Associar documento a">
                        <SeletorValor />
                    </SeletorDisparador>
                    <SeletorConteudo>
                        <SeletorGrupo>
                            <SeletorGrupoRotulo>Anexar a</SeletorGrupoRotulo>
                            {(Object.entries(ROTULOS.entidadeDocumento) as Array<
                                [EntidadeDocumento, string]
                            >).map(([chave, rotulo]) => (
                                <SeletorItem key={chave} value={chave}>
                                    {rotulo}
                                </SeletorItem>
                            ))}
                        </SeletorGrupo>
                    </SeletorConteudo>
                </Seletor>
            </Campo>

            <Campo
                rotulo={lista.rotulo}
                htmlFor="documento-entidade"
                erro={erros.entidadeRelacionadaId}
                obrigatorio
            >
                <Combo
                    id="documento-entidade"
                    valor={dados.entidadeRelacionadaId}
                    opcoes={lista.opcoes}
                    aoEscolher={(id) => definir('entidadeRelacionadaId', id)}
                    aoLimpar={() => definir('entidadeRelacionadaId', null)}
                    placeholder={`Escolher ${lista.rotulo.toLowerCase()}…`}
                    vazio={`Não há ${lista.rotulo.toLowerCase()}s visíveis.`}
                />
            </Campo>

            <Campo rotulo="Tipo de documento" htmlFor="documento-tipo" obrigatorio>
                <Seletor
                    value={dados.tipoDocumento}
                    onValueChange={(valor) => definir('tipoDocumento', valor as TipoDocumento)}
                >
                    <SeletorDisparador id="documento-tipo" aria-label="Tipo de documento">
                        <SeletorValor />
                    </SeletorDisparador>
                    <SeletorConteudo>
                        <SeletorGrupo>
                            <SeletorGrupoRotulo>Tipo</SeletorGrupoRotulo>
                            {(Object.entries(ROTULOS.tipoDocumento) as Array<
                                [TipoDocumento, string]
                            >).map(([chave, rotulo]) => (
                                <SeletorItem key={chave} value={chave}>
                                    {rotulo}
                                </SeletorItem>
                            ))}
                        </SeletorGrupo>
                    </SeletorConteudo>
                </Seletor>
            </Campo>

            <Campo rotulo="Ficheiro" htmlFor="documento-ficheiro" erro={erros.nomeFicheiro} obrigatorio>
                <Input
                    id="documento-ficheiro"
                    value={dados.nomeFicheiro}
                    onChange={(evento) => definir('nomeFicheiro', evento.target.value)}
                    aria-invalid={Boolean(erros.nomeFicheiro)}
                    placeholder="contrato-obra-sede.pdf"
                />
            </Campo>

            <Campo
                rotulo="Tamanho"
                htmlFor="documento-tamanho"
                ajuda="Vem do ficheiro. Deixado vazio, a folha escreve «—» em vez de um número inventado."
                erro={erros.tamanho}
            >
                <Input
                    id="documento-tamanho"
                    value={dados.tamanho}
                    onChange={(evento) => definir('tamanho', evento.target.value)}
                    placeholder="2,4 MB"
                />
            </Campo>
        </ModalForma>
    );
}

/**
 * A obra que a folha vai listar quando o anexo não está preso a uma obra
 * directamente. Uma tarefa conhece a sua obra e uma despesa também, logo há
 * sempre um caminho para a folha não ficar sem obra.
 */
function obraDoAnexo(
    tarefas: { id: string; projectoId: string }[],
    despesas: { id: string; projectoId: string | null }[],
    dados: DadosDocumento,
): string | null {
    const id = dados.entidadeRelacionadaId;
    if (id === null) {
        return null;
    }

    if (dados.associarA === 'tarefa') {
        return tarefas.find((tarefa) => tarefa.id === id)?.projectoId ?? null;
    }

    if (dados.associarA === 'despesa') {
        return despesas.find((despesa) => despesa.id === id)?.projectoId ?? null;
    }

    // Um fornecedor não pertence a uma obra: o documento fica sem obra e a
    // folha de documentos da obra não o mostra. Nem todo o papel pintado
    // pertence a um projecto.
    return null;
}
import { Pencil } from 'lucide-react';

import { CarimboFicha, DadoFicha, FichaRegisto, VincoFicha } from '@/Components/brand/ficha-registo';
import { MargemRevisao, useRevisoes } from '@/Components/brand/margem-revisao';
import { Botao } from '@/Components/ui/button';
import { useSgo } from '@/Data/SgoContext';
import type { DocumentoSgo, EstadoSgo } from '@/Data/types';
import { dataHora } from '@/lib/format';
import { ROTULOS } from '@/lib/rotulos';
import { utilizadorDe } from '@/lib/historico';

/**
 * A ficha de um documento.
 *
 * Um anexo é o registo que muda sem mudar de nome: a mesma planta entra três
 * vezes e o que distingue as versões é a versão e quem a subiu. Por isso a
 * revisão de um documento é quase sempre a criação da versão seguinte, e a
 * margem é o sítio onde se lê isso — a ficha em si mostra o estado actual e a
 * margem diz como se chegou aqui.
 *
 * A criação vem do próprio documento (`uploadPor` e `criadoEm`), não do
 * histórico: um documento anexado antes de haver histórico escrito tem de mostrar
 * a mesma linha de criação, senão a ficha mentia sobre o momento em que o
 * anexo entrou.
 */
export function FichaDocumento({
    documento,
    aoCorrigir,
    aoFechar,
    className,
}: {
    documento: DocumentoSgo;
    aoCorrigir: (documento: DocumentoSgo) => void;
    aoFechar: () => void;
    className?: string;
}) {
    const { estado } = useSgo();

    const revisoes = useRevisoes(
        'Documento',
        documento.id,
        documento.uploadPor,
        documento.criadoEm,
    );
    const actual = revisoes[0];

    const related = relatedDe(estado, documento);

    return (
        <FichaRegisto
            cota={`Documento · ${documento.projectoId ? (estado.projectos.find((p) => p.id === documento.projectoId)?.nome ?? '—') : 'Sem obra'}`}
            titulo={documento.nomeFicheiro}
            aoFechar={aoFechar}
            accoes={
                <Botao variante="contorno" tamanho="sm" onClick={() => aoCorrigir(documento)}>
                    <Pencil aria-hidden />
                    Corrigir documento
                </Botao>
            }
            className={className}
        >
            <CarimboFicha
                entidade="Documento"
                revisao={actual?.revisao ?? '—'}
                linhas={[
                    { chave: 'Versão', valor: `v${documento.versao}` },
                    { chave: 'Peso', valor: documento.tamanho },
                ]}
                rodape={actual ? `${actual.revisao} · ${utilizadorDe(estado, actual.utilizadorId)}` : undefined}
            />

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <DadoFicha rotulo="Tipo">{ROTULOS.tipoDocumento[documento.tipoDocumento]}</DadoFicha>
                <DadoFicha rotulo="Versão">v{documento.versao}</DadoFicha>

                <DadoFicha rotulo="Anexado por">{utilizadorDe(estado, documento.uploadPor)}</DadoFicha>
                <DadoFicha rotulo="Anexado em">{dataHora(documento.criadoEm)}</DadoFicha>

                <DadoFicha rotulo="Preso a">
                    {ROTULOS.entidadeDocumento[documento.associarA ?? 'projecto']}
                </DadoFicha>
                <DadoFicha rotulo="Referência">{related ?? '—'}</DadoFicha>
            </dl>

            <VincoFicha />

            <MargemRevisao
                entidade="Documento"
                registoId={documento.id}
                criadoPor={documento.uploadPor}
                criadoEm={documento.criadoEm}
            />
        </FichaRegisto>
    );
}

/**
 * A que registo o anexo está preso, pelo nome.
 *
 * Um anexo pode estar preso a uma tarefa, a uma despesa ou a um fornecedor em
 * vez de à obra. Na lista isso é uma coluna com o nome; na ficha é uma linha, e
 * o nome é o que a torna legível.
 */
function relatedDe(estado: EstadoSgo, documento: DocumentoSgo): string | null {
    if (!documento.entidadeRelacionadaId) {
        return null;
    }

    const id = documento.entidadeRelacionadaId;

    return (
        estado.tarefas.find((tarefa) => tarefa.id === id)?.titulo ??
        estado.despesas.find((despesa) => despesa.id === id)?.descricao ??
        estado.fornecedores.find((fornecedor) => fornecedor.id === id)?.nome ??
        null
    );
}
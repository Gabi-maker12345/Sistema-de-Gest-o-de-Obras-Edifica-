import { useCallback, useMemo } from 'react';

import type { Medicao } from '@/Components/brand/quadro-medicoes';
import { useSgo } from '@/Data/SgoContext';
import { LayoutAdmin } from '@/Layouts/LayoutAdmin';
import { data, numero } from '@/lib/format';
import { rotuloPerfil } from '@/lib/rotulos';

import { FolhaDocumentos } from './execucao/folha-documentos';
import { PaginaModulo } from './execucao/pagina-modulo';

/**
 * `/admin/documentos` — a pasta de documentos, módulo do índice.
 *
 * Ao contrário dos outros módulos de registo, o documento não tem selo de
 * sincronização: quem o anexa está no escritório e o ficheiro sobe na hora. Por
 * isso nenhuma medida desta folha fala em pendentes — um zero de sincronização
 * aqui seria um estado que não existe.
 *
 * Re-anexar um ficheiro no mesmo registo sobe a versão; as substituições são por
 * isso uma medida à parte, e é a que diz se a pasta está viva ou arquivada.
 */
export default function Documentos() {
    const { estado, projectosVisiveis, perfilEfectivo, utilizadorEfectivo } = useSgo();

    const contar = useCallback(
        (projectoId: string) =>
            estado.documentos.filter((d) => d.projectoId === projectoId).length,
        [estado.documentos],
    );

    // As quatro medidas da capa: quantos documentos, quantas substituições, o
    // último a entrar e que tipos de papel ali vivem.
    const leituras = useCallback(
        (projectoId: string): Medicao[] => {
            const documentos = estado.documentos.filter((d) => d.projectoId === projectoId);
            const ultimo = documentos
                .toSorted((a, b) => a.criadoEm.localeCompare(b.criadoEm))
                .at(-1);
            const versoes = documentos.reduce(
                (soma, d) => soma + Math.max(0, d.versao - 1),
                0,
            );
            const tipos = new Set(documentos.map((d) => d.tipoDocumento));

            return [
                {
                    rotulo: 'Documentos',
                    valor: numero(documentos.length),
                    nota: 'nesta obra',
                },
                {
                    rotulo: 'Substituições',
                    valor: numero(versoes),
                    nota: 'versões acima da primeira',
                },
                {
                    rotulo: 'Último anexo',
                    valor: ultimo === undefined ? '—' : data(ultimo.criadoEm),
                    nota: ultimo === undefined ? 'pasta vazia' : 'o mais recente',
                },
                {
                    rotulo: 'Tipos',
                    valor: numero(tipos.size),
                    nota: 'espécies de documento',
                },
            ];
        },
        [estado.documentos],
    );

    const modulo = useMemo(() => {
        const visiveis = new Set(projectosVisiveis.map((p) => p.id));
        const documentos = estado.documentos.filter((d) => d.projectoId !== null && visiveis.has(d.projectoId));
        const versoes = documentos.reduce((soma, d) => soma + Math.max(0, d.versao - 1), 0);
        const ultimo = documentos.toSorted((a, b) => a.criadoEm.localeCompare(b.criadoEm)).at(-1);
        const tipos = new Set(documentos.map((d) => d.tipoDocumento));

        return {
            medicoes: [
                {
                    rotulo: 'Obras visíveis',
                    valor: numero(projectosVisiveis.length),
                    nota: 'com acesso atribuído',
                },
                {
                    rotulo: 'Documentos',
                    valor: numero(documentos.length),
                    nota: 'ligados a uma obra',
                },
                {
                    rotulo: 'Substituições',
                    valor: numero(versoes),
                    nota: 'versões acima da primeira',
                },
                {
                    rotulo: 'Tipos',
                    valor: numero(tipos.size),
                    nota: 'espécies no índice',
                },
                {
                    rotulo: 'Último anexo',
                    valor: ultimo === undefined ? '—' : data(ultimo.criadoEm),
                    nota: 'em qualquer obra visível',
                },
                {
                    rotulo: 'Facturas',
                    valor: numero(
                        documentos.filter((d) => d.tipoDocumento === 'factura').length,
                    ),
                    nota: 'o que se paga contra o aprovado',
                },
            ],
            linha: `${numero(documentos.length)} documentos em ${numero(projectosVisiveis.length)} obras visíveis para ${utilizadorEfectivo.nome} · ${rotuloPerfil(perfilEfectivo)}.`,
        };
    }, [estado.documentos, projectosVisiveis, utilizadorEfectivo.nome, perfilEfectivo]);

    return (
        <LayoutAdmin>
            <PaginaModulo
                modulo="Registo de campo"
                titulo="Documentos"
                folha="04 / 08"
                linha={modulo.linha}
                anotacao="Só entram aqui os documentos ligados à obra. Um ficheiro ligado a uma tarefa, a uma despesa ou a um fornecedor vive na entidade a que está associado."
                projectos={projectosVisiveis}
                contar={contar}
                medicoes={modulo.medicoes}
                leituras={leituras}
                carimbo="SGO · DOCUMENTOS"
            >
                {(projecto) => <FolhaDocumentos projectoId={projecto.id} />}
            </PaginaModulo>
        </LayoutAdmin>
    );
}
import { useCallback, useMemo } from 'react';

import type { Medicao } from '@/Components/brand/quadro-medicoes';
import { useSgo } from '@/Data/SgoContext';
import { LayoutAdmin } from '@/Layouts/LayoutAdmin';
import { data, numero } from '@/lib/format';
import { rotuloPerfil } from '@/lib/rotulos';

import { FolhaDiario } from './execucao/folha-diario';
import { PaginaModulo } from './execucao/pagina-modulo';

/**
 * `/admin/diario` — o diário de obra, módulo do índice.
 *
 * O diário é um registo por obra e dia, e quem vem aqui quer ver o que aconteceu
 * nos vários dias ao mesmo tempo. A folha de cada obra é a mesma que o separador
 * da ficha mostra, para não haver duas leituras do mesmo registo.
 *
 * O que não subiu continua a contar como escrito: o registo guarda-se no terreno e
 * só depois viaja. Por isso o pendente é âmbar em toda a folha, nunca vermelho.
 */
export default function Diario() {
    const { estado, projectosVisiveis, perfilEfectivo, utilizadorEfectivo } = useSgo();

    const contar = useCallback(
        (projectoId: string) => estado.diarios.filter((d) => d.projectoId === projectoId).length,
        [estado.diarios],
    );

    const contarPorSubir = useCallback(
        (projectoId: string | null) =>
            estado.diarios.filter(
                (d) => !d.sincronizado && (projectoId === null || d.projectoId === projectoId),
            ).length,
        [estado.diarios],
    );

    // As quatro medidas da capa: dias escritos, o que ainda não subiu, o dia mais
    // recente e quantas pessoas estavam nele.
    const leituras = useCallback(
        (projectoId: string): Medicao[] => {
            const dias = estado.diarios
                .filter((d) => d.projectoId === projectoId)
                .toSorted((a, b) => a.data.localeCompare(b.data));

            const ultimo = dias.at(-1) ?? null;
            const pendentes = dias.filter((d) => !d.sincronizado).length;

            return [
                { rotulo: 'Dias registados', valor: numero(dias.length), nota: 'nesta obra' },
                {
                    rotulo: 'Por sincronizar',
                    valor: numero(pendentes),
                    nota: pendentes > 0 ? 'guardados no terreno' : 'tudo no escritório',
                },
                {
                    rotulo: 'Último dia',
                    valor: ultimo === null ? '—' : data(ultimo.data),
                    nota: ultimo === null ? 'sem registo' : 'o dia mais recente',
                },
                {
                    rotulo: 'Efectivo',
                    valor: ultimo === null ? '—' : String(ultimo.efectivoPresente),
                    nota: 'pessoas no último dia',
                },
            ];
        },
        [estado.diarios],
    );

    const modulo = useMemo(() => {
        const visiveis = new Set(projectosVisiveis.map((p) => p.id));
        const dias = estado.diarios.filter((d) => visiveis.has(d.projectoId));
        const pendentes = dias.filter((d) => !d.sincronizado).length;
        const ultimo = dias.toSorted((a, b) => a.data.localeCompare(b.data)).at(-1) ?? null;

        return {
            medicoes: [
                {
                    rotulo: 'Obras visíveis',
                    valor: numero(projectosVisiveis.length),
                    nota: 'com acesso atribuído',
                },
                { rotulo: 'Dias registados', valor: numero(dias.length), nota: 'em todas as obras' },
                {
                    rotulo: 'Por sincronizar',
                    valor: numero(pendentes),
                    nota: pendentes > 0 ? 'ainda no terreno' : 'tudo no escritório',
                },
                {
                    rotulo: 'Último dia',
                    valor: ultimo === null ? '—' : data(ultimo.data),
                    nota: 'o dia mais recente',
                },
                {
                    rotulo: 'Ocorrências',
                    valor: String(dias.filter((d) => d.ocorrencias.trim() !== '').length),
                    nota: 'dias com nota escrita',
                },
                {
                    rotulo: 'Efectivo médio',
                    valor:
                        dias.length === 0
                            ? '—'
                            : String(
                                  Math.round(
                                      dias.reduce((soma, d) => soma + d.efectivoPresente, 0) /
                                          dias.length,
                                  ),
                              ),
                    nota: 'pessoas por dia registado',
                },
            ],
            linha: `${dias.length} dias registados em ${projectosVisiveis.length} obras visíveis para ${utilizadorEfectivo.nome} · ${rotuloPerfil(perfilEfectivo)}.`,
        };
    }, [estado.diarios, projectosVisiveis, utilizadorEfectivo.nome, perfilEfectivo]);

    return (
        <LayoutAdmin>
            <PaginaModulo
                modulo="Registo de campo"
                titulo="Diário de obra"
                folha="02 / 08"
                linha={modulo.linha}
                anotacao="O diário escreve-se no terreno, onde a rede falha. O registo guarda-se na mesma e fica à espera de subir; o selo âmbar diz que ainda não subiu."
                projectos={projectosVisiveis}
                contar={contar}
                contarPorSubir={contarPorSubir}
                medicoes={modulo.medicoes}
                leituras={leituras}
                carimbo="SGO · DIÁRIO DE OBRA"
            >
                {(projecto) => <FolhaDiario projectoId={projecto.id} />}
            </PaginaModulo>
        </LayoutAdmin>
    );
}
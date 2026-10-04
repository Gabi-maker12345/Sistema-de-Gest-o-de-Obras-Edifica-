import { useCallback, useMemo } from 'react';

import type { Medicao } from '@/Components/brand/quadro-medicoes';
import { useSgo } from '@/Data/SgoContext';
import { LayoutAdmin } from '@/Layouts/LayoutAdmin';
import { data, numero } from '@/lib/format';
import { rotuloPerfil } from '@/lib/rotulos';

import { FolhaFotografias } from './execucao/galeria-fotografias';
import { PaginaModulo } from './execucao/pagina-modulo';

/**
 * `/admin/fotografias` — a galeria, módulo do índice.
 *
 * As fotografias do seed não têm ficheiro, por isso a moldura é a legenda sobre
 * hachura. Ver a folha para saber o que cada moldura está a dizer.
 *
 * O que as fotografias herdam do diário é a espera: tiradas no terreno, sobem
 * quando há rede. O pendente é por isso âmbar, e a capa diz quantas são.
 */
export default function Fotografias() {
    const { estado, projectosVisiveis, perfilEfectivo, utilizadorEfectivo } = useSgo();

    const contar = useCallback(
        (projectoId: string) =>
            estado.fotografias.filter((f) => f.projectoId === projectoId).length,
        [estado.fotografias],
    );

    const contarPorSubir = useCallback(
        (projectoId: string | null) =>
            estado.fotografias.filter(
                (f) => !f.sincronizado && (projectoId === null || f.projectoId === projectoId),
            ).length,
        [estado.fotografias],
    );

    // As quatro medidas da capa: quanto há, o que ainda não subiu, quando foi a
    // última tirada e em quantos sítios distintos.
    const leituras = useCallback(
        (projectoId: string): Medicao[] => {
            const fotografias = estado.fotografias.filter((f) => f.projectoId === projectoId);
            const ultima = fotografias
                .toSorted((a, b) => a.dataCaptura.localeCompare(b.dataCaptura))
                .at(-1);
            const pendentes = fotografias.filter((f) => !f.sincronizado).length;
            const locais = new Set(fotografias.map((f) => f.localizacao));

            return [
                {
                    rotulo: 'Fotografias',
                    valor: numero(fotografias.length),
                    nota: 'nesta obra',
                },
                {
                    rotulo: 'Por sincronizar',
                    valor: numero(pendentes),
                    nota: pendentes > 0 ? 'guardadas no terreno' : 'todas no escritório',
                },
                {
                    rotulo: 'Última captura',
                    valor: ultima === undefined ? '—' : data(ultima.dataCaptura),
                    nota: ultima === undefined ? 'sem registo' : 'a mais recente',
                },
                {
                    rotulo: 'Locais',
                    valor: numero(locais.size),
                    nota: 'sítios distintos fotografados',
                },
            ];
        },
        [estado.fotografias],
    );

    const modulo = useMemo(() => {
        const visiveis = new Set(projectosVisiveis.map((p) => p.id));
        const fotografias = estado.fotografias.filter((f) => visiveis.has(f.projectoId));
        const pendentes = fotografias.filter((f) => !f.sincronizado).length;
        const ultima = fotografias
            .toSorted((a, b) => a.dataCaptura.localeCompare(b.dataCaptura))
            .at(-1);
        const locais = new Set(fotografias.map((f) => f.localizacao));

        return {
            medicoes: [
                {
                    rotulo: 'Obras visíveis',
                    valor: numero(projectosVisiveis.length),
                    nota: 'com acesso atribuído',
                },
                {
                    rotulo: 'Fotografias',
                    valor: numero(fotografias.length),
                    nota: 'em todas as obras',
                },
                {
                    rotulo: 'Por sincronizar',
                    valor: numero(pendentes),
                    nota: pendentes > 0 ? 'ainda no terreno' : 'todas no escritório',
                },
                {
                    rotulo: 'Última captura',
                    valor: ultima === undefined ? '—' : data(ultima.dataCaptura),
                    nota: 'em qualquer obra visível',
                },
                {
                    rotulo: 'Locais',
                    valor: numero(locais.size),
                    nota: 'sítios distintos',
                },
                {
                    rotulo: 'Ligadas ao diário',
                    valor: numero(fotografias.filter((f) => f.diarioId !== null).length),
                    nota: 'as outras seguem tarefas',
                },
            ],
            linha: `${numero(fotografias.length)} fotografias em ${numero(projectosVisiveis.length)} obras visíveis para ${utilizadorEfectivo.nome} · ${rotuloPerfil(perfilEfectivo)}.`,
        };
    }, [estado.fotografias, projectosVisiveis, utilizadorEfectivo.nome, perfilEfectivo]);

    return (
        <LayoutAdmin>
            <PaginaModulo
                modulo="Registo de campo"
                titulo="Fotografias"
                folha="03 / 08"
                linha={modulo.linha}
                anotacao="Uma fotografia vale mais quando se sabe onde foi tirada: a legenda diz o local, o dia e a tarefa ou o diário de onde vem."
                projectos={projectosVisiveis}
                contar={contar}
                contarPorSubir={contarPorSubir}
                medicoes={modulo.medicoes}
                leituras={leituras}
                carimbo="SGO · FOTOGRAFIAS"
            >
                {(projecto) => <FolhaFotografias projectoId={projecto.id} />}
            </PaginaModulo>
        </LayoutAdmin>
    );
}
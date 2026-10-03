import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { CabecalhoFolha } from '@/Components/brand/cabecalho-folha';
import { Combo, type OpcaoCombo } from '@/Components/ui/combobox';
import type { Medicao } from '@/Components/brand/quadro-medicoes';
import type { Projecto } from '@/Data/types';

/**
 * A casca de um módulo de registo de campo.
 *
 * Diário de obra, Fotografias e Documentos são módulos do índice — folhas com
 * rota, ao lado de Projectos e Equipas — mas o registo que mostram é de uma
 * obra, não do painel. Por isso o módulo abre com a obra escolhida: sem ela não
 * há diário para ler, e inventar um «diário do painel» seria uma folha que
 * ninguém consegue preencher.
 *
 * A escolha fica em `projectoId` no estado local e não na rota. É a mesma
 * decisão de `/admin/agenda`: o módulo é uma folha, e o que se está a ler
 * dentro dela é uma escolha de quem olha, não um endereço para onde se vai.
 */
export function PaginaModulo({
    modulo,
    titulo,
    linha,
    anotacao,
    projectos,
    folha,
    contar,
    porSincronizar,
    children,
}: {
    modulo: string;
    titulo: string;
    linha: string;
    anotacao?: string;
    projectos: Projecto[];
    folha: string;
    /** Quantos registos o módulo tem nesta obra — decide quem aparece no índice. */
    contar: (projectoId: string) => number;
    /** Registos ainda por subir. Fica de fora quando o módulo não tem sincronização. */
    porSincronizar?: number;
    children: (projecto: Projecto) => ReactNode;
}) {
    const [projectoId, definirProjectoId] = useState<string | null>(null);

    const opcoes = useMemo<OpcaoCombo[]>(
        () => projectos.map((projecto) => ({ valor: projecto.id, rotulo: projecto.nome })),
        [projectos],
    );

    const projecto = projectos.find((p) => p.id === projectoId) ?? null;

    /**
     * As medidas da capa saem do mesmo `contar` que a folha, ou a capa anuncia
     * um número e a folha mostra outro — e é a capa que se lê primeiro.
     *
     * «Por sincronizar» só entra quando o módulo tem sincronização. Num módulo
     * sem ela, a medida seria um zero que parece um estado e não é.
     */
    const medicoes = useMemo(() => {
        const lista: Medicao[] = [
            { rotulo: 'Obras', valor: String(projectos.length) },
            {
                rotulo: 'Registos',
                valor: String(projectos.reduce((soma, p) => soma + contar(p.id), 0)),
            },
        ];

        return porSincronizar === undefined
            ? lista
            : [
                  ...lista,
                  {
                      rotulo: 'Por sincronizar',
                      valor: String(porSincronizar),
                      critico: porSincronizar > 0,
                  },
              ];
    }, [projectos, contar, porSincronizar]);

    return (
        <div className="space-y-12">
            <CabecalhoFolha
                cota={`Pasta de obra · ${modulo}`}
                titulo={titulo}
                linha={linha}
                anotacao={anotacao}
                folha={folha}
                medicoes={medicoes}
            />

            <div className="space-y-6">
                <div className="flex flex-wrap items-end gap-3">
                    <div className="w-72">
                        <Combo
                            valor={projectoId}
                            opcoes={opcoes}
                            aoEscolher={definirProjectoId}
                            vazio="Nenhum projecto visível a este utilizador."
                            placeholder="Escolher a obra…"
                        />
                    </div>

                    {projecto !== null && (
                        <p className="cota pb-2">
                            A mostrar o registo de{' '}
                            <span className="font-medium text-graphite">{projecto.nome}</span>.
                        </p>
                    )}
                </div>

                {projecto !== null ? children(projecto) : <EscolherObra projectos={projectos} contar={contar} />}
            </div>
        </div>
    );
}

/**
 * O estado vazio: as obras visíveis que têm registo, uma por linha.
 *
 * Uma lista de nomes não ajuda a escolher, e o módulo é o caso em que não se
 * sabe o que há dentro de cada obra. Cada linha por isso diz quantos registos
 * existem, e as obras sem registo ficam de fora: uma obra sem diário não é um
 * destino.
 */
function EscolherObra({
    projectos,
    contar,
}: {
    projectos: Projecto[];
    contar: (projectoId: string) => number;
}) {
    const linhas = useMemo(
        () =>
            projectos
                .map((projecto) => ({ projecto, registos: contar(projecto.id) }))
                .filter((linha) => linha.registos > 0),
        [projectos, contar],
    );

    if (linhas.length === 0) {
        return (
            <p className="hachura-90 border border-graphite-20 p-8 text-center text-sm text-graphite-64">
                Nenhuma obra visível a este utilizador tem registo neste módulo.
            </p>
        );
    }

    return (
        <ul className="border border-graphite-32">
            {linhas.map((linha) => (
                <li
                    key={linha.projecto.id}
                    className="flex items-baseline justify-between gap-3 border-b border-graphite-20 px-4 py-3 last:border-0"
                >
                    <span className="text-sm text-graphite">{linha.projecto.nome}</span>
                    <span className="cota tabular">
                        {linha.registos} {linha.registos === 1 ? 'registo' : 'registos'}
                    </span>
                </li>
            ))}
        </ul>
    );
}
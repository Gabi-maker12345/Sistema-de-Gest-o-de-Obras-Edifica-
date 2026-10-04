import { useMemo, useState } from 'react';

import { useOrdem } from '@/Components/brand/cabecalho-cota';
import { useBusca } from '@/Components/brand/contexto-busca';
import { FolhaRegistos } from '@/Components/brand/folha-registos';
import { SeloSincronizacao } from '@/Components/brand/selo-sincronizacao';
import { TextoLongo } from '@/Components/brand/texto-longo';
import { useSgo } from '@/Data/SgoContext';
import type { DiarioObra } from '@/Data/types';
import { data, normalizar } from '@/lib/format';
import { ROTULOS } from '@/lib/rotulos';

import { BotaoLimpar } from '@/Components/brand/botao-limpar';
import { Botao } from '@/Components/ui/button';

import { ModalDiario } from '../ModalDiario';

/**
 * O diário de obra: um registo por projecto e dia.
 *
 * O céu entra na primeira coluna porque é a informação que dá contexto ao resto
 * do dia: «chuva» ao lado de um atraso lê-se de imediato, e o motivo fica à
 * vista sem abrir o registo.
 *
 * A ordenação é por data a descer. Um diário é uma cronologia — a pergunta que
 * se faz ao abrir é «o que aconteceu ontem», e responder a isso exige que
 * ontem esteja no topo. Uma lista ordenada por outra coisa transformava o
 * diário num índice sem ordem.
 */
export function FolhaDiario({
    projectoId,
    className,
}: {
    projectoId: string;
    className?: string;
}) {
    const { estado } = useSgo();
    const [fichaAberta, definirFichaAberta] = useState(false);
    const { termo, limpar } = useBusca();
    const { ordem, alternar, ordenar } = useOrdem<DiarioObra>(COLUNAS, 'data');

    const diarios = useMemo(
        () => estado.diarios.filter((diario) => diario.projectoId === projectoId),
        [estado.diarios, projectoId],
    );

    const visiveis = useMemo(() => {
        const alvo = normalizar(termo.trim());

        return diarios.filter((diario) => {
            if (alvo.length === 0) {
                return true;
            }

            return normalizar(
                [
                    diario.ocorrencias,
                    ...diario.actividadesRealizadas,
                    ROTULOS.meteorologia[diario.condicoesMeteorologicas],
                ].join(' '),
            ).includes(alvo);
        });
    }, [diarios, termo]);

    const linhas = useMemo(() => ordenar(visiveis), [visiveis, ordenar]);

    const pendentes = linhas.filter((diario) => !diario.sincronizado);

return (
            <>
                <FolhaRegistos<DiarioObra>
                    titulo="Diário de obra"
                    accoes={
                        <Botao
                            variante="primario"
                            tamanho="sm"
                            onClick={() => definirFichaAberta(true)}
                        >
                            + Novo dia
                        </Botao>
                    }
            contagem={
                termo.trim().length > 0 ? (
                    <BotaoLimpar aoLimpar={limpar} />
                ) : (
                    <span>
                        {linhas.length} dias registados
                        {pendentes.length > 0 && ` · ${pendentes.length} por sincronizar`}
                    </span>
                )
            }
            ordem={ordem}
            alternar={alternar}
            colunas={COLUNAS}
            grelha="grid-cols-[minmax(0,1fr)_104px_84px_92px]"
            linhas={linhas}
            chaveDe={(diario) => diario.id}
            vazio={
                termo.trim().length > 0
                    ? 'Nenhum registo do diário corresponde a esta busca.'
                    : 'Este projecto ainda não tem registos de diário.'
            }
            className={className}
        >
            {(diario) => {
                const autor = estado.utilizadores.find(
                    (utilizador) => utilizador.id === diario.registadoPor,
                );

                return (
                    <div className="grid grid-cols-1 gap-2 px-3 py-3 md:grid-cols-[minmax(0,1fr)_104px_84px_92px] md:items-start md:gap-3">
                        <div className="min-w-0 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <p className="text-sm font-medium text-graphite tabular">
                                    {data(diario.data)}
                                </p>
                                <span className="cota">
                                    {ROTULOS.meteorologia[diario.condicoesMeteorologicas]}
                                </span>
                                <SeloSincronizacao sincronizado={diario.sincronizado} />
                            </div>

                            {diario.actividadesRealizadas.length > 0 && (
                                <ul className="space-y-0.5">
                                    {diario.actividadesRealizadas.map((actividade) => (
                                        <li key={actividade} className="text-xs text-graphite-64">
                                            {actividade}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {diario.ocorrencias.length > 0 &&
                                diario.ocorrencias !== 'Sem ocorrências.' && (
                                    <TextoLongo
                                        texto={diario.ocorrencias}
                                        className="text-xs text-graphite"
                                    />
                                )}
                        </div>

                        <p className="cota tabular">
                            {diario.efectivoPresente === 0
                                ? 'sem pessoal'
                                : `${diario.efectivoPresente} pessoas`}
                        </p>

                        <p className="cota truncate">{autor?.nome ?? '—'}</p>

                        <p className="cota tabular md:text-right">
                            {diario.actividadesRealizadas.length} actividade
                            {diario.actividadesRealizadas.length === 1 ? '' : 's'}
                        </p>
                    </div>
                );
}}
                </FolhaRegistos>

                <ModalDiario
                    aberto={fichaAberta}
                    diario={null}
                    comProjecto={projectoId}
                    aoFechar={() => definirFichaAberta(false)}
                />
            </>
        );
    }

const COLUNAS = [
    { chave: 'data', cota: 'Dia', valor: (diario: DiarioObra) => diario.data },
    { chave: 'efectivo', cota: 'Efectivo', valor: (diario: DiarioObra) => diario.efectivoPresente },
    {
        chave: 'actividades',
        cota: 'Actividades',
        alinhamento: 'direita' as const,
        valor: (diario: DiarioObra) => diario.actividadesRealizadas.length,
    },
    { chave: 'sincronizado', cota: 'Estado', alinhamento: 'direita' as const },
];
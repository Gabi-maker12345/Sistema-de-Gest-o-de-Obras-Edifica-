import { useMemo } from 'react';

import { useBusca } from '@/Components/brand/contexto-busca';
import { SeloSincronizacao } from '@/Components/brand/selo-sincronizacao';
import { useSgo } from '@/Data/SgoContext';
import type { Fotografia } from '@/Data/types';
import { data, normalizar } from '@/lib/format';
import { cn } from '@/lib/utils';

import { BotaoLimpar } from '@/Components/brand/botao-limpar';

/**
 * A galeria de fotografias do projecto.
 *
 * Não é uma folha de registos: fotografias não têm colunas para ordenar, e
 * alinhá-las numa grelha de números é pôr a mesma forma onde a leitura é outra.
 * A ordem é a do tempo, da mais recente para a mais antiga, porque se entra
 * numa galeria para ver o estado de hoje.
 *
 * Cada fotografia sabe de onde veio — o diário do dia ou a tarefa — e esse
 * vínculo é o que torna a imagem útil: uma foto de armadura vale mais quando se
 * sabe que foi tirada na conferência do piso 1. Por isso a origem aparece na
 * legenda em vez de ser só um detalhe técnico.
 *
 * As imagens do seed não têm ficheiro (`url` vazio), por isso a moldura é a
 * própria legenda sobre hachura: um rectângulo cinzento a fingir ser uma foto
 * seria pior do que dizer que a foto não carregou.
 */
export function FolhaFotografias({
    projectoId,
    className,
}: {
    projectoId: string;
    className?: string;
}) {
    const { estado } = useSgo();
    const { termo, limpar } = useBusca();

    const fotografias = useMemo(() => {
        const alvo = normalizar(termo.trim());

        return estado.fotografias
            .filter((fotografia) => fotografia.projectoId === projectoId)
            .filter((fotografia) =>
                alvo.length === 0
                    ? true
                    : normalizar(
                          `${fotografia.descricao} ${fotografia.localizacao}`,
                      ).includes(alvo),
            )
            .sort((a, b) => b.dataCaptura.localeCompare(a.dataCaptura));
    }, [estado.fotografias, projectoId, termo]);

    const pendentes = fotografias.filter((fotografia) => !fotografia.sincronizado);

    return (
        <section className={cn('space-y-2', className)}>
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-graphite-32 pb-2">
                <h2 className="cota text-graphite">Fotografias</h2>
                {termo.trim().length > 0 ? (
                    <BotaoLimpar aoLimpar={limpar} />
                ) : (
                    <p className="cota">
                        {fotografias.length} fotografias
                        {pendentes.length > 0 && ` · ${pendentes.length} por sincronizar`}
                    </p>
                )}
            </div>

            {fotografias.length === 0 ? (
                <p className="border border-dashed border-graphite-32 p-6 text-sm text-graphite-64">
                    {termo.trim().length > 0
                        ? 'Nenhuma fotografia corresponde a esta busca.'
                        : 'Este projecto ainda não tem fotografias.'}
                </p>
            ) : (
                <ul className="grid grid-cols-1 gap-px border border-graphite-32 bg-graphite-32 sm:grid-cols-2 lg:grid-cols-3">
                    {fotografias.map((fotografia) => (
                        <li key={fotografia.id}>
                            <Moldura fotografia={fotografia} />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

function Moldura({ fotografia }: { fotografia: Fotografia }) {
    const { estado } = useSgo();

    const origem = estado.diarios.find((diario) => diario.id === fotografia.diarioId);
    const tarefa = estado.tarefas.find((t) => t.id === fotografia.tarefaId);
    const autor = estado.utilizadores.find(
        (utilizador) => utilizador.id === fotografia.tiradaPor,
    );

    return (
        <figure className="flex h-full flex-col bg-paper">
            <div
                className="hachura-90 flex h-36 items-center justify-center border-b border-graphite-20"
                role="img"
                aria-label={fotografia.descricao}
            >
                <p className="cota px-4 text-center">{fotografia.localizacao}</p>
            </div>

            <figcaption className="flex flex-1 flex-col gap-1.5 p-3">
                <p className="text-sm text-graphite">{fotografia.descricao}</p>

                <div className="flex flex-wrap items-center gap-2">
                    <SeloSincronizacao sincronizado={fotografia.sincronizado} />
                </div>

                <dl className="cota mt-auto space-y-0.5">
                    <div className="flex gap-1.5">
                        <dt>Captura</dt>
                        <dd className="tabular">{data(fotografia.dataCaptura)}</dd>
                    </div>

                    {origem !== undefined && (
                        <div className="flex gap-1.5">
                            <dt>Diário</dt>
                            <dd className="tabular">{data(origem.data)}</dd>
                        </div>
                    )}

                    {tarefa !== undefined && (
                        <div className="flex gap-1.5">
                            <dt>Tarefa</dt>
                            <dd className="truncate">{tarefa.titulo}</dd>
                        </div>
                    )}

                    <div className="flex gap-1.5">
                        <dt>Por</dt>
                        <dd className="truncate">{autor?.nome ?? '—'}</dd>
                    </div>
                </dl>
            </figcaption>
        </figure>
    );
}
import { useMemo, useState } from 'react';

import { useBusca } from '@/Components/brand/contexto-busca';
import { FolhaRegistos } from '@/Components/brand/folha-registos';
import { useSgo } from '@/Data/SgoContext';
import type { DocumentoSgo } from '@/Data/types';
import { data, normalizar } from '@/lib/format';
import { ROTULOS } from '@/lib/rotulos';

import { BotaoLimpar } from '@/Components/brand/botao-limpar';
import { Botao } from '@/Components/ui/button';

import { ModalDocumento } from '../ModalDocumento';

/**
 * Os documentos do projecto.
 *
* O que distingue esta lista das outras é a versão: re-anexar um ficheiro no
 * mesmo registo não cria um documento novo, sobe o número (spec, Documentos).
 * Por isso a coluna escreve `v3` e diz quantas vezes o ficheiro foi
 * substituído — a pergunta real é «isto é a versão que assinámos?», e o número
 * sozinho não responde a isso.
 *
 * Os documentos aqui são só os que têm projecto. Um documento pode estar ligado
 * a uma tarefa, a uma despesa ou a um fornecedor, e esse ficheiro não pertence
 * à pasta da obra — aparece na entidade a que está associado. Filtrar por
 * `projectoId` em vez de listar tudo é o que mantém a lista honesta.
 */
export function FolhaDocumentos({
    projectoId,
    className,
}: {
    projectoId: string;
    className?: string;
}) {
    const { estado } = useSgo();
    const [fichaAberta, definirFichaAberta] = useState(false);
    const { termo, limpar } = useBusca();

    const documentos = useMemo(() => {
        const alvo = normalizar(termo.trim());

        return estado.documentos
            .filter((documento) => documento.projectoId === projectoId)
            .filter((documento) =>
                alvo.length === 0
                    ? true
                    : normalizar(
                          `${documento.nomeFicheiro} ${ROTULOS.tipoDocumento[documento.tipoDocumento]}`,
                      ).includes(alvo),
            )
            .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    }, [estado.documentos, projectoId, termo]);

return (
            <>
                <FolhaRegistos<DocumentoSgo>
                    titulo="Documentos"
                    accoes={
                        <Botao
                            variante="primario"
                            tamanho="sm"
                            onClick={() => definirFichaAberta(true)}
                        >
                            + Anexar documento
                        </Botao>
                    }
            contagem={
                termo.trim().length > 0 ? (
                    <BotaoLimpar aoLimpar={limpar} />
                ) : (
                    <span>{documentos.length} documentos</span>
                )
            }
            ordem={{ coluna: 'criadoEm', sentido: 'desc' }}
            alternar={() => undefined}
            colunas={COLUNAS}
            grelha="grid-cols-[minmax(0,1fr)_140px_88px_96px]"
            linhas={documentos}
            chaveDe={(documento) => documento.id}
            vazio={
                termo.trim().length > 0
                    ? 'Nenhum documento corresponde a esta busca.'
                    : 'Este projecto ainda não tem documentos.'
            }
            className={className}
        >
            {(documento) => {
                const autor = estado.utilizadores.find(
                    (utilizador) => utilizador.id === documento.uploadPor,
                );

                return (
                    <div className="grid grid-cols-1 gap-2 px-3 py-3 md:grid-cols-[minmax(0,1fr)_140px_88px_96px] md:items-center md:gap-3">
                        <div className="min-w-0 space-y-1">
                            <p className="truncate text-sm font-medium text-graphite">
                                {documento.nomeFicheiro}
                            </p>
                            <p className="cota">
                                {ROTULOS.tipoDocumento[documento.tipoDocumento]} ·{' '}
                                {documento.tamanho}
                                {documento.versao > 1 && ` · substituído ${documento.versao - 1}×`}
                            </p>
                        </div>

                        <p className="cota truncate">{autor?.nome ?? '—'}</p>

                        <p className="cota tabular">v{documento.versao}</p>

                        <p className="cota tabular md:text-right">{data(documento.criadoEm)}</p>
                    </div>
                );
}}
                </FolhaRegistos>

                <ModalDocumento
                    aberto={fichaAberta}
                    documento={null}
                    aoFechar={() => definirFichaAberta(false)}
                />
            </>
        );
    }

const COLUNAS = [
    {
        chave: 'nomeFicheiro',
        cota: 'Ficheiro',
        valor: (documento: DocumentoSgo) => documento.nomeFicheiro,
    },
    { chave: 'uploadPor', cota: 'Subiu', valor: (documento: DocumentoSgo) => documento.uploadPor },
    { chave: 'versao', cota: 'Versão', valor: (documento: DocumentoSgo) => documento.versao },
    { chave: 'criadoEm', cota: 'Data', valor: (documento: DocumentoSgo) => documento.criadoEm },
];
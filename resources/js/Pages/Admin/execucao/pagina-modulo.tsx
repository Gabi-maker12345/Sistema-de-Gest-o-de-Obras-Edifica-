import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { BarraObras } from '@/Components/brand/barra-obras';
import { CabecalhoFolha } from '@/Components/brand/cabecalho-folha';
import { CapaObra } from '@/Components/brand/capa-obra';
import { Carimbo } from '@/Components/brand/carimbo';
import type { Medicao } from '@/Components/brand/quadro-medicoes';
import type { Projecto } from '@/Data/types';
import { dataExtenso } from '@/lib/format';

import { IndiceObras } from './indice-obras';

/**
 * A casca de um módulo de registo de campo.
 *
 * Diário de obra, Fotografias, Documentos e Actividades são folhas do índice — com
 * rota, ao lado de Projectos e Equipas — mas o registo que mostram é de uma obra,
 * não do painel. Por isso a casca tem de responder a duas perguntas antes do
 * registo: «que obra é esta?» e «o que há nela?».
 *
 * A resposta é a barra de estações em cima e a capa em baixo. Entre as duas, o
 * módulo tem a mesma gramática dos cadastros: cabeçalho de folha, bloco de
 * título sobre a tábua, e o carimbo que diz a que pasta e a que obra pertence o
 * que está a ser lido.
 *
 * A escolha fica em `projectoId` no estado local e não na rota, a mesma decisão
 * de `/admin/agenda`: o módulo é uma folha e o que se está a ler dentro dela é
 * uma escolha de quem olha, não um endereço para onde se vai. Em troca, a obra
 * escolhida é sempre uma obra visível ao utilizador — a barra só oferece as que a
 * aba Acessos lhe dá.
 */
export function PaginaModulo({
    modulo,
    titulo,
    folha,
    linha,
    anotacao,
    projectos,
    contar,
    contarPorSubir,
    medicoes,
    leituras,
    carimbo,
    children,
}: {
    modulo: string;
    titulo: string;
    /** A folha do índice de folhas, tal como está cotada no índice. */
    folha: string;
    linha: ReactNode;
    anotacao?: ReactNode;
    /** Só as obras visíveis ao utilizador efectivo. */
    projectos: Projecto[];
    /** Quantos registos o módulo tem nesta obra. */
    contar: (projectoId: string) => number;
    /**
     * Quantos registos ainda não subiram, na obra indicada ou em todas.
     * `null` é todas as obras. Fica de fora quando o módulo não tem
     * sincronização: num módulo sem ela a medida seria um zero que parece um
     * estado, e não é.
     */
    contarPorSubir?: (projectoId: string | null) => number;
    /** As seis medidas do módulo inteiro, que o bloco de título do desenho leva. */
    medicoes: Medicao[];
    /** As quatro medidas do módulo numa obra, que a capa leva. */
    leituras: (projectoId: string) => Medicao[];
    /** A identidade do carimbo: a que pasta e a que folha pertence o registo. */
    carimbo: string;
    children: (projecto: Projecto) => ReactNode;
}) {
    const [projectoId, definirProjectoId] = useState<string | null>(null);

    const projecto = projectos.find((p) => p.id === projectoId) ?? null;

    // A obra escolhida é derivada, não guardada: se ela desaparecer dos acessos
    // enquanto a folha está aberta, `projectoId` aponta para o vazio e a folha
    // volta ao índice sem precisar de ser avisada de nada.
    const activo = projecto === null ? null : projecto.id;
    const registos = projecto === null ? null : contar(projecto.id);
    const aSubir = contarPorSubir?.(activo);

    return (
        <>
            {/* O `Head` recebe o assunto pelado: o template de título do `app.tsx`
                acrescenta o nome da aplicação, e escrever `— SGO` aqui punha a
                marca duas vezes no separador do navegador. */}
            <Head title={titulo}>
                <meta
                    name="description"
                    content={`${modulo}: registo de obra a obra, com as medidas do módulo em cabeçalho e em capa.`}
                />
            </Head>

            <div className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6">
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
                        <BarraObras
                            obras={projectos}
                            contar={contar}
                            activo={activo}
                            aoEscolher={definirProjectoId}
                        />

                        {projecto === null ? (
                            <IndiceObras
                                obras={projectos}
                                contar={contar}
                                porSubir={contarPorSubir}
                                aoEscolher={definirProjectoId}
                            />
                        ) : (
                            <div className="space-y-12">
                                <CapaObra projecto={projecto} leituras={leituras(projecto.id)} />

                                {children(projecto)}
                            </div>
                        )}
                    </div>

                    <Carimbo
                        identidade={carimbo}
                        className="w-[280px]"
                        linhas={[
                            { chave: 'Emitido', valor: dataExtenso(new Date()) },
                            { chave: 'Revisão', valor: 'C' },
                            {
                                chave: 'Obra',
                                valor: projecto === null ? '— todas as visíveis' : projecto.nome,
                            },
                            {
                                chave: 'Registos',
                                valor:
                                    registos === null
                                        ? `${projectos.reduce((soma, p) => soma + contar(p.id), 0)} em todas`
                                        : `${registos} nesta obra`,
                            },
                            ...(aSubir && aSubir > 0
                                ? [
                                      {
                                          chave: 'Por subir',
                                          valor: `${aSubir} ${projecto === null ? 'em todas' : 'nesta obra'}`,
                                      },
                                  ]
                                : []),
                        ]}
                        rodado={-2}
                    />
                </div>

                {/* A obra em leitura muda por clique e pelas setas, e nada na folha se
                    move: sem isto, quem navega por separadoras ouve um separador
                    seleccionado e não sabe que obra ficou aberta. */}
                <p className="sr-only" aria-live="polite">
                    {projecto === null
                        ? `Índice das obras. ${projectos.length} obras visíveis.`
                        : `Obra em leitura: ${projecto.nome}. ${registos} registos neste módulo.`}
                </p>
            </div>
        </>
    );
}
import { useCallback, useEffect, useMemo } from 'react';

import { Campo, CampoDerivado } from '@/Components/ui/field';
import { Input } from '@/Components/ui/input';
import { ModalForma } from '@/Components/ui/modal-forma';
import { Combo } from '@/Components/ui/combobox';
import { Calendario } from '@/Components/ui/calendario';
import { Textarea } from '@/Components/ui/textarea';
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
import type { CondicaoMeteorologica, DiarioObra } from '@/Data/types';
import { ROTULOS } from '@/lib/rotulos';

import { REGRAS, novoId, useFicha } from './formulario-local';

/**
 * A ficha do diário de obra.
 *
 * O diário é o único registo da fase 5 cuja chave natural é dupla: um projecto
 * só pode ter um diário por dia. A spec pede a validação com o erro exacto
 * «Já existe um diário para esta data», porque este registo é o que o encarregado
 * preenche no terreno e um segundo lançamento no mesmo dia é quase sempre o
 * mesmo dia em dobro, não um dia novo.
 *
 * A validação olha para a data que está nos outros diários do mesmo projecto e
 * ignora o próprio registo quando se está a corrigir — sem essa excepção, abrir
 * um diário para o corrigir acusaria sempre a duplicação de si próprio.
 *
 * O campo de sincronização não existe no formulário: a spec fixa-o a `true` nos
 * registos criados pelo painel. Quem nasce «pendente» é o registo que veio do
 * terreno, e essa marca é o que o badge âmbar da folha está a mostrar.
 */
type DadosDiario = {
    id: string;
    projectoId: string | null;
    data: string | null;
    condicoesMeteorologicas: CondicaoMeteorologica;
    efectivoPresente: string;
    actividadesRealizadas: string[];
    ocorrencias: string;
};

const VAZIO: DadosDiario = {
    id: '',
    projectoId: null,
    data: null,
    condicoesMeteorologicas: 'ensolarado',
    efectivoPresente: '',
    actividadesRealizadas: [],
    ocorrencias: '',
};

function de(diario: DiarioObra): DadosDiario {
    return {
        id: diario.id,
        projectoId: diario.projectoId,
        data: diario.data,
        condicoesMeteorologicas: diario.condicoesMeteorologicas,
        efectivoPresente: String(diario.efectivoPresente),
        actividadesRealizadas: diario.actividadesRealizadas,
        ocorrencias: diario.ocorrencias,
    };
}

export function ModalDiario({
    aberto,
    diario,
    comProjecto,
    comData,
    aoFechar,
}: {
    aberto: boolean;
    /** `null` é abrir uma ficha nova. */
    diario: DiarioObra | null;
    comProjecto?: string | null;
    comData?: string | null;
    aoFechar: () => void;
}) {
    const { estado, criar, actualizar, utilizadorEfectivo } = useSgo();

    const guardar = useCallback(
        (dados: DadosDiario) => {
            const registo: DiarioObra = {
                id: dados.id || novoId('di'),
                projectoId: dados.projectoId ?? '',
                data: dados.data ?? '',
                condicoesMeteorologicas: dados.condicoesMeteorologicas,
                efectivoPresente: REGRAS.paraNumero(dados.efectivoPresente.trim()) ?? 0,
                actividadesRealizadas: dados.actividadesRealizadas,
                ocorrencias: dados.ocorrencias.trim(),
                registadoPor: diario?.registadoPor ?? utilizadorEfectivo.id,
                // Criado pelo painel web, nasce sincronizado. A marca «pendente»
                // é dos registos que vieram do terreno e não se escreve aqui.
                sincronizado: diario?.sincronizado ?? true,
            };

            if (dados.id) {
                actualizar('diarios', dados.id, registo);
            } else {
                criar('diarios', registo);
            }
        },
        [actualizar, criar, diario, utilizadorEfectivo.id],
    );

    const ficha = useFicha<DadosDiario>({
        vazio: VAZIO,
        validar: (dados) => {
            const erros: Record<string, string> = {
                ...REGRAS.juntar(
                    ['projectoId', REGRAS.seleccionado(dados.projectoId, 'o projecto')],
                    ['data', REGRAS.obrigatorio(dados.data, 'a data')],
                ),
            };

            if (dados.projectoId !== null && dados.data !== null) {
                // A data é a chave natural do diário. Ao corrigir um registo, a
                // duplicação que interessa é a de outro, não a dele próprio.
                const ocupado = estado.diarios.some(
                    (outro) =>
                        outro.id !== dados.id &&
                        outro.projectoId === dados.projectoId &&
                        outro.data === dados.data,
                );

                if (ocupado) {
                    erros.data = 'Já existe um diário para esta data';
                }
            }

            return erros;
        },
        aoGuardar: guardar,
        aoFechar,
        mensagem: (dados) =>
            dados.id ? 'Diário corrigido com sucesso' : 'Diário registado com sucesso',
    });

    useEffect(() => {
        if (aberto) {
            // A data só entra por omissão na criação: corrigir um diário não lhe
            // muda o dia sem querer.
            ficha.preparar(
                diario
                    ? de(diario)
                    : { ...VAZIO, projectoId: comProjecto ?? null, data: comData ?? hoje() },
            );
        }
    }, [aberto, diario, comProjecto, comData]);

    /**
     * As actividades registadas num dia são as desta obra. A lista é a mesma
     * que a actividade pai oferece, e por isso só aparece com obra escolhida.
     */
    const actividadesDaObra = useMemo(
        () =>
            ficha.dados.projectoId === null
                ? []
                : estado.actividades.filter(
                      (actividade) => actividade.projectoId === ficha.dados.projectoId,
                  ),
        [estado.actividades, ficha.dados.projectoId],
    );

    const { definir, dados, erros, sujo, pendente, guardar: submeter } = ficha;
    const comProjectoFixo = comProjecto !== undefined && comProjecto !== '';

    return (
        <ModalForma
            aberto={aberto}
            aoFechar={aoFechar}
            titulo={ficha.dados.id ? 'Editar diário' : 'Novo diário de obra'}
            largura="md"
            sujo={sujo}
            pendente={pendente}
            accao={ficha.dados.id ? 'Guardar alterações' : 'Registar dia'}
            erro={erros.projectoId}
            rodapeNota="Fica marcado como sincronizado. Os registos que chegam do terreno é que aparecem como pendentes."
            aoGuardar={submeter}
        >
            <Campo rotulo="Projecto" htmlFor="diario-projecto" erro={erros.projectoId} obrigatorio>
                <Combo
                    id="diario-projecto"
                    valor={dados.projectoId}
                    opcoes={estado.projectos.map((p) => ({ valor: p.id, rotulo: p.nome }))}
                    aoEscolher={(projectoId) => {
                        definir('projectoId', projectoId);
                        // As actividades realizadas pertencem à obra anterior.
                        definir('actividadesRealizadas', []);
                    }}
                    desactivado={comProjectoFixo}
                    placeholder={comProjectoFixo ? 'Este diário é desta obra' : 'Escolher obra…'}
                    vazio="Nenhum projecto visível."
                />
            </Campo>

            <Campo rotulo="Data" htmlFor="diario-data" erro={erros.data} obrigatorio>
                <Calendario
                    id="diario-data"
                    valor={dados.data}
                    aoEscolher={(data) => definir('data', data)}
                />
            </Campo>

            <Campo rotulo="Condições meteorológicas" htmlFor="diario-meteo">
                <Seletor
                    value={dados.condicoesMeteorologicas}
                    onValueChange={(valor) =>
                        definir('condicoesMeteorologicas', valor as CondicaoMeteorologica)
                    }
                >
                    <SeletorDisparador id="diario-meteo" aria-label="Condições meteorológicas">
                        <SeletorValor />
                    </SeletorDisparador>
                    <SeletorConteudo>
                        <SeletorGrupo>
                            <SeletorGrupoRotulo>Condições</SeletorGrupoRotulo>
                            {(
                                Object.entries(ROTULOS.meteorologia) as Array<
                                    [CondicaoMeteorologica, string]
                                >
                            ).map(([chave, rotulo]) => (
                                <SeletorItem key={chave} value={chave}>
                                    {rotulo}
                                </SeletorItem>
                            ))}
                        </SeletorGrupo>
                    </SeletorConteudo>
                </Seletor>
            </Campo>

            <Campo rotulo="Efectivo presente" htmlFor="diario-efectivo" erro={erros.efectivoPresente}>
                <Input
                    id="diario-efectivo"
                    type="number"
                    min={0}
                    value={dados.efectivoPresente}
                    onChange={(evento) => definir('efectivoPresente', evento.target.value)}
                    placeholder="12"
                />
            </Campo>

            <CampoDerivado
                rotulo="Actividades realizadas"
                nota="O que ficou feito neste dia, para além do que as tarefas já registam."
            >
                {actividadesDaObra.length === 0 ? (
                    <p className="text-xs text-graphite-48">
                        {dados.projectoId === null
                            ? 'Escolher a obra primeiro.'
                            : 'Esta obra ainda não tem actividades.'}
                    </p>
                ) : (
                    <ul className="flex flex-wrap gap-2">
                        {actividadesDaObra.map((actividade) => {
                            const marcada = dados.actividadesRealizadas.includes(actividade.id);

                            return (
                                <li key={actividade.id}>
                                    <button
                                        type="button"
                                        aria-pressed={marcada}
                                        onClick={() =>
                                            definir(
                                                'actividadesRealizadas',
                                                marcada
                                                    ? dados.actividadesRealizadas.filter(
                                                          (id) => id !== actividade.id,
                                                      )
                                                    : [...dados.actividadesRealizadas, actividade.id],
                                            )
                                        }
                                        className={
                                            marcada
                                                ? 'rounded-nib border border-amber bg-amber/10 px-2.5 py-1 text-xs text-tinta'
                                                : 'rounded-nib border border-graphite-32 px-2.5 py-1 text-xs text-graphite hover:border-graphite-48'
                                        }
                                    >
                                        {actividade.nome}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CampoDerivado>

            <Campo rotulo="Ocorrências" htmlFor="diario-ocorrencias" erro={erros.ocorrencias}>
                <Textarea
                    id="diario-ocorrencias"
                    value={dados.ocorrencias}
                    onChange={(evento) => definir('ocorrencias', evento.target.value)}
                    rows={3}
                    placeholder="Atrasos, material em falta, pedidos da fiscalização — o que não está na tarefa."
                />
            </Campo>
        </ModalForma>
    );
}

/** Hoje em ISO curto, que é o formato que o calendário e os registros usam. */
function hoje(): string {
    return new Date().toISOString().slice(0, 10);
}
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Banknote,
    Briefcase,
    CalendarDays,
    ClipboardList,
    HardHat,
    Landmark,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { dataExtenso } from '@/lib/format';
import { cn } from '@/lib/utils';

import { LayoutPublico } from '@/Layouts/LayoutPublico';
import { BlocoTitulo } from '@/Components/brand/bloco-titulo';
import { Carimbo } from '@/Components/brand/carimbo';
import { Botao } from '@/Components/ui/button';
import { Selo } from '@/Components/ui/badge';

/**
 * A capa. Uma prancha de Registers tecnicos monocromatica: a promessa do
 * produto escrita como quem preenche o primeiro campo de uma folha.
 */

const ESTACOES: Array<{
    estacao: string;
    modulo: string;
    titulo: string;
    texto: string;
    icone: LucideIcon;
    exemplos: string[];
}> = [
    {
        estacao: '01',
        modulo: 'Agenda',
        titulo: 'O dia, desenhado antes de começar',
        texto: 'Compromissos pessoais, profissionais e de obra num único calendário, com conflitos assinalados antes de acontecerem.',
        icone: CalendarDays,
        exemplos: ['Compromissos', 'Visitas de obra', 'Prazo de entrega'],
    },
    {
        estacao: '02',
        modulo: 'Tarefas',
        titulo: 'O que ficou por fazer, com nome e prazo',
        texto: 'Cada tarefa tem responsável, prazo e estado. O que escapa escapa; o que está atrasado não se esconde no meio da lista.',
        icone: ClipboardList,
        exemplos: ['Responsável', 'Prioridade', 'Estado visível'],
    },
    {
        estacao: '03',
        modulo: 'Projectos administrativos',
        titulo: 'Contratos, licenças e decisões',
        texto: 'Processos administrativos com percurso próprio: quem decide, o que fica registado, que documentos valem e onde estão.',
        icone: Landmark,
        exemplos: ['Decisões', 'Documentos', 'Prazo legal'],
    },
    {
        estacao: '04',
        modulo: 'Obras',
        titulo: 'A obra em execução, folha a folha',
        texto: 'Equipa, actividades, medições e curva de execução. Física e lado a lado, sem sair da mesma vista.',
        icone: HardHat,
        exemplos: ['Equipa', 'Medições', 'Execução física'],
    },
    {
        estacao: '05',
        modulo: 'Finanças',
        titulo: 'Cada Kz com origem e aprovação',
        texto: 'Despesas por categoria, por obra, com o caminho da aprovação desenhado. A execução financeira lê-se sem pedir relatório a ninguém.',
        icone: Banknote,
        exemplos: ['Orçamento', 'Aprovação', 'Execução'],
    },
];

const PERFIS = [
    {
        perfil: 'Administrador/Proprietário',
        alcance: 'Tudo, sempre',
        nota: 'Configura o sistema, vê todos os projectos e controla o que cada perfil pode fazer.',
    },
    {
        perfil: 'Gestor',
        alcance: 'Projectos atribuídos',
        nota: 'Conduz os projectos de que é responsável, com a equipa e as finanças à vista.',
    },
    {
        perfil: 'Colaborador/Técnico',
        alcance: 'Projectos atribuídos',
        nota: 'Executa as actividades e tarefas que lhe são delegateadas; regista o que faz.',
    },
    {
        perfil: 'Fiscal/Responsável de Obra',
        alcance: 'Projectos atribuídos',
        nota: 'Verifica medições e custos no terreno, e assina o que vê.',
    },
    {
        perfil: 'Consulta',
        alcance: 'Leitura',
        nota: 'Entra para ver. Sem editar, sem decidir.',
    },
];

const PROBLEMA = [
    {
        titulo: 'A informação vive em sítios diferentes',
        texto: 'A agenda num calendário, os contactos num telemóvel, os contratos numa pasta, as despesas numa folha de cálculo. Nada conversa com nada.',
    },
    {
        titulo: 'O estado real está na cabeça de cada um',
        texto: 'A obra está parada, mas o relatório diz que vai bem. A despesa foi aprovada, mas ninguém sabe por quem. O prazo corre e a data nunca é a mesma.',
    },
    {
        titulo: 'A direcção decide sem números do momento',
        texto: 'Quando a informação existe, chega tarde. Executa-se por cima de estimativas em vez de decisões com dados à frente.',
    },
];

const INTEGRACOES = [
    { nome: 'Google Drive', estado: 'bremente disponível' },
    { nome: 'Google Calendar', estado: 'bremente disponível' },
    { nome: 'WhatsApp', estado: 'bremente disponível' },
    { nome: 'E-mail', estado: 'bremente disponível' },
    { nome: 'Inteligência artificial', estado: 'bremente disponível' },
];

export default function Inicio() {
    return (
        <LayoutPublico>
            <Head title="SGO — Gestão de projectos, obras e trabalho">
                <meta
                    name="description"
                    content="O SGO reúne agenda, tarefas, projectos administrativos, obras e finanças numa única fonte de informação. Gestão de projectos, obras e trabalho."
                />
            </Head>

            <div className="space-y-24 sm:space-y-32">
                <Capa />
                <Problema />
                <Modulos />
                <Perfis />
                <Integracoes />
                <Fecho />
            </div>
        </LayoutPublico>
    );
}

function Capa() {
    return (
        <section className="relative overflow-hidden border border-graphite-12 bg-paper-raised">
            <div aria-hidden className="malha-prancha pointer-events-none absolute inset-0" />

            <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
                <div className="space-y-7">
                    <div className="flex flex-wrap items-center gap-2">
                        <Selo tinta="carimbo" traco="firme">
                            Pré-construção
                        </Selo>
                        <Selo tinta="grafite" traco="leve">
                            Demonstração
                        </Selo>
                    </div>

                    <h1 className="text-4xl leading-[1.03] font-semibold tracking-tight text-graphite sm:text-5xl">
                        Gestão de projectos, obras e trabalho numa só fonte de informação.
                    </h1>

                    <p className="max-w-xl text-lg leading-relaxed text-graphite-64">
                        O SGO junta agenda, tarefas, projectos administrativos, obras e finanças
                        numa única folha de trabalho. Cada registo tem dono, prazo, estado e número
                        — e o estado lê-se pelo peso do traço, não por mais uma cor.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                        <Botao asChild tamanho="lg" variante="primario" traco="firme">
                            <Link href={route('login')}>
                                Entrar na demonstração
                                <ArrowRight aria-hidden />
                            </Link>
                        </Botao>

                        <Botao asChild tamanho="lg" variante="contorno">
                            <Link href={route('funcionalidades')}>Ver funcionalidades</Link>
                        </Botao>
                    </div>

                    <p className="anotacao max-w-lg normal-case">
                        Entrar é real: a sessão é uma sessão. Os dados são de exemplo e vivem no
                        seu navegador — nada é gravado.
                    </p>
                </div>

                <div className="relative flex flex-col justify-between gap-6 border border-graphite-20 bg-paper p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="cota">Folha de rosto</p>
                            <p className="mt-1 font-mono text-sm text-graphite">
                                Sistema de Gestão de Obras e Projectos
                            </p>
                        </div>
                        <Carimbo
                            identidade="SGO · PRÉ-CONSTRUÇÃO"
                            linhas={[
                                { chave: 'Data', valor: dataExtenso(new Date()) },
                                { chave: 'Rev.', valor: 'C' },
                            ]}
                        />
                    </div>

                    <div aria-hidden className="space-y-2">
                        <div className="h-px w-full bg-graphite-20" />
                        <div className="h-px w-4/5 bg-graphite-12" />
                        <div className="h-px w-11/12 bg-graphite-12" />
                        <div className="h-px w-2/3 bg-graphite-12" />
                    </div>

                    <div aria-hidden className="hachura-45 h-10 border-y border-graphite-12" />

                    <BlocoTitulo
                        folha="00 / 00"
                        escala="1:1"
                        revisao="C"
                        emitidoEm={dataExtenso(new Date())}
                    />
                </div>
            </div>
        </section>
    );
}

function Problema() {
    return (
        <section aria-labelledby="problema" className="space-y-8">
            <div className="max-w-2xl space-y-3">
                <p className="cota">01 · O ponto de partida</p>
                <h2
                    id="problema"
                    className="text-3xl leading-tight font-semibold tracking-tight text-graphite"
                >
                    O trabalho cresce. A folha de cálculo, não.
                </h2>
                <p className="text-graphite-64">
                    Quem gere obras e projectos administrativos acaba por gerir também a memória da
                    informação: onde está, quem a tem, em que versão. O SGO nasce para acabar com
                    essa camada.
                </p>
            </div>

            <div className="grid gap-px border border-graphite-12 bg-graphite-12 md:grid-cols-3">
                {PROBLEMA.map((problema) => (
                    <div key={problema.titulo} className="bg-paper p-6">
                        <h3 className="font-semibold text-graphite">{problema.titulo}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-graphite-64">
                            {problema.texto}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function Modulos() {
    return (
        <section aria-labelledby="modulos" className="space-y-8">
            <div className="max-w-2xl space-y-3">
                <p className="cota">02 · A linha</p>
                <h2
                    id="modulos"
                    className="text-3xl leading-tight font-semibold tracking-tight text-graphite"
                >
                    Cinco estações, um percurso só
                </h2>
                <p className="text-graphite-64">
                    Os módulos partilham o mesmo registo e o mesmo estado. Uma despesa sabe a que
                    obra pertence; uma tarefa sabe a que prazo responde.
                </p>
            </div>

            <ol className="relative space-y-px bg-graphite-12">
                {ESTACOES.map((estacao) => {
                    const Icone = estacao.icone;

                    return (
                        <li key={estacao.modulo} className="relative bg-paper">
                            <div className="grid gap-4 p-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6 sm:p-6">
                                <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                                    <span
                                        aria-hidden
                                        className="grid size-9 place-items-center border border-graphite bg-amber font-mono text-xs font-bold text-graphite"
                                    >
                                        {estacao.estacao}
                                    </span>
                                    <span aria-hidden className="hidden h-8 w-px bg-graphite-20 sm:block" />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Icone aria-hidden className="size-4 text-graphite-48" />
                                        <p className="cota">{estacao.modulo}</p>
                                    </div>

                                    <h3 className="text-xl font-semibold text-graphite">
                                        {estacao.titulo}
                                    </h3>

                                    <p className="max-w-2xl text-sm leading-relaxed text-graphite-64">
                                        {estacao.texto}
                                    </p>

                                    <ul className="flex flex-wrap gap-2 pt-1">
                                        {estacao.exemplos.map((exemplo) => (
                                            <li key={exemplo}>
                                                <Selo tinta="grafite" traco="leve">
                                                    {exemplo}
                                                </Selo>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}

function Perfis() {
    return (
        <section aria-labelledby="perfis" className="space-y-8">
            <div className="max-w-2xl space-y-3">
                <p className="cota">03 · Quem entra</p>
                <h2
                    id="perfis"
                    className="text-3xl leading-tight font-semibold tracking-tight text-graphite"
                >
                    Cinco perfis, cinco alcances
                </h2>
                <p className="text-graphite-64">
                    No login escolhe-se com que identidade se entra. O selector «Ver como» mostra
                    o que cada perfil vê — sem mudar a sessão.
                </p>
            </div>

            <div className="overflow-hidden border border-graphite-12">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b border-graphite-20 bg-paper-sunken">
                            <th scope="col" className="cota px-4 py-3 font-medium">
                                Perfil
                            </th>
                            <th scope="col" className="cota px-4 py-3 font-medium">
                                Alcance
                            </th>
                            <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">
                                <span className="cota">O que faz</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {PERFIS.map((perfil, indice) => (
                            <tr
                                key={perfil.perfil}
                                className={cn(
                                    'border-b border-graphite-08 last:border-b-0',
                                    indice % 2 === 1 && 'bg-paper-sunken/50',
                                )}
                            >
                                <th
                                    scope="row"
                                    className="px-4 py-3 text-left font-medium text-graphite"
                                >
                                    <span className="flex items-center gap-2">
                                        <span
                                            aria-hidden
                                            className="font-mono text-2xs text-graphite-32"
                                        >
                                            0{indice + 1}
                                        </span>
                                        {perfil.perfil}
                                    </span>
                                </th>
                                <td className="px-4 py-3 text-graphite-64">{perfil.alcance}</td>
                                <td className="hidden px-4 py-3 text-graphite-64 sm:table-cell">
                                    {perfil.nota}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function Integracoes() {
    return (
        <section aria-labelledby="integracoes" className="space-y-8">
            <div className="max-w-2xl space-y-3">
                <p className="cota">04 · Em folha separada</p>
                <h2
                    id="integracoes"
                    className="text-3xl leading-tight font-semibold tracking-tight text-graphite"
                >
                    Integrações para depois
                </h2>
                <p className="text-graphite-64">
                    O SGO é a fonte de informação. As pontes para o resto do mundo estão
                    desenhadas, mas ainda não estão activas.
                </p>
            </div>

            <ul className="grid gap-px border border-graphite-12 bg-graphite-12 sm:grid-cols-2 lg:grid-cols-3">
                {INTEGRACOES.map((integracao) => (
                    <li key={integracao.nome} className="bg-paper p-5">
                        <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2 font-medium text-graphite">
                                <Briefcase aria-hidden className="size-4 text-graphite-32" />
                                {integracao.nome}
                            </span>
                            <Selo tinta="grafite" traco="pontilhado">
                                {integracao.estado}
                            </Selo>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function Fecho() {
    return (
        <section className="relative overflow-hidden border border-graphite-20 bg-paper-raised p-6 sm:p-10">
            <div aria-hidden className="hachura-90 pointer-events-none absolute inset-x-0 top-0 h-2" />

            <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
                <div className="max-w-xl space-y-4">
                    <p className="cota">05 · Continuar</p>
                    <h2 className="text-3xl leading-tight font-semibold tracking-tight text-graphite">
                        A folha de rosto está pronta. Falta a obra.
                    </h2>
                    <p className="text-graphite-64">
                        Entra na demonstração com um dos perfis e vê a mesma informação com cinco
                        alcances diferentes.
                    </p>
                </div>

                <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                    <Botao asChild tamanho="lg" variante="primario" traco="firme">
                        <Link href={route('login')}>
                            Entrar
                            <ArrowRight aria-hidden />
                        </Link>
                    </Botao>
                    <Carimbo
                        identidade="SGO · DEMONSTRAÇÃO"
                        linhas={[{ chave: 'Estado', valor: 'Aberto' }]}
                        rodado={-3}
                    />
                </div>
            </div>
        </section>
    );
}

import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';

import { LayoutPublico } from '@/Layouts/LayoutPublico';
import { BlocoTitulo } from '@/Components/brand/bloco-titulo';
import { Botao } from '@/Components/ui/button';
import { Selo } from '@/Components/ui/badge';
import { dataExtenso } from '@/lib/format';

/**
 * `/funcionalidades` — o índice de folhas. Cada módulo é uma folha do rolo,
 * com o que entra nela e o que sai dela.
 */

const FOLHAS = [
    {
        numero: '01',
        modulo: 'Agenda',
        resumo: 'O dia e a obra lado a lado, no mesmo calendário.',
        entras: ['Compromissos pessoais', 'Compromissos profissionais', 'Visitas de obra'],
        saidas: ['Conflitos assinalados', 'Dia com Agenda'],
        estados: ['agendado', 'confirmado', 'concluido'],
    },
    {
        numero: '02',
        modulo: 'Tarefas',
        resumo: 'O que ficou por fazer, com dono e prazo.',
        entras: ['Tarefa com responsável', 'Prioridade', 'Prazo e data-limite'],
        saidas: ['Tarefas concluídas', 'Tarefas atrasadas'],
        estados: ['pendente', 'em_curso', 'concluida', 'atrasada'],
    },
    {
        numero: '03',
        modulo: 'Projectos administrativos',
        resumo: 'Contratos, licenças e decisões com percurso registado.',
        entras: ['Contrato', 'Licença', 'Decisão administrativa'],
        saidas: ['Decisões registadas', 'Documentos associados'],
        estados: ['em_execucao', 'concluido', 'excepcional'],
    },
    {
        numero: '04',
        modulo: 'Obras',
        resumo: 'Equipa, actividades, medições e a curva de execução.',
        entras: ['Projecto de obra', 'Equipa', 'Actividades', 'Medições', 'Curva de execução'],
        saidas: ['Execução física e financeira', 'Histórico de alterações'],
        estados: ['planeamento', 'em_execucao', 'concluido', 'atrasado'],
    },
    {
        numero: '05',
        modulo: 'Finanças',
        resumo: 'Cada Kz com origem, categoria e caminho de aprovação.',
        entras: ['Orçamento', 'Despesa', 'Aprovação', 'Comprovativos'],
        saidas: ['Execução financeira', 'Saldos por obra'],
        estados: ['pendente', 'aprovada', 'rejeitada'],
    },
];

const REGRAS = [
    {
        titulo: 'Um estado, uma leitura',
        texto: 'O estado de um registo é o mesmo em toda a aplicação: concluído é riscado, atrasado é traçado a lápis vermelho, e não existe uma cor nova a meio da semana.',
    },
    {
        titulo: 'Permissões que seguem o registo',
        texto: 'Quem tem acesso a um projecto tem acesso às tarefas, actividades, despesas e documentos desse projecto. Não se configura ao acaso.',
    },
    {
        titulo: 'Histórico à vista',
        texto: 'Estados, valores e decisões ficam registados com autor e data. A pergunta «quem mudou isto e quando?» tem sempre resposta.',
    },
    {
        titulo: 'Números que se calculam sozinhos',
        texto: 'Execução física e financeira, saldo e desvios não se escrevem à mão: derivam dos registos que já existem.',
    },
];

const LIMITES = [
    'Sem acesso directo à base de dados: a aplicação é a única porta de entrada.',
    'Sem e-mail automático: os avisos aparecem na aplicação, não numa caixa de correio esquecida.',
    'Sem edição em massa sem registo: quem corrigiu o quê fica escrito.',
    'Sem Centres de custo inventados: o dinheiro segue a obra a que pertence.',
];

export default function Funcionalidades() {
    return (
        <LayoutPublico>
            <Head title="Funcionalidades — SGO">
                <meta
                    name="description"
                    content="Agenda, tarefas, projectos administrativos, obras e finanças. As cinco folhas do SGO, com o que cada uma guarda e como o estado se lê."
                />
            </Head>

            <div className="space-y-24 sm:space-y-32">
                <header className="space-y-5">
                    <p className="cota">Índice de folhas</p>
                    <h1 className="max-w-3xl text-4xl leading-[1.05] font-semibold tracking-tight text-graphite">
                        Cinco folhas, um único rolo
                    </h1>
                    <p className="max-w-2xl text-lg text-graphite-64">
                        Cada módulo tem o que lhe compete e nada mais. O que os liga é o mesmo
                        registo, o mesmo estado e a mesma pessoa responsável.
                    </p>

                    <BlocoTitulo
                        folha="01 / 05"
                        escala="1:1"
                        revisao="C"
                        emitidoEm={dataExtenso(new Date())}
                    />
                </header>

                <ol className="space-y-px bg-graphite-12">
                    {FOLHAS.map((folha) => (
                        <li key={folha.numero} className="bg-paper">
                            <article className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span
                                            aria-hidden
                                            className="grid size-9 place-items-center border border-graphite bg-amber font-mono text-xs font-bold text-graphite"
                                        >
                                            {folha.numero}
                                        </span>
                                        <h2 className="text-xl font-semibold text-graphite">
                                            {folha.modulo}
                                        </h2>
                                    </div>

                                    <p className="text-graphite-64">{folha.resumo}</p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Coluna etiqueta="Guarda" linhas={folha.entras} />
                                    <Coluna etiqueta="Devolve" linhas={folha.saidas} />

                                    <div className="sm:col-span-2">
                                        <p className="cota mb-1.5">Estados possíveis</p>
                                        <ul className="flex flex-wrap gap-1.5">
                                            {folha.estados.map((estado) => (
                                                <li key={estado}>
                                                    <Selo tinta="grafite" traco="leve">
                                                        {estado}
                                                    </Selo>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </article>
                        </li>
                    ))}
                </ol>

                <section aria-labelledby="regras" className="space-y-6">
                    <div className="max-w-2xl space-y-2">
                        <p className="cota">Notas de execução</p>
                        <h2
                            id="regras"
                            className="text-2xl font-semibold tracking-tight text-graphite"
                        >
                            Quatro regras que valem para todas as folhas
                        </h2>
                    </div>

                    <ul className="grid gap-px border border-graphite-12 bg-graphite-12 sm:grid-cols-2">
                        {REGRAS.map((regra) => (
                            <li key={regra.titulo} className="bg-paper p-5">
                                <h3 className="font-semibold text-graphite">{regra.titulo}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-graphite-64">
                                    {regra.texto}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>

                <section aria-labelledby="limites" className="space-y-4 border border-graphite-20 bg-paper-raised p-5 sm:p-7">
                    <div className="max-w-2xl space-y-2">
                        <p className="cota">Limites assumidos</p>
                        <h2
                            id="limites"
                            className="text-2xl font-semibold tracking-tight text-graphite"
                        >
                            O que o SGO não faz
                        </h2>
                    </div>

                    <ul className="space-y-2">
                        {LIMITES.map((limite) => (
                            <li
                                key={limite}
                                className="flex gap-3 border-l-2 border-graphite-32 pl-3 text-sm text-graphite-64"
                            >
                                <span aria-hidden className="font-mono text-2xs text-graphite-32">
                                    —
                                </span>
                                {limite}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="flex flex-wrap items-center justify-between gap-6 border-t border-graphite-12 pt-8">
                    <p className="max-w-md text-graphite-64">
                        A folha está escrita. Falta mostrar o que ela faz com os seus dados.
                    </p>
                    <Botao asChild variante="primario" traco="firme">
                        <Link href={route('login')}>
                            Abrir a demonstração
                            <ArrowRight aria-hidden />
                        </Link>
                    </Botao>
                </section>
            </div>
        </LayoutPublico>
    );
}

function Coluna({ etiqueta, linhas }: { etiqueta: string; linhas: string[] }) {
    return (
        <div>
            <p className="cota mb-1.5">{etiqueta}</p>
            <ul className="space-y-1">
                {linhas.map((linha) => (
                    <li
                        key={linha}
                        className={cn('border-b border-graphite-08 pb-1 text-sm text-graphite-64')}
                    >
                        {linha}
                    </li>
                ))}
            </ul>
        </div>
    );
}

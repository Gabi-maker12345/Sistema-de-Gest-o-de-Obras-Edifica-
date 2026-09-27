import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { dataExtenso } from '@/lib/format';

import { LayoutPublico } from '@/Layouts/LayoutPublico';
import { BlocoTitulo } from '@/Components/brand/bloco-titulo';
import { Carimbo } from '@/Components/brand/carimbo';
import { Botao } from '@/Components/ui/button';
import { Selo } from '@/Components/ui/badge';

/**
 * `/sobre` — quem assina a folha. A resposta curta para quem chega do motor de
 * busca: o que é o SGO, quem o faz e porque é que a demonstração não grava nada.
 */

const PRINCIPIOS = [
    {
        numero: '01',
        titulo: 'Uma fonte de informação',
        texto: 'A agenda, as tarefas, os projectos administrativos, as obras e as finanças vivem no mesmo sítio. Não há duas versões da verdade.',
    },
    {
        numero: '02',
        titulo: 'O estado é lido, não adivinhado',
        texto: 'Concluído fica riscado, atrasado fica a lápis vermelho, pendente fica a cheio. A leitura não depende de aprender uma tabela de cores.',
    },
    {
        numero: '03',
        titulo: 'O registo escreve o que aconteceu',
        texto: 'Quem mudou o quê, quando e com que valor. Um sistema de gestão que não explica as suas alterações não serve para gerir.',
    },
    {
        numero: '04',
        titulo: 'Menos campos, menos ruído',
        texto: 'Cada registo pede apenas o que precisa. A folha fica limpa porque tem de ficar — não por estilo.',
    },
];

const O_QUE_NAO_E = [
    'Não é um CRM de vendas.',
    'Não é um sistema de contabilidade certificados.',
    'Não é um ERP com três letras e um logótipo.',
    'Não é uma caixa de correio com notificações.',
];

const DECISOR = [
    {
        pergunta: 'Precisa de ver o dinheiro da obra junto do que já está construído?',
        resposta: 'Financeiro e físico na mesma vista, com a mesma data.',
    },
    {
        pergunta: 'Precisa de saber quem pode mudar o quê?',
        resposta: 'Cinco perfis, permissões que seguem o registo, não a tela.',
    },
    {
        pergunta: 'Precisa de justificar uma decisão daqui a seis meses?',
        resposta: 'Histórico com autor, data e valor de cada alteração.',
    },
];

export default function Sobre() {
    return (
        <LayoutPublico>
            <Head title="Sobre — SGO">
                <meta
                    name="description"
                    content="O que é o SGO, porque existe e que princípios guia o sistema de gestão de projectos, obras e trabalho."
                />
            </Head>

            <div className="space-y-24 sm:space-y-32">
                <header className="space-y-5">
                    <p className="cota">Sobre a folha</p>
                    <h1 className="max-w-3xl text-4xl leading-[1.05] font-semibold tracking-tight text-graphite">
                        Um sistema de gestão desenhado por quem assina a folha
                    </h1>
                    <p className="max-w-2xl text-lg text-graphite-64">
                        O SGO é uma plataforma pessoal de gestão de projectos, obras e trabalho. Não
                        substitui a equipa que executa: substitui a papelada que a equipa perde tempo
                        a manter.
                    </p>

                    <BlocoTitulo
                        folha="00 / 00"
                        escala="1:1"
                        revisao="C"
                        emitidoEm={dataExtenso(new Date())}
                    />
                </header>

                <section className="relative overflow-hidden border border-graphite-12 bg-paper-raised p-6 sm:p-10">
                    <div aria-hidden className="malha-prancha pointer-events-none absolute inset-0" />
                    <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                        <div className="space-y-4">
                            <p className="cota">A origem</p>
                            <p className="text-xl leading-relaxed font-medium text-graphite">
                                Quem gere obra em Angola já vive isto: a informação existe, mas está
                                espalhada por telemóveis, e-mails e pastas partilhadas. O que falta
                                nunca é o documento. É o registo.
                            </p>
                            <p className="max-w-2xl leading-relaxed text-graphite-64">
                                Por isso o SGO foi montado a partir de um princípio só: cada
                                registo — uma tarefa, uma actividade, uma despesa, uma decisão — é
                                uma folha com dono, prazo, estado e histórico. Quando tudo o que
                                tem estado vive no mesmo sítio, a gestão deixa de ser perseguir
                                informação e passa a ser decidir.
                            </p>
                            <p className="leading-relaxed text-graphite-64">
                                A interface segue a mesma lógica. A prancha técnica é o meio
                                natural de quem trabalha com prazos e medições, e a direcção
                                visual é deliberadamente monocromática: o peso do traço diz o
                                estado, para que a cor deixe de ser mais um ruído.
                            </p>
                        </div>

                        <div className="flex items-start justify-end">
                            <Carimbo
                                identidade="SGO · LUANDA"
                                linhas={[
                                    { chave: 'Autor', valor: 'Equipa SGO' },
                                    { chave: 'Rev.', valor: 'C' },
                                    { chave: 'Estado', valor: 'Pré-construção' },
                                ]}
                                rodape="Uso interno"
                            />
                        </div>
                    </div>
                </section>

                <section aria-labelledby="principios" className="space-y-6">
                    <div className="max-w-2xl space-y-2">
                        <p className="cota">Princípios</p>
                        <h2
                            id="principios"
                            className="text-3xl leading-tight font-semibold tracking-tight text-graphite"
                        >
                            Quatro decisões que explicam o resto
                        </h2>
                    </div>

                    <ol className="grid gap-px border border-graphite-12 bg-graphite-12 sm:grid-cols-2">
                        {PRINCIPIOS.map((principio) => (
                            <li key={principio.numero} className="bg-paper p-6">
                                <div className="flex items-start gap-3">
                                    <span
                                        aria-hidden
                                        className="mt-0.5 font-mono text-2xs text-graphite-32"
                                    >
                                        {principio.numero}
                                    </span>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-graphite">
                                            {principio.titulo}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-graphite-64">
                                            {principio.texto}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="grid gap-8 lg:grid-cols-2">
                    <div className="space-y-4">
                        <p className="cota">Limites</p>
                        <h2 className="text-2xl font-semibold tracking-tight text-graphite">
                            O que o SGO não tenta ser
                        </h2>
                        <ul className="space-y-2">
                            {O_QUE_NAO_E.map((item) => (
                                <li
                                    key={item}
                                    className="flex gap-3 border-b border-graphite-08 pb-2 text-graphite-64"
                                >
                                    <span aria-hidden className="font-mono text-2xs text-graphite-32">
                                        ✕
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <p className="cota">Ponto de decisão</p>
                        <h2 className="text-2xl font-semibold tracking-tight text-graphite">
                            Deve entrar com o seu registo
                        </h2>
                        <ul className="space-y-4">
                            {DECISOR.map((item) => (
                                <li key={item.pergunta} className="space-y-1.5">
                                    <p className="flex gap-2 font-medium text-graphite">
                                        <span aria-hidden className="text-graphite-32">
                                            ?
                                        </span>
                                        {item.pergunta}
                                    </p>
                                    <p className="pl-5 text-sm text-graphite-64">{item.resposta}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="space-y-4 border border-graphite-20 bg-paper-raised p-5 sm:p-7">
                    <div className="flex flex-wrap items-center gap-2">
                        <Selo tinta="carimbo" traco="firme">
                            Demonstração
                        </Selo>
                        <Selo tinta="grafite" traco="pontilhado">
                            Sem persistência
                        </Selo>
                    </div>
                    <p className="max-w-2xl leading-relaxed text-graphite-64">
                        Esta instalação é uma demonstração. A autenticação é real e a sessão é real;
                        os dados de negócio são de exemplo e vivem apenas no seu navegador durante
                        a sessão. Nada é gravado em base de dados, nada é enviado para o exterior.
                    </p>

                    <Botao asChild variante="primario" traco="firme" className="mt-2">
                        <Link href={route('login')}>
                            Ver a demonstração
                            <ArrowRight aria-hidden />
                        </Link>
                    </Botao>
                </section>
            </div>
        </LayoutPublico>
    );
}

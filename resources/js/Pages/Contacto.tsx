import { Head, useForm, usePage } from '@inertiajs/react';
import { Loader2, Send } from 'lucide-react';
import { type FormEvent } from 'react';

import { dataExtenso, dataHora } from '@/lib/format';

import { LayoutPublico } from '@/Layouts/LayoutPublico';
import { BlocoTitulo } from '@/Components/brand/bloco-titulo';
import { Carimbo } from '@/Components/brand/carimbo';
import { Botao } from '@/Components/ui/button';
import { Campo, ErroDeFormulario } from '@/Components/ui/field';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Selo } from '@/Components/ui/badge';
import { Textarea } from '@/Components/ui/textarea';

/**
 * `/contacto` — a folha de contacto. Sem integrações activas (D1): o envio é
 * validado no servidor e confirmado, sem sair da demonstração.
 */

interface CamposContacto {
    nome: string;
    email: string;
    assunto: string;
    mensagem: string;
}

const MOTIVOS = [
    {
        motivo: 'Como funciona',
        texto: 'Saber mais sobre a agenda, as tarefas ou os projectos administrativos.',
    },
    {
        motivo: 'Obras e equipas',
        texto: 'Equipa, actividades, medições e curva de execução.',
    },
    {
        motivo: 'Finanças',
        texto: 'Orçamentos, despesas, aprovações e execução financeira.',
    },
];

export default function Contacto() {
    const formulario = useForm<CamposContacto>({
        nome: '',
        email: '',
        assunto: '',
        mensagem: '',
    });

    const { contacto, contacto_aviso: aviso } = usePage().props as {
        contacto?: { estado: string; nome: string };
        contacto_aviso?: string;
    };

    const submeter = (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();

        // A folha é validada no servidor; se passar, fica limpa para a próxima.
        formulario.post(route('contacto.store'), {
            onSuccess: () => formulario.reset(),
        });
    };

    const temErros = Object.keys(formulario.errors).length > 0;

    return (
        <LayoutPublico>
            <Head title="Contacto — SGO">
                <meta
                    name="description"
                    content="Contacte a equipa do SGO sobre gestão de projectos, obras e trabalho. Luanda, Angola."
                />
            </Head>

            <div className="space-y-14 sm:space-y-16">
                <header className="space-y-5">
                    <p className="cota">Folha de contacto</p>
                    <h1 className="max-w-2xl text-4xl leading-[1.05] font-semibold tracking-tight text-graphite">
                        Escreva. A folha fica registada.
                    </h1>
                    <p className="max-w-2xl text-lg text-graphite-64">
                        Diga o que precisa. Esta folha é lida por quem assina o SGO, e a resposta
                        vai para o e-mail que indicar.
                    </p>

                    <BlocoTitulo
                        folha="00 / 00"
                        escala="1:1"
                        revisao="C"
                        emitidoEm={dataExtenso(new Date())}
                    />
                </header>

                <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
                    <section aria-labelledby="formulario" className="space-y-5">
                        <h2 id="formulario" className="cota">
                            Escrever
                        </h2>

                        {contacto?.estado === 'recebido' && (
                            <div className="space-y-2 border-2 border-stamp bg-paper p-4">
                                <p className="font-semibold text-graphite">
                                    Mensagem registada, {contacto.nome}.
                                </p>
                                <p className="text-sm text-graphite-64">
                                    {aviso ??
                                        'A folha foi validada. Numa instalação real seguiria para a equipa.'}
                                </p>
                            </div>
                        )}

                        <form onSubmit={submeter} noValidate className="space-y-5">
                            <ErroDeFormulario>
                                {temErros
                                    ? 'A folha tem campos por corrigir. Revise as anotações abaixo.'
                                    : null}
                            </ErroDeFormulario>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <Campo
                                    rotulo="Nome"
                                    htmlFor="nome"
                                    obrigatorio
                                    erro={formulario.errors.nome}
                                >
                                    <Input
                                        id="nome"
                                        name="nome"
                                        autoComplete="name"
                                        required
                                        value={formulario.data.nome}
                                        onChange={(e) => formulario.setData('nome', e.currentTarget.value)}
                                    />
                                </Campo>

                                <Campo
                                    rotulo="E-mail"
                                    htmlFor="email"
                                    obrigatorio
                                    erro={formulario.errors.email}
                                >
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={formulario.data.email}
                                        onChange={(e) => formulario.setData('email', e.currentTarget.value)}
                                    />
                                </Campo>
                            </div>

                            <Campo
                                rotulo="Assunto"
                                htmlFor="assunto"
                                obrigatorio
                                erro={formulario.errors.assunto}
                            >
                                <Input
                                    id="assunto"
                                    name="assunto"
                                    required
                                    value={formulario.data.assunto}
                                    onChange={(e) => formulario.setData('assunto', e.currentTarget.value)}
                                />
                            </Campo>

                            <Campo
                                rotulo="Mensagem"
                                htmlFor="mensagem"
                                obrigatorio
                                erro={formulario.errors.mensagem}
                                ajuda="Pelo menos 20 caracteres. O contexto ajuda a responder à primeira."
                            >
                                <Textarea
                                    id="mensagem"
                                    name="mensagem"
                                    rows={7}
                                    required
                                    value={formulario.data.mensagem}
                                    onChange={(e) => formulario.setData('mensagem', e.currentTarget.value)}
                                />
                            </Campo>

                            <div className="flex flex-wrap items-center gap-4">
                                <Botao
                                    type="submit"
                                    variante="primario"
                                    traco="firme"
                                    disabled={formulario.processing}
                                >
                                    {formulario.processing ? (
                                        <>
                                            <Loader2 aria-hidden className="animate-spin" />
                                            A registar
                                        </>
                                    ) : (
                                        <>
                                            <Send aria-hidden />
                                            Registar mensagem
                                        </>
                                    )}
                                </Botao>

                                <p className="anotacao normal-case">
                                    Registada em {dataHora(new Date())} — hora local.
                                </p>
                            </div>
                        </form>
                    </section>

                    <aside className="space-y-6">
                        <section className="space-y-3">
                            <h2 className="cota">Motivos</h2>
                            <ul className="space-y-3">
                                {MOTIVOS.map((item) => (
                                    <li key={item.motivo} className="space-y-1">
                                        <p className="font-medium text-graphite">{item.motivo}</p>
                                        <p className="text-sm text-graphite-64">{item.texto}</p>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="space-y-2 border-t border-graphite-12 pt-4">
                            <h2 className="cota">Onde estamos</h2>
                            <p className="text-sm text-graphite-64">Luanda, Angola</p>
                            <p className="anotacao normal-case">
                                Fuso horário de Angola (WAT). A equipa responde em horário de
                                expediente.
                            </p>
                            <div className="pt-2">
                                <Carimbo
                                    identidade="SGO · LUANDA"
                                    linhas={[{ chave: 'Data', valor: dataExtenso(new Date()) }]}
                                />
                            </div>
                        </section>

                        <section className="space-y-2 border-t border-graphite-12 pt-4">
                            <h2 className="cota">Canais</h2>
                            <div className="flex flex-wrap gap-2">
                                <Selo tinta="carimbo" traco="firme">
                                    E-mail
                                </Selo>
                                <Selo tinta="grafite" traco="pontilhado">
                                    WhatsApp · breve
                                </Selo>
                            </div>
                            <p className="anotacao normal-case">
                                O canal de WhatsApp ainda não está integrado. O e-mail é a via
                                directa.
                            </p>
                        </section>
                    </aside>
                </div>
            </div>
        </LayoutPublico>
    );
}

import { Head, Link, useForm } from '@inertiajs/react';
import { CircleAlert, Loader2 } from 'lucide-react';
import { type FormEvent } from 'react';

import { LayoutAuth } from '@/Layouts/LayoutAuth';

import { Carimbo } from '@/Components/brand/carimbo';
import { Botao } from '@/Components/ui/button';
import { Campo, ErroDeFormulario } from '@/Components/ui/field';
import { Input } from '@/Components/ui/input';
import { Selo } from '@/Components/ui/badge';
import { toast } from '@/Components/ui/toaster';

/**
 * `/registar` — criar conta. A sessão é real e o utilizador fica autenticado
 * no fim (D5); o `perfil` nasce em Tecnico e quem o muda é um administrador,
 * na aba Utilizadores, não este ecrã.
 */
export default function Registar() {
    const formulario = useForm({
        name: '',
        email: '',
        telefone: '',
        password: '',
        password_confirmation: '',
    });

    const submeter = (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();

        formulario.post(route('register'), {
            onFinish: () => formulario.reset('password', 'password_confirmation'),
            onSuccess: () => {
                toast.success(`Conta criada. Bem-vindo ao SGO, ${formulario.data.name}.`);
            },
        });
    };

    return (
        <LayoutAuth>
            <Head title="Criar conta">
                <meta
                    name="description"
                    content="Criar uma conta no SGO. O perfil é atribuído depois por um administrador."
                />
            </Head>

            <div className="space-y-6">
                <header className="space-y-3">
                    <p className="cota">Folha 02 · Registo</p>
                    <h2 className="text-2xl font-semibold tracking-tight text-graphite">
                        Criar conta
                    </h2>
                    <p className="text-sm text-graphite-64">
                        A conta abre sessão no fim. O perfil e os projectos são atribuídos
                        depois, por quem administra o SGO.
                    </p>
                </header>

                <div className="hachura-90 h-4 border-y border-graphite-12" aria-hidden />

                <form onSubmit={submeter} className="space-y-4" noValidate>
                    <ErroDeFormulario>{formulario.errors.email ?? formulario.errors.password}</ErroDeFormulario>

                    <Campo rotulo="Nome" htmlFor="name" obrigatorio erro={formulario.errors.name}>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            autoFocus
                            required
                            value={formulario.data.name}
                            onChange={(e) => formulario.setData('name', e.currentTarget.value)}
                            placeholder="Isabel Correia"
                        />
                    </Campo>

                    <Campo rotulo="E-mail" htmlFor="email" obrigatorio erro={formulario.errors.email}>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="username"
                            required
                            value={formulario.data.email}
                            onChange={(e) => formulario.setData('email', e.currentTarget.value)}
                            placeholder="isabel.correia@sgo.ao"
                        />
                    </Campo>

                    <Campo
                        rotulo="Telefone"
                        htmlFor="telefone"
                        ajuda="Opcional. Útil para quem faz registo de campo no terreno."
                        erro={formulario.errors.telefone}
                    >
                        <Input
                            id="telefone"
                            name="telefone"
                            type="tel"
                            autoComplete="tel"
                            value={formulario.data.telefone}
                            onChange={(e) => formulario.setData('telefone', e.currentTarget.value)}
                            placeholder="+244 9XX XXX XXX"
                        />
                    </Campo>

                    <Campo
                        rotulo="Palavra-passe"
                        htmlFor="password"
                        obrigatorio
                        ajuda="Mínimo de 8 caracteres."
                        erro={formulario.errors.password}
                    >
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={formulario.data.password}
                            onChange={(e) => formulario.setData('password', e.currentTarget.value)}
                            placeholder="••••••••"
                        />
                    </Campo>

                    <Campo
                        rotulo="Confirmar palavra-passe"
                        htmlFor="password_confirmation"
                        obrigatorio
                        erro={formulario.errors.password_confirmation}
                    >
                        <Input
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={formulario.data.password_confirmation}
                            onChange={(e) =>
                                formulario.setData('password_confirmation', e.currentTarget.value)
                            }
                            placeholder="••••••••"
                        />
                    </Campo>

                    <Botao
                        type="submit"
                        className="w-full"
                        disabled={formulario.processing}
                        traco="firme"
                    >
                        {formulario.processing ? (
                            <>
                                <Loader2 aria-hidden className="animate-spin" />
                                A criar conta
                            </>
                        ) : (
                            'Criar conta'
                        )}
                    </Botao>
                </form>

                <div className="flex items-start gap-2 border border-graphite-12 bg-paper-sunken px-3 py-2.5">
                    <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-graphite-48" />
                    <p className="anotacao normal-case">
                        A conta serve para entrar no SGO. Os dados de negócio que vê dentro do
                        painel são de demonstração e vivem só no navegador.
                    </p>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <p className="anotacao normal-case">
                        Já tem conta?{' '}
                        <Link href={route('login')} className="underline underline-offset-4">
                            Entrar
                        </Link>
                    </p>
                    <Carimbo
                        identidade="SGO"
                        linhas={[{ chave: 'Folha', valor: '02' }]}
                        rodado={-2}
                    />
                </div>

                <Selo tinta="carimbo" traco="firme">
                    Perfil atribuído por administrador
                </Selo>
            </div>
        </LayoutAuth>
    );
}

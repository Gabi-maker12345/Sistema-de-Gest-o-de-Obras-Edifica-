import { Head, Link, useForm } from '@inertiajs/react';
import { CircleAlert, Loader2 } from 'lucide-react';
import { type FormEvent } from 'react';

import { useSgo } from '@/Data/SgoContext';
import { LayoutAuth } from '@/Layouts/LayoutAuth';
import { rotuloPerfil } from '@/lib/rotulos';

import { Carimbo } from '@/Components/brand/carimbo';
import {
    ResumoAcessos,
    SelectorVerComo,
} from '@/Components/brand/selector-ver-como';
import { Botao } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import { Campo, ErroDeFormulario } from '@/Components/ui/field';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Selo } from '@/Components/ui/badge';
import { toast } from '@/Components/ui/toaster';

/**
 * `/login` — a mecânica é a do Breeze (credenciais reais, sessão real), a
 * identidade é a do SGO, e o selector "Ver como" escolhe o utilizador de
 * exemplo que os dados vão simular (D5).
 */
export default function Login() {
    return (
        <LayoutAuth>
            <Head title="Entrar — SGO">
                <meta
                    name="description"
                    content="Entrar no painel do SGO. Autenticação real; o selector «Ver como» escolhe os dados visíveis."
                />
            </Head>

            <FormularioLogin />
        </LayoutAuth>
    );
}

function FormularioLogin() {
    const { utilizadorEfectivo } = useSgo();

    const formulario = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submeter = (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();

        formulario.post(route('login'), {
            onFinish: () => formulario.reset('password'),
            onSuccess: () => {
                toast.success(`Sessão iniciada. A ver o painel como ${utilizadorEfectivo.nome}.`);
            },
        });
    };

    return (
        <div className="space-y-6">
            <header className="space-y-3">
                <p className="cota">Folha 01 · Acesso</p>
                <h2 className="text-2xl font-semibold tracking-tight text-graphite">
                    Entrar no painel
                </h2>
                <p className="text-sm text-graphite-64">
                    Use as credenciais da demonstração. Depois de entrar, o selector «Ver como»
                    filtra o que vê.
                </p>
            </header>

            <div className="hachura-90 h-4 border-y border-graphite-12" aria-hidden />

            <section aria-labelledby="ver-como" className="space-y-2">
                <h3 id="ver-como" className="cota">
                    1 · Ver como
                </h3>
                <SelectorVerComo className="w-full justify-between" />
                <p className="anotacao normal-case">
                    {rotuloPerfil(utilizadorEfectivo.perfil)} · {utilizadorEfectivo.cargo}
                </p>
                <div className="border-l-2 border-stamp-32 pl-3">
                    <ResumoAcessos utilizadorId={utilizadorEfectivo.id} />
                </div>
            </section>

            <form onSubmit={submeter} className="space-y-4" noValidate>
                <h3 className="cota">2 · Credenciais</h3>

                <ErroDeFormulario>{formulario.errors.email ?? formulario.errors.password}</ErroDeFormulario>

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
                        autoComplete="username"
                        autoFocus
                        required
                        value={formulario.data.email}
                        onChange={(e) => formulario.setData('email', e.currentTarget.value)}
                        placeholder="isabel.correia@sgo.ao"
                    />
                </Campo>

                <Campo
                    rotulo="Palavra-passe"
                    htmlFor="password"
                    obrigatorio
                    erro={formulario.errors.password}
                >
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={formulario.data.password}
                        onChange={(e) => formulario.setData('password', e.currentTarget.value)}
                        placeholder="••••••••"
                    />
                </Campo>

                <div className="flex items-center gap-2">
                    <Checkbox
                        id="remember"
                        name="remember"
                        checked={formulario.data.remember}
                        onCheckedChange={(marcado) => formulario.setData('remember', marcado === true)}
                    />
                    <Label htmlFor="remember" className="font-normal text-graphite-64">
                        Manter a sessão aberta
                    </Label>
                </div>

                <Botao
                    type="submit"
                    className="w-full"
                    disabled={formulario.processing}
                    traco="firme"
                >
                    {formulario.processing ? (
                        <>
                            <Loader2 aria-hidden className="animate-spin" />
                            A entrar
                        </>
                    ) : (
                        'Entrar no painel'
                    )}
                </Botao>
            </form>

            <div className="flex items-start gap-2 border border-graphite-12 bg-paper-sunken px-3 py-2.5">
                <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-graphite-48" />
                <p className="anotacao normal-case">
                    Se a conta ainda não existir, o acesso de demonstração cria-se no servidor —
                    os dados de negócio, esses vivem só no navegador.
                </p>
            </div>

            <div className="flex items-end justify-between gap-4">
                <Selo tinta="carimbo" traco="firme">
                    Sessão real
                </Selo>
                <Carimbo
                    identidade="SGO"
                    linhas={[{ chave: 'Folha', valor: '01' }]}
                    rodado={-3}
                />
            </div>

            <p className="anotacao border-t border-graphite-12 pt-4 text-center normal-case">
                Ainda não tem conta?{' '}
                <Link href={route('register')} className="underline underline-offset-4">
                    Criar conta
                </Link>
            </p>
        </div>
    );
}

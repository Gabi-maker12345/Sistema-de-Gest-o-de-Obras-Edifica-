import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, LogOut } from 'lucide-react';

import { iniciais } from '@/lib/format';

import { Botao } from '@/Components/ui/button';

/**
 * As acções de sessão no site público.
 *
 * `/login` e `/register` vivem sob o middleware `guest`, que devolve quem já
 * tem sessão à raiz. Um link "Entrar" cego para lá é um beco sem saída: o
 * utilizador clica e volta a aterrar onde estava. Por isso, com sessão activa,
 * o que se oferece é o painel e a saída — nunca o formulário de entrada.
 */
export function AcoesSessao({ className }: { className?: string }) {
    const utilizador = usePage().props.auth?.user;

    if (!utilizador) {
        return (
            <Botao asChild tamanho="sm" variante="primario" className={className}>
                <Link href={route('login')}>Entrar</Link>
            </Botao>
        );
    }

    return (
        <div className={className}>
            <div className="flex items-center gap-2">
                <Botao asChild tamanho="sm" variante="primario">
                    <Link href={route('admin.dashboard')}>
                        <LayoutDashboard aria-hidden className="size-4" />
                        Painel
                    </Link>
                </Botao>

                <Botao asChild tamanho="sm" variante="contorno">
                    <Link href={route('logout')} method="post" as="button">
                        <LogOut aria-hidden className="size-4" />
                        Sair
                    </Link>
                </Botao>
            </div>

            <p className="cota normal-case mt-1.5 hidden text-right sm:block">
                Sessão de{' '}
                <span className="font-mono text-graphite">{iniciais(utilizador.name)}</span>
            </p>
        </div>
    );
}

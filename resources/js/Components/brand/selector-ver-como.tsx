import { Eye, RotateCcw } from 'lucide-react';

import { PERFIL_INICIAL, useSgo } from '@/Data/SgoContext';
import { iniciais } from '@/lib/format';
import { rotuloPerfil, rotuloPapel, temAcessoTotal } from '@/lib/rotulos';
import { cn } from '@/lib/utils';

import {
    Menu,
    MenuConteudo,
    MenuDisparador,
    MenuItem,
    MenuItemRadio,
    MenuLegenda,
    MenuRadio,
    MenuSeparador,
} from '@/Components/ui/dropdown-menu';
import { Selo } from '@/Components/ui/badge';
import { toast } from '@/Components/ui/toaster';

/**
 * O selector "Ver como" (D5).
 *
 * É uma afinidade de demonstração: escolhe qual utilizador de exemplo estamos
 * a simular para efeitos de filtragem de dados. Não altera a sessão real —
 * quem continua autenticado é o utilizador do Breeze. Por isso a troca
 * confirma-se com uma nota: quem está a ver e quem continua com sessão.
 */
export function SelectorVerComo({
    className,
    compacto = false,
}: {
    className?: string;
    compacto?: boolean;
}) {
    const { utilizadores, utilizadorEfectivo, definirVerComo, estado } = useSgo();

    function mudarPara(utilizadorId: string) {
        const alvo = utilizadores.find((candidato) => candidato.id === utilizadorId);

        definirVerComo(utilizadorId);

        if (alvo) {
            toast(`A ver como ${alvo.nome}`, {
                description: `${alvo.cargo ?? rotuloPerfil(alvo.perfil)} — só os dados visíveis mudaram. A sessão real é a mesma.`,
            });
        }
    }

    return (
        <Menu>
            <MenuDisparador
                className={cn(
                    'group flex items-center gap-2 border border-regua-20 bg-placa px-2 py-1.5 text-left',
                    'text-tinta transition-colors hover:border-tinta-32 hover:bg-placa-alta',
                    className,
                )}
            >
                <span
                    aria-hidden
                    className="grid size-6 shrink-0 place-items-center bg-stamp-alto font-mono text-2xs font-semibold text-tabua"
                >
                    {iniciais(utilizadorEfectivo.nome)}
                </span>

                {!compacto && (
                    <span className="min-w-0">
                        <span className="cota-t block leading-none">Ver como</span>
                        <span className="block truncate text-sm font-medium leading-tight text-tinta">
                            {utilizadorEfectivo.nome}
                        </span>
                    </span>
                )}

                <Eye aria-hidden className="size-4 shrink-0 text-tinta-32" />
            </MenuDisparador>

            <MenuConteudo align="start" className="w-80">
                <MenuLegenda>Simular utilizador</MenuLegenda>

                <MenuRadio
                    value={utilizadorEfectivo.id}
                    onValueChange={(valor) => mudarPara(valor)}
                >
                    {utilizadores.map((utilizador) => {
                        const acessos = estado.acessos.filter(
                            (acesso) => acesso.utilizadorId === utilizador.id,
                        );

                        return (
                            <MenuItemRadio
                                key={utilizador.id}
                                value={utilizador.id}
                                className="items-center gap-2.5 py-2"
                            >
                                <span
                                    aria-hidden
                                    className={cn(
                                        'grid size-7 shrink-0 place-items-center border font-mono text-2xs font-semibold',
                                        utilizador.id === utilizadorEfectivo.id
                                            ? 'border-amber bg-amber text-graphite'
                                            : 'border-graphite-32 text-graphite-64',
                                    )}
                                >
                                    {iniciais(utilizador.nome)}
                                </span>

                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium">
                                        {utilizador.nome}
                                    </span>
                                    <span className="cota normal-case">
                                        {utilizador.cargo ?? rotuloPerfil(utilizador.perfil)}
                                    </span>
                                </span>

                                {temAcessoTotal(utilizador.perfil) ? (
                                    <Selo tinta="carimbo" traco="firme">
                                        Tudo
                                    </Selo>
                                ) : (
                                    <Selo tinta="grafite" traco="leve">
                                        {acessos.length}{' '}
                                        {acessos.length === 1 ? 'projecto' : 'projectos'}
                                    </Selo>
                                )}
                            </MenuItemRadio>
                        );
                    })}
                </MenuRadio>

                <MenuSeparador />

                <MenuItem
                    onSelect={() => mudarPara(PERFIL_INICIAL)}
                    disabled={utilizadorEfectivo.id === PERFIL_INICIAL}
                    className="text-xs"
                >
                    <RotateCcw aria-hidden />
                    Voltar ao perfil com que a folha abriu
                </MenuItem>

                <p className="px-2 py-1.5 font-mono text-2xs leading-relaxed tracking-normal text-graphite-64 normal-case">
                    Afinemidade de demonstração. A sessão real não muda: só os dados visíveis.
                </p>
            </MenuConteudo>
        </Menu>
    );
}

/**
 * A_matrix de acessos em texto: que projectos e com que papel. Serve para
 * mostrar no ecrã de login o que o selector vai fazer.
 */
export function ResumoAcessos({ utilizadorId }: { utilizadorId: string }) {
    const { estado, utilizadores } = useSgo();
    const utilizador = utilizadores.find((u) => u.id === utilizadorId);

    if (!utilizador || temAcessoTotal(utilizador.perfil)) {
        return <span className="cota normal-case">Todos os projectos</span>;
    }

    const acessos = estado.acessos.filter((acesso) => acesso.utilizadorId === utilizadorId);

    return (
        <span className="cota normal-case">
            {acessos
                .map((acesso) => {
                    const projecto = estado.projectos.find((p) => p.id === acesso.projectoId);

                    return `${projecto?.nome ?? '—'} (${rotuloPapel(acesso.papel)})`;
                })
                .join(' · ')}
        </span>
    );
}

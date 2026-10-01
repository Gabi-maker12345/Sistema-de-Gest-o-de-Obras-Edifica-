import { Bell } from 'lucide-react';

import {
    Menu,
    MenuConteudo,
    MenuDisparador,
    MenuItem,
    MenuLegenda,
    MenuSeparador,
} from '@/Components/ui/dropdown-menu';
import { useSgo } from '@/Data/SgoContext';
import { cn } from '@/lib/utils';

function quando(criadoEm: string): string {
    const minutos = Math.max(0, Math.round((Date.now() - new Date(criadoEm).getTime()) / 60000));

    if (minutos < 1) return 'agora mesmo';
    if (minutos < 60) return `há ${minutos} min`;

    const horas = Math.round(minutos / 60);
    if (horas < 24) return `há ${horas} h`;

    const dias = Math.round(horas / 24);
    return dias === 1 ? 'ontem' : `há ${dias} dias`;
}

/**
 * As notificações são a lista de uma folha de revisão: o que ainda não se
 * leu fica com a marca de quadrado cheio, o que já se leu é traço fino. O
 * destino do registo só é seguido quando a rota existe — enquanto o módulo não
 * está emitido, a nota diz isso em vez de levar a um ecrã vazio.
 */
export function SinoNotificacoes() {
    const { estado, marcarNotificacaoLida } = useSgo();
    const naoLidas = estado.notificacoes.filter((notificacao) => !notificacao.lida);

    return (
        <Menu>
            <MenuDisparador
                className={cn(
                    'relative grid size-9 place-items-center text-tinta-72',
                    'transition-colors hover:bg-placa hover:text-tinta',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-alto',
                )}
            >
                <Bell className="size-4" />
                <span className="sr-only">
                    Notificações
                    {naoLidas.length > 0 && `, ${naoLidas.length} por ler`}
                </span>
                {naoLidas.length > 0 && (
                    <span
                        aria-hidden
                        className="absolute top-1.5 right-1.5 min-w-3.5 border border-tabua bg-red-pencil-alto px-1 text-[10px] leading-[14px] font-semibold text-tabua tabular"
                    >
                        {naoLidas.length}
                    </span>
                )}
            </MenuDisparador>

            <MenuConteudo align="end" className="w-80">
                <MenuLegenda>
                    {naoLidas.length > 0
                        ? `${naoLidas.length} por ler de ${estado.notificacoes.length}`
                        : 'Tudo lido'}
                </MenuLegenda>
                <MenuSeparador />

                {estado.notificacoes.length === 0 && (
                    <p className="px-2 py-3 text-sm text-graphite-64">Sem notificações.</p>
                )}

                {estado.notificacoes.map((notificacao) => (
                    <MenuItem
                        key={notificacao.id}
                        onSelect={() => marcarNotificacaoLida(notificacao.id)}
                        className={cn(
                            'items-start py-2',
                            notificacao.lida ? 'text-graphite-64' : 'text-graphite',
                        )}
                    >
                        <MarcaNotificacao lida={notificacao.lida} />
                        <span className="min-w-0">
                            <span className="block text-sm">{notificacao.titulo}</span>
                            <span className="anotacao mt-0.5 block normal-case">
                                {notificacao.corpo}
                            </span>
                            <span className="cota mt-1 block">
                                {quando(notificacao.criadoEm)}
                            </span>
                        </span>
                    </MenuItem>
                ))}

                <MenuSeparador />
                <p className="anotacao px-2 py-1.5 normal-case">
                    Abrir o registo de cada aviso fica disponível com os módulos.
                </p>
            </MenuConteudo>
        </Menu>
    );
}

function MarcaNotificacao({ lida }: { lida: boolean }) {
    return (
        <span
            aria-hidden
            className={cn(
                'mt-1.5 size-2 shrink-0',
                lida ? 'border border-graphite-32' : 'bg-graphite',
            )}
        />
    );
}
import { useCallback } from 'react';

import { useSgo } from '@/Data/SgoContext';
import { LayoutAdmin } from '@/Layouts/LayoutAdmin';

import { FolhaDiario } from './execucao/folha-diario';
import { PaginaModulo } from './execucao/pagina-modulo';

/**
 * `/admin/diario` — o diário de obra, módulo do índice.
 *
 * O diário é um registo por obra e dia, e quem vem aqui quer ver o que aconteceu
 * nos vários dias ao mesmo tempo. A folha de cada obra é a mesma que o
 * separador da ficha mostra, para não haver duas leituras do mesmo registo.
 */
export default function Diario() {
    const { estado } = useSgo();

    const contar = useCallback(
        (projectoId: string) => estado.diarios.filter((d) => d.projectoId === projectoId).length,
        [estado.diarios],
    );

    const projectos = estado.projectos;
    const porSincronizar = estado.diarios.filter((d) => !d.sincronizado).length;

    return (
        <LayoutAdmin>
            <PaginaModulo
                modulo="Registo de campo"
                titulo="Diário de obra"
                folha="02 / 08"
                linha={`${estado.diarios.length} dias registados em ${projectos.length} obras${porSincronizar > 0 ? ` · ${porSincronizar} por sincronizar` : ''}. Um dia por obra.`}
                anotacao="O diário escreve-se no terreno, onde a rede falha. O registo guarda-se na mesma e fica à espera de subir; o selo âmbar diz que ainda não subiu."
                projectos={projectos}
                contar={contar}
                porSincronizar={porSincronizar}
            >
                {(projecto) => <FolhaDiario projectoId={projecto.id} />}
            </PaginaModulo>
        </LayoutAdmin>
    );
}
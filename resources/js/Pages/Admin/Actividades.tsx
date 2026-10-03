import { LayoutAdmin } from '@/Layouts/LayoutAdmin';
import { useSgo } from '@/Data/SgoContext';
import { useCallback } from 'react';

import { FolhaActividades } from './execucao/folha-actividades';
import { PaginaModulo } from './execucao/pagina-modulo';

/**
 * `/admin/actividades` — o módulo das actividades, folha a folha de obra.
 *
 * Uma actividade pertence a um projecto, mas quem entra aqui está a perguntar
 * «o que está a ser feito em todas as obras», e não quer abrir seis fichas para
 * o saber. Por isso o módulo é a lista de obras; a actividade de cada uma lê-se
 * depois de escolher a obra, na mesma folha que o separador da ficha mostra.
 */
export default function Actividades() {
    const { estado } = useSgo();

    const contar = useCallback(
        (projectoId: string) => estado.actividades.filter((a) => a.projectoId === projectoId).length,
        [estado.actividades],
    );

    const projectos = estado.projectos;

    return (
        <LayoutAdmin>
            <PaginaModulo
                modulo="Execução"
                titulo="Actividades"
                folha="02 / 08"
                linha={`${estado.actividades.length} actividades em ${projectos.length} obras. Uma actividade pertence a uma obra: escolha a obra para ler a árvore.`}
                anotacao="A actividade pode ter actividade_pai. As filhas descem dentro da mãe, porque é a mãe que diz a que fase da obra pertencem."
                projectos={projectos}
                contar={contar}
            >
                {(projecto) => <FolhaActividades projectoId={projecto.id} />}
            </PaginaModulo>
        </LayoutAdmin>
    );
}
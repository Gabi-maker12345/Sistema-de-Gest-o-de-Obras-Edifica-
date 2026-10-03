import { useCallback } from 'react';

import { useSgo } from '@/Data/SgoContext';
import { LayoutAdmin } from '@/Layouts/LayoutAdmin';

import { FolhaFotografias } from './execucao/galeria-fotografias';
import { PaginaModulo } from './execucao/pagina-modulo';

/**
 * `/admin/fotografias` — a galeria, módulo do índice.
 *
 * As fotografias do seed não têm ficheiro, por isso a moldura é a legenda sobre
 * hachura. Ver a folha para saber o que cada moldura está a dizer.
 */
export default function Fotografias() {
    const { estado } = useSgo();

    const contar = useCallback(
        (projectoId: string) =>
            estado.fotografias.filter((f) => f.projectoId === projectoId).length,
        [estado.fotografias],
    );

    const projectos = estado.projectos;
    const porSincronizar = estado.fotografias.filter((f) => !f.sincronizado).length;

    return (
        <LayoutAdmin>
            <PaginaModulo
                modulo="Registo de campo"
                titulo="Fotografias"
                folha="03 / 08"
                linha={`${estado.fotografias.length} fotografias em ${projectos.length} obras${porSincronizar > 0 ? ` · ${porSincronizar} por sincronizar` : ''}. Cada uma sabe de que diário ou tarefa veio.`}
                anotacao="Uma fotografia vale mais quando se sabe onde foi tirada: a legenda diz o local, o dia e a tarefa ou o diário de onde vem."
                projectos={projectos}
                contar={contar}
                porSincronizar={porSincronizar}
            >
                {(projecto) => <FolhaFotografias projectoId={projecto.id} />}
            </PaginaModulo>
        </LayoutAdmin>
    );
}
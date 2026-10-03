import { useCallback } from 'react';

import { useSgo } from '@/Data/SgoContext';
import { LayoutAdmin } from '@/Layouts/LayoutAdmin';

import { FolhaDocumentos } from './execucao/folha-documentos';
import { PaginaModulo } from './execucao/pagina-modulo';

/**
 * `/admin/documentos` — a pasta de documentos, módulo do índice.
 *
 * Ao contrário dos outros módulos de registo, o documento não tem selo de
 * sincronização: quem o anexa está no escritório e o ficheiro sobe na hora. Por
 * isso a capa do módulo conta as obras e os ficheiros, e não os pendentes.
 */
export default function Documentos() {
    const { estado } = useSgo();

    const contar = useCallback(
        (projectoId: string) =>
            estado.documentos.filter((d) => d.projectoId === projectoId).length,
        [estado.documentos],
    );

    const projectos = estado.projectos;

    return (
        <LayoutAdmin>
            <PaginaModulo
                modulo="Registo de campo"
                titulo="Documentos"
                folha="04 / 08"
                linha={`${estado.documentos.length} documentos em ${projectos.length} obras. Re-anexar um ficheiro no mesmo registo sobe a versão em vez de criar outro.`}
                anotacao="Só entram aqui os documentos ligados à obra. Um ficheiro ligado a uma tarefa, a uma despesa ou a um fornecedor vive na entidade a que está associado."
                projectos={projectos}
                contar={contar}
            >
                {(projecto) => <FolhaDocumentos projectoId={projecto.id} />}
            </PaginaModulo>
        </LayoutAdmin>
    );
}
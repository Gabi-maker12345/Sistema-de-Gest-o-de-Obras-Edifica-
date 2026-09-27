import '@inertiajs/core';

/**
 * As props que o `HandleInertiaRequests` partilha em todas as páginas. Declaradas
 * aqui uma vez para que nenhum ecrã tenha de fazer `as { auth: ... }` — o
 * utilizador autenticado é lido em todo o lado, do site público ao painel.
 *
 * O campo chama-se `name` e não `nome` porque a tabela `users` é a que veio do
 * Breeze e nunca foi renomeada. Os `Utilizador` em memória (`Data/types.ts`) é
 * que usam `nome`. São dois vocabulários diferentes e não se misturam: este
 * ficheiro descreve o que a API manda.
 */
declare module '@inertiajs/core' {
    interface InertiaConfig {
        sharedPageProps: {
            auth: {
                user: {
                    id: number;
                    name: string;
                    email: string;
                } | null;
            };
        };
    }
}

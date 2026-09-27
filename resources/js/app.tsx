import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import { ProvedorSgo } from '@/Data/SgoContext';
import { ProvedorBusca } from '@/Components/brand/contexto-busca';

const appName = import.meta.env.VITE_APP_NAME || 'SGO';

createInertiaApp({
    title: (title) => (title ? `${title} · ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        /*
         * Os contextos de dados moram aqui, por cima do `App` do Inertia, e não
         * dentro de cada layout. Uma página é o *pai* do seu layout, por isso um
         * provider montado no layout nunca chega a ela: a página chamava
         * `useSgo()` antes de existir provider e o ecrã ficava branco. Montados
         * aqui, todos os ecrãs os veem sem excepção.
         *
         * Também deixa de haver um provider por casca, que reiniciava os dados
         * de demonstração cada vez que se passava do site público para o painel:
         * o que se cria e o que o selector «Ver como» escolhe sobrevivem a toda a
         * sessão, como a spec pede.
         */
        root.render(
            <ProvedorSgo>
                <ProvedorBusca>
                    <App {...props} />
                </ProvedorBusca>
            </ProvedorSgo>,
        );
    },
    progress: {
        color: '#15181A',
    },
});

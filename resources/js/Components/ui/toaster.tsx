import { Toaster as Sonner, toast } from 'sonner';

/**
 * O toast do SGO: uma tira de papel levantada do tabuleiro. O sucesso e
 * grafite com acento ambar; o erro e a unica coisa que pode usar o lapis
 * vermelho.
 *
 * O CSS do sonner e injectado em runtime, por isso as cores entram pelas
 * variaveis que ele consome e o resto vem em `style` inline.
 */
export function Toaster() {
    return (
        <Sonner
            position="bottom-right"
            className="font-sans!"
            toastOptions={{
                classNames: {
                    toast: [
                        'border border-graphite-32 text-graphite',
                        '[--border-radius:2px]',
                        '[--normal-bg:var(--color-paper-raised)]',
                        '[--normal-border:var(--color-graphite-32)]',
                        '[--normal-text:var(--color-graphite)]',
                        'data-[type=error]:border-l-2 data-[type=error]:border-l-red-pencil',
                        'data-[type=success]:border-l-2 data-[type=success]:border-l-amber',
                        'data-[type=loading]:border-l-2 data-[type=loading]:border-l-stamp',
                    ].join(' '),
                    title: 'text-sm font-medium',
                    description: 'anotacao text-graphite-64',
                    actionButton:
                        'rounded-nib border border-graphite bg-graphite px-2 py-1 text-xs text-paper hover:bg-graphite-80',
                    cancelButton: 'anotacao px-2 py-1',
                    closeButton: 'rounded-none border-graphite-20 text-graphite-48',
                    icon: 'text-graphite',
                },
                style: {
                    padding: '10px 12px',
                    fontSize: '13px',
                    boxShadow: '0 1px 0 0 rgba(21, 24, 26, 0.08)',
                },
            }}
        />
    );
}

export { toast };

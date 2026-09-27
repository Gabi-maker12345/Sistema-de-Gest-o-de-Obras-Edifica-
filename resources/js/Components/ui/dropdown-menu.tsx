import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

const Menu = DropdownMenuPrimitive.Root;
const MenuDisparador = DropdownMenuPrimitive.Trigger;

function conteudo({
    className,
    sideOffset = 6,
    ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
    return (
        <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
                sideOffset={sideOffset}
                className={cn(
                    'z-50 min-w-56 border border-graphite-32 bg-paper-raised p-1 text-graphite shadow-folha',
                    'data-[state=open]:animate-none',
                    className,
                )}
                {...props}
            />
        </DropdownMenuPrimitive.Portal>
    );
}

function item({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Item>) {
    return (
        <DropdownMenuPrimitive.Item
            className={cn(
                'flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm outline-none select-none',
                'focus:bg-amber focus:text-graphite',
                'data-disabled:pointer-events-none data-disabled:opacity-40',
                '[&_svg]:size-4 [&_svg]:shrink-0',
                className,
            )}
            {...props}
        />
    );
}

function itemRadio({
    className,
    children,
    ...props
}: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
    return (
        <DropdownMenuPrimitive.RadioItem
            className={cn(
                'flex cursor-pointer items-start gap-2 px-2 py-1.5 text-sm outline-none select-none',
                'focus:bg-amber focus:text-graphite',
                'data-disabled:pointer-events-none data-disabled:opacity-40',
                className,
            )}
            {...props}
        >
            {children}
        </DropdownMenuPrimitive.RadioItem>
    );
}

function separador({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
    return (
        <DropdownMenuPrimitive.Separator
            className={cn('-mx-1 my-1 h-px bg-graphite-12', className)}
            {...props}
        />
    );
}

function legenda({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
    return (
        <DropdownMenuPrimitive.Label
            className={cn('cota px-2 py-1.5', className)}
            {...props}
        />
    );
}

const MenuGrupo = DropdownMenuPrimitive.Group;
const MenuRadio = DropdownMenuPrimitive.RadioGroup;

export {
    conteudo as MenuConteudo,
    item as MenuItem,
    itemRadio as MenuItemRadio,
    legenda as MenuLegenda,
    MenuDisparador,
    MenuGrupo,
    MenuRadio,
    separador as MenuSeparador,
    Menu,
};

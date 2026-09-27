declare function route(
    name: string,
    params?: Record<string, unknown> | number | Array<Record<string, unknown> | number>,
    absolute?: boolean,
    locale?: string,
): string;

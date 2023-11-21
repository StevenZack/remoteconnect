// place files you want to import through the `$lib` alias in this folder.

import { dev } from "$app/environment";

export function getRoute(s: string): string {
    if (s.endsWith('/') || dev) {
        return s;
    }

    return s + '.html'
}
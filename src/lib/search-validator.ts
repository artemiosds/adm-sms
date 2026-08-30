import { z } from "zod";

/**
 * Substituição local e mínima de `@tanstack/zod-adapter`.
 *
 * Motivo: o pacote `@tanstack/zod-adapter@1.167.x` declara peer dependency
 * `zod@^3.23.8`, incompatível com o zod 4 usado pelo projeto — conflito
 * ERESOLVE em `npm install` limpo (ex.: build na Vercel). O TanStack Router
 * aceita `validateSearch` como função, então o adapter não é necessário.
 */

/** Equivalente ao `fallback(schema, valor)` do adapter: em caso de falha, usa o valor padrão. */
export function fallback<S extends z.ZodType>(schema: S, valor: z.input<S>): S {
  return schema.catch(valor as z.output<S>) as unknown as S;
}

/**
 * Validador de search params compatível com `validateSearch` do TanStack Router.
 * Se o parse falhar, devolve os defaults do schema (mesmo comportamento prático
 * do `zodValidator`, que nunca quebra a navegação por param inválido).
 */
export function zodSearchValidator<S extends z.ZodType>(
  schema: S,
): (search: Record<string, unknown>) => z.output<S> {
  return (search) => {
    const r = schema.safeParse(search);
    return (r.success ? r.data : schema.parse({})) as z.output<S>;
  };
}

import type { en } from "@/i18n/messages/en";

export type DeepStringify<T> = T extends string
  ? string
  : { [K in keyof T]: DeepStringify<T[K]> };

export type AppMessages = DeepStringify<typeof en>;

type Join<A extends string, B extends string> = A extends "" ? B : `${A}.${B}`;

export type MessagePath<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? Join<P, K>
    : T[K] extends Record<string, unknown>
      ? MessagePath<T[K], Join<P, K>>
      : never;
}[keyof T & string];

export type TKey = MessagePath<typeof en>;

export type TFunction = (
  key: TKey,
  vars?: Record<string, string | number>
) => string;

function lookup(messages: AppMessages, path: string): string {
  let current: unknown = messages;
  for (const part of path.split(".")) {
    if (current == null || typeof current !== "object") return path;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : path;
}

export function createTranslator(messages: AppMessages): TFunction {
  return (key, vars) => {
    let text = lookup(messages, key);
    if (!vars) return text;
    for (const [name, value] of Object.entries(vars)) {
      text = text.split(`{${name}}`).join(String(value));
    }
    return text;
  };
}

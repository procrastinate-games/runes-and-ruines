/** Player-facing Russian inflection; gameplay IDs and saved data stay unchanged. */
const plurals = new Intl.PluralRules('ru');
export function countRu(value: number, forms: readonly [string, string, string]): string {
 const form = plurals.select(value);
 return `${value} ${forms[form === 'one' ? 0 : form === 'few' ? 1 : 2]}`;
}

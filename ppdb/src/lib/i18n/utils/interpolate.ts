/**
 * Interpolates a string with data.
 * Example: interpolate("Hello {name}", { name: "World" }) => "Hello World"
 */
export function interpolate(template: string, params?: Record<string, string | number>): string {
    if (!params) return template;

    return template.replace(/{(\w+)}/g, (match, key) => {
        return params[key] !== undefined ? String(params[key]) : match;
    });
}

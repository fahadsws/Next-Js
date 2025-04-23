export async function apiFetch(endpoint, options = {}) {
    const res = await fetch(`/api/${endpoint}`, {
        ...options,
        cache: 'no-store',
    });
    if (!res.ok) {
        const error = await res.text();
        throw new Error(`API error: ${res.status} - ${error}`);
    }
    return res.json();
}

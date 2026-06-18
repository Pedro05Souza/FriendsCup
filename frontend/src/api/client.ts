const BASE = '/api'

export async function apiFetch<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const opts: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body !== undefined) opts.body = JSON.stringify(body)

  const res = await fetch(BASE + path, opts)

  if (!res.ok) {
    let msg = res.statusText
    try {
      const json = await res.json()
      if (typeof json.message === 'string') msg = json.message
      else if (Array.isArray(json.errors))
        msg = json.errors.map((e: { message: string }) => e.message).join(', ')
    } catch {
      // ignore parse errors
    }
    throw new Error(msg)
  }

  const text = await res.text()
  return text ? (JSON.parse(text) as T) : (null as T)
}

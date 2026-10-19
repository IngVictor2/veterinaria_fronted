import { HttpErrorResponse } from '@angular/common/http';

function extraerMensaje(body: unknown): string | null {
  if (typeof body === 'string' && body.trim()) {
    // El backend puede responder el JSON como texto; intentar extraer `message`.
    try {
      const parsed = JSON.parse(body) as unknown;
      if (parsed && typeof parsed === 'object') {
        const msg = (parsed as { message?: unknown }).message;
        if (typeof msg === 'string' && msg.trim()) return msg;
      }
    } catch {
      // no era JSON
    }
    return null;
  }
  if (body && typeof body === 'object') {
    // Un Error aquí es típicamente un fallo de parseo (respuesta no JSON):
    // axios/Vue mostraban el fallback en ese caso.
    if (body instanceof Error) return null;
    const msg = (body as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return null;
}

/**
 * Extrae el mensaje de error del backend de forma segura.
 * Equivalente a `e.response?.data?.message || 'fallback'` del proyecto Vue original.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    return extraerMensaje(error.error) ?? fallback;
  }
  return fallback;
}

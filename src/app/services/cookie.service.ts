import { Injectable } from '@angular/core';

/**
 * Servicio genérico de bajo nivel para leer, escribir y borrar cookies
 * del navegador. No depende de Angular más que del decorador @Injectable.
 */
@Injectable({ providedIn: 'root' })
export class CookieService {

  /**
   * Guarda una cookie.
   * @param name nombre de la cookie
   * @param value valor (string). Para objetos, usar JSON.stringify antes.
   * @param days días de expiración (por defecto 30)
   */
  set(name: string, value: string, days: number = 30): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    const encodedValue = encodeURIComponent(value);
    document.cookie = `${name}=${encodedValue}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }

  /**
   * Guarda un objeto serializándolo como JSON.
   */
  setObject(name: string, value: unknown, days: number = 30): void {
    this.set(name, JSON.stringify(value), days);
  }

  /**
   * Lee una cookie por nombre. Devuelve null si no existe.
   */
  get(name: string): string | null {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    return null;
  }

  /**
   * Lee una cookie y la parsea como JSON. Devuelve null si no existe
   * o si el contenido no es JSON válido.
   */
  getObject<T>(name: string): T | null {
    const raw = this.get(name);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  /**
   * Elimina una cookie.
   */
  delete(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  /**
   * Indica si existe una cookie con ese nombre.
   */
  has(name: string): boolean {
    return this.get(name) !== null;
  }
}

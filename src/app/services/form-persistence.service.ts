import { Injectable } from '@angular/core';
import { CookieService } from './cookie.service';

/**
 * Servicio que guarda y recupera los datos de CUALQUIER formulario de la app
 * usando cookies. La idea: cada formulario tiene una "clave" única
 * (ej. 'form_login', 'form_busqueda', 'form_reserva_5') y este servicio
 * guarda el objeto completo del formulario bajo esa clave.
 *
 * Así, si el usuario recarga la página, cierra el navegador y vuelve,
 * o navega entre páginas, sus datos ingresados siguen disponibles.
 */
@Injectable({ providedIn: 'root' })
export class FormPersistenceService {
  private readonly PREFIX = 'pkv2_form_';

  constructor(private cookieService: CookieService) {}

  /**
   * Guarda el estado completo de un formulario.
   * @param formKey identificador único del formulario (ej: 'login', 'busqueda', 'reserva')
   * @param data objeto con los valores del formulario
   * @param days días que la cookie debe persistir (por defecto 7)
   */
  save<T>(formKey: string, data: T, days: number = 7): void {
    this.cookieService.setObject(this.PREFIX + formKey, data, days);
  }

  /**
   * Recupera el estado guardado de un formulario. Devuelve null si no hay nada guardado.
   */
  load<T>(formKey: string): T | null {
    return this.cookieService.getObject<T>(this.PREFIX + formKey);
  }

  /**
   * Borra el estado guardado de un formulario (ej: al enviarlo exitosamente).
   */
  clear(formKey: string): void {
    this.cookieService.delete(this.PREFIX + formKey);
  }

  /**
   * Útil para campos individuales sin guardar todo el objeto.
   */
  hasSavedData(formKey: string): boolean {
    return this.cookieService.has(this.PREFIX + formKey);
  }
}

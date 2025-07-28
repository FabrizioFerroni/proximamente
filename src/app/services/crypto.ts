import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  private readonly secretKey: string = environment.secretKeyRT;
  private readonly secret: string = environment.secret;

  encryptToken(token: string): string {
    return CryptoJS.AES.encrypt(token, this.secretKey).toString();
  }

  decryptToken(encryptedToken: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, this.secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async validateTokenDes(
    token: string
  ): Promise<{ email: string; date: Date }> {
    try {
      const decoded = atob(token);
      let parsed;

      try {
        parsed = JSON.parse(decoded);
      } catch {
        throw new Error('El token no tiene un formato válido');
      }

      const { email, date, signature } = parsed;

      if (!email || !date || !signature) {
        throw new Error('El token no contiene todos los campos requeridos');
      }

      const expectedSignature = await this.generateHmac(email);

      if (signature !== expectedSignature) {
        throw new Error('La firma del token no coincide');
      }

      return { email, date: new Date(date) };
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al validar el token'
      );
    }
  }

  private async generateHmac(message: string): Promise<string> {
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(message)
    );

    // Convierte el ArrayBuffer a string hexadecimal
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

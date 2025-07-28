import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translateTheme',
})
export class TranslateThemePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    let themeName: string = '';

    if (value === 'dark') {
      themeName = 'Oscuro';
    } else if (value === 'light') {
      themeName = 'Claro';
    } else if (value === 'system') {
      themeName = 'Sistema';
    }

    return themeName;
  }
}

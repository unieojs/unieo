import { get } from 'lodash';

/**
 * simplified lodash.template but not eval
 */
const reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

export function esTemplate(template: string, data: object) {
  return template.replace(reEsTemplate, (_, escapeValue) => {
    return get(data, escapeValue, '');
  });
}

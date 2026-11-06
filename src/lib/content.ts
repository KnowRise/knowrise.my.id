import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import type { ContentFormat } from '../types';

const ALLOWED_TAGS = [
  'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'del',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'a', 'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'span', 'div',
];

const ALLOWED_STYLES: sanitizeHtml.IOptions['allowedStyles'] = {
  '*': {
    'text-align': [/^(left|right|center|justify)$/],
    'width': [/^\d+(\.\d+)?(px|%|em|rem)?$/],
    'max-width': [/^\d+(\.\d+)?(px|%|em|rem)?$/],
    'height': [/^\d+(\.\d+)?(px|%|em|rem)?$/],
    'margin-left': [/^\d+(\.\d+)?(px|%|em|rem)?$/],
    'margin-right': [/^\d+(\.\d+)?(px|%|em|rem)?$/],
  },
};

export function renderRichContent(value: string | null | undefined, format: ContentFormat = 'markdown'): string {
  if (!value || !value.trim()) return '';

  const html = format === 'html'
    ? value
    : (marked.parse(value, { async: false }) as string);

  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'target', 'rel', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding'],
      '*': ['style', 'class'],
    },
    allowedStyles: ALLOWED_STYLES,
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['http', 'https'],
      a: ['http', 'https', 'mailto', 'tel'],
    },
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href || '';
        const external = /^https?:\/\//i.test(href);
        return {
          tagName,
          attribs: {
            ...attribs,
            ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
          },
        };
      },
      img: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          loading: 'lazy',
          decoding: 'async',
        },
      }),
    },
  });
}

export function richTextToPlainText(value: string | null | undefined, format: ContentFormat = 'markdown'): string {
  return sanitizeHtml(renderRichContent(value, format), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function estimateReadTime(value: string | null | undefined, format: ContentFormat = 'markdown'): number {
  const text = richTextToPlainText(value, format);
  const wordCount = text ? text.split(' ').length : 0;
  return Math.max(1, Math.round(wordCount / 200));
}

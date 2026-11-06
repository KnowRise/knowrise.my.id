import { mergeAttributes, Node } from '@tiptap/core';

export interface GalleryImage {
  src: string;
  alt: string;
}

export const Gallery = Node.create({
  name: 'gallery',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      images: {
        default: [] as GalleryImage[],
        parseHTML: (element) =>
          Array.from(element.querySelectorAll('img'))
            .map((img) => ({
              src: img.getAttribute('src') || '',
              alt: img.getAttribute('alt') || '',
            }))
            .filter((image) => image.src),
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div.rich-gallery' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const images = (node.attrs.images ?? []) as GalleryImage[];
    return [
      'div',
      mergeAttributes(HTMLAttributes, { class: 'rich-gallery' }),
      ...images.map((image) => [
        'a',
        { href: image.src, target: '_blank', rel: 'noopener noreferrer' },
        ['img', { src: image.src, alt: image.alt, loading: 'lazy', decoding: 'async' }],
      ]),
    ];
  },
});

export default Gallery;

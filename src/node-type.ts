// const metaDataNodeSet = new Set([
//   'base',
//   'head',
//   'link',
//   'meta',
//   'style',
//   'title',
// ]);

const contentSectioningNodeSet = new Set([
  'address',
  'article',
  'aside',
  'footer',
  'header',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hgroup',
  'main',
  'nav',
  'section',
]);

const textContentNodeSet = new Set([
  'blockquote',
  'dd',
  'dir',
  'div',
  'dl',
  'dt',
  'figcaption',
  'figure',
  'hr',
  'li',
  'main',
  'ol',
  'p',
  'pre',
  'ul',
]);

const inlineTextSemanticNodeSet = new Set([
  'a',
  'abbr',
  'b',
  'bdi',
  'bdo',
  'br',
  'cite',
  'code',
  'data',
  'dfn',
  'em',
  'i',
  'kbd',
  'mark',
  'q',
  'rb',
  'rt',
  'rtc',
  'ruby',
  's',
  'samp',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'time',
  'tt',
  'u',
  'var',
  'wbr',
]);

const multimediaNodeSet = new Set([
  'area',
  'audio',
  'img',
  'map',
  'track',
  'video',
]);

const embeddedContentNodeSet = new Set([
  'applet',
  'embed',
  'iframe',
  'noembed',
  'object',
  'param',
  'picture',
  'source',
]);

// const scriptNodeSet = new Set(['canvas', 'noscript', 'script']);

// const demarcatingEditNodeSet = new Set(['del', 'ins']);

const tableContentNodeSet = new Set([
  'caption',
  'col',
  'colgroup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
]);

const formNodeSet = new Set([
  'button',
  'datalist',
  'fieldset',
  'form',
  'input',
  'label',
  'legend',
  'meter',
  'optgroup',
  'option',
  'output',
  'progress',
  'select',
  'textarea',
]);

// const interactiveNodeSet = new Set([
//   'details',
//   'dialog',
//   'menu',
//   'menuitem',
//   'summary',
// ]);

// const deprecatedNodeSet = new Set([
//   'acronym',
//   'applet',
//   'basefont',
//   'bgsound',
//   'big',
//   'blink',
//   'center',
//   'command',
//   'content',
//   'dir',
//   'element',
//   'font',
//   'frame',
//   'frameset',
//   'image',
//   'isindex',
//   'keygen',
//   'listing',
//   'marquee',
//   'menuitem',
//   'multicol',
//   'nextid',
//   'nobr',
//   'noembed',
//   'noframes',
//   'plaintext',
//   'shadow',
//   'spacer',
//   'strike',
//   'tt',
//   'xmp',
// ]);

const selfClosingNodeSet = new Set(['br', 'img', 'col', 'hr']);

const blockNodeSet = new Set([
  ...contentSectioningNodeSet,
  ...textContentNodeSet,
  ...multimediaNodeSet,
  ...embeddedContentNodeSet,
  ...tableContentNodeSet,
  ...formNodeSet,
  ...selfClosingNodeSet,
]);

const inlineNodeSet = new Set(inlineTextSemanticNodeSet);
inlineNodeSet.delete('br');
inlineNodeSet.delete('code');

function isElementNode(node: Node | null): boolean {
  return !!node && node.nodeType === Node.ELEMENT_NODE;
}

function isTextNode(node: Node | null): boolean {
  return !!node && node.nodeType === Node.TEXT_NODE;
}

function isCommentNode(node: Node | null): boolean {
  return !!node && node.nodeType === Node.COMMENT_NODE;
}

function isBlockNode(node: Node | null): boolean {
  return (
    isElementNode(node) &&
    !!blockNodeSet.has((node as Element).tagName.toLocaleLowerCase())
  );
}

function isInlineNode(node: Node | null): boolean {
  return (
    isElementNode(node) &&
    !!inlineNodeSet.has((node as Element).tagName.toLocaleLowerCase())
  );
}

function isSelfClosingNode(node: Node | null): boolean {
  return (
    isElementNode(node) &&
    !!selfClosingNodeSet.has((node as Element).tagName.toLocaleLowerCase())
  );
}

export {
  isElementNode,
  isTextNode,
  isCommentNode,
  isBlockNode,
  isInlineNode,
  isSelfClosingNode,
};

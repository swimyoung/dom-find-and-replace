import _ from 'lodash';

const { ELEMENT_NODE, TEXT_NODE, COMMENT_NODE } = Node;

const arrayToTagNameMap = arr =>
  Object.freeze(
    arr.reduce((o, v) => Object.assign(o, { [v.toUpperCase()]: true }), {}),
  );

export const MetaDataNode = arrayToTagNameMap([
  'base',
  'head',
  'link',
  'meta',
  'style',
  'title',
]);

export const ContentSectioningNode = arrayToTagNameMap([
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

export const TextContentNode = arrayToTagNameMap([
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

export const InlineTextSemanticNode = arrayToTagNameMap([
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

export const MultimediaNode = arrayToTagNameMap([
  'area',
  'audio',
  'img',
  'map',
  'track',
  'video',
]);

export const EmbeddedContentNode = arrayToTagNameMap([
  'applet',
  'embed',
  'iframe',
  'noembed',
  'object',
  'param',
  'picture',
  'source',
]);

export const ScriptNode = arrayToTagNameMap(['canvas', 'noscript', 'script']);

export const DemarcatingEditNode = arrayToTagNameMap(['del', 'ins']);

export const TableContentNode = arrayToTagNameMap([
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

export const FormNode = arrayToTagNameMap([
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

export const InteractiveNode = arrayToTagNameMap([
  'details',
  'dialog',
  'menu',
  'menuitem',
  'summary',
]);

export const DeprecatedNode = arrayToTagNameMap([
  'acronym',
  'applet',
  'basefont',
  'bgsound',
  'big',
  'blink',
  'center',
  'command',
  'content',
  'dir',
  'element',
  'font',
  'frame',
  'frameset',
  'image',
  'isindex',
  'keygen',
  'listing',
  'marquee',
  'menuitem',
  'multicol',
  'nextid',
  'nobr',
  'noembed',
  'noframes',
  'plaintext',
  'shadow',
  'spacer',
  'strike',
  'tt',
  'xmp',
]);

export const SelfClosingNodes = arrayToTagNameMap(['br', 'img', 'col', 'hr']);

export const BlockNodes = {
  ...ContentSectioningNode,
  ...TextContentNode,
  ...MultimediaNode,
  ...EmbeddedContentNode,
  ...TableContentNode,
  ...FormNode,
  ...SelfClosingNodes,
};

export const InlineNodes = {
  ...InlineTextSemanticNode,
  ...{
    br: undefined,
    code: undefined,
  },
};

const isNode = arg =>
  _.isObjectLike(arg) &&
  _.isPlainObject(arg) === false &&
  typeof arg.nodeType !== 'undefined';

export const isElementNode = arg =>
  isNode(arg) && arg.nodeType === ELEMENT_NODE;

export const isTextNode = arg => isNode(arg) && arg.nodeType === TEXT_NODE;

export const isCommentNode = arg =>
  isNode(arg) && arg.nodeType === COMMENT_NODE;

export const isBlockNode = arg =>
  isElementNode(arg) && !!BlockNodes[arg.tagName];

export const isInlineNode = arg =>
  isElementNode(arg) && !!InlineNodes[arg.tagName];

export const isSelfClosingNode = arg =>
  isElementNode(arg) && !!SelfClosingNodes[arg.tagName];

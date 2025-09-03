Object.defineProperty(HTMLElement.prototype, 'getClientRects', {
  value: () => [] as unknown as DOMRectList,
  configurable: true,
});
Object.defineProperty(Text.prototype, 'getClientRects', {
  value: () => [] as unknown as DOMRectList,
  configurable: true,
});
Object.defineProperty(Range.prototype, 'getClientRects', {
  value: () => [] as unknown as DOMRectList,
  configurable: true,
});
Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
  value: () => ({
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    x: 0,
    y: 0,
    toJSON: () => {},
  }),
  configurable: true,
});
Object.defineProperty(Text.prototype, 'getBoundingClientRect', {
  value: () => ({
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    x: 0,
    y: 0,
    toJSON: () => {},
  }),
  configurable: true,
});
Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
  value: () => ({
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    x: 0,
    y: 0,
    toJSON: () => {},
  }),
  configurable: true,
});

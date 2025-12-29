export function buildCssSnippet({ id, aspectRatio }) {
	return `.element {
  width: 100%;
  aspect-ratio: ${aspectRatio};
  clip-path: url(#${id});
}`;
}

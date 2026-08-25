export function toFilenames(value: any): string[] {
	if (!value) {
		return [];
	}
	return (Array.isArray(value) ? value : [value]).filter(filename => !!filename);
}

export function getProtocolImageUrl(filename: string) {
	return `/images/protocols/${filename}`;
}

import { writable } from 'svelte/store';
import { PageSizes } from 'pdf-lib';

export const options = writable({
	docSize: PageSizes.A6,
	autoRotate: true,
	fit: true,
	bleed: false,
	mirrorBleed: false,
	tablePrint: false,
	tableSize: PageSizes.SRA3,
	columns: 1,
	rows: 1,
	gap: 0
});

export const queue = writable({
	message: 'Start adding images or PDF',
	active: false,
	src: ''
});

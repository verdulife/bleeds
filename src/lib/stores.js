import { writable } from 'svelte/store';
import { pageSizes } from '$lib/data';

export const options = writable({
	docSize: pageSizes[0].size,
	autoRotate: true,
	fit: true,
	bleed: true,
	mirrorBleed: true,
	tablePrint: false,
	tableSize: pageSizes[0].size,
	columns: 1,
	rows: 1,
	gap: 0
});

export const queue = writable({
	message: 'Start adding images or PDF',
	active: false,
	src: ''
});

import { writable } from 'svelte/store';
import { PageSizes } from 'pdf-lib';

export const options = writable({
	docSize: PageSizes.A6,
	autoRotate: true,
	fit: true,
	bleed: false,
	mirrorBleed: false
});

export const queue = writable({
	message: 'Start adding images or PDF',
	active: false,
	src: ''
});

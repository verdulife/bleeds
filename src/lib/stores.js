import { writable } from 'svelte/store';

export const queueStatus = writable({
	message: 'Start adding images or PDF',
	active: false
});

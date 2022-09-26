<script>
	import { queue } from '$lib/stores';
	import Status from '$lib/components/Status.svelte';
	import Options from '../lib/components/Options.svelte';
</script>

<section class="viewport row nowrap">
	<Options />

	<article class="col grow yfill">
		<Status />

		{#if $queue.src}
			<iframe class="fill" src={$queue.src} title="=PDF preview" />
		{/if}
	</article>
</section>

<style lang="scss">
	iframe {
		border: none;
	}

	article {
		background: #000;
	}
</style>

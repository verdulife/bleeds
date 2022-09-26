<script>
	import { queue } from '$lib/stores';
</script>

<aside class="xfill tcenter">{$queue.message}</aside>

<style lang="scss">
	aside {
		background: var(--color-sec);
		color: #fff;
		padding: 5px;
	}
</style>

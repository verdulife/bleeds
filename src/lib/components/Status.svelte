<script>
	import { queueStatus } from '$lib/stores';
</script>

<aside class="xfill tcenter">{$queueStatus.message}</aside>

<style lang="scss">
	aside {
		background: var(--color-sec);
		color: #fff;
		padding: 5px;
	}
</style>

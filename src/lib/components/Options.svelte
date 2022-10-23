<script>
	import { options, queue } from '$lib/stores';
	import { PDFDocument, PageSizes } from 'pdf-lib';
	import { readFile, processEmbedPdf, processEmbedImage } from '$lib/utils';
	import { onMount } from 'svelte';

	let doc, docPages;
	let { docSize } = $options;

	async function newPdf() {
		doc = await PDFDocument.create();
		$queue.src = undefined;
	}

	async function processPdf() {
		const pdfDataUri = await doc.saveAsBase64({ dataUri: true });
		const res = await fetch(pdfDataUri);
		const blob = await res.blob();
		const url = URL.createObjectURL(blob);
		$queue.src = url + '#view=fit';
		docPages = doc.pageCount;

		$queue.active = false;
		$queue.message = `${docPages} Pages loaded`;

		console.log('processed');
	}

	function resizeDoc() {
		doc.pageMap.forEach((page) => {
			const { angle } = page.getRotation();
			const hasRotation = angle !== 0;

			const scaleX = $options.docSize[0] / page.getWidth();
			const scaleY = $options.docSize[1] / page.getHeight();

			if (hasRotation) page.scale(scaleY, scaleX);
			else page.scale(scaleX, scaleY);
		});

		processPdf();
		docSize = $options.docSize;
	}

	async function processFiles(rawFiles) {
		for (let r = 0; r < rawFiles.length; r++) {
			$queue.message = `Processing file ${r + 1} of ${rawFiles.length}`;

			const rawFile = rawFiles[r];
			const type = rawFile.type.split('/')[1];
			const fileBuffer = await readFile(rawFile);

			let art;
			if (type === 'pdf') {
				const loadedPdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
				art = loadedPdf.getPages();
			} else {
				art = type === 'jpeg' ? await doc.embedJpg(fileBuffer) : await doc.embedPng(fileBuffer);
			}

			const isEmbedPdf = Array.isArray(art);

			if (isEmbedPdf) {
				await processEmbedPdf(doc, art);
			} else {
				await processEmbedImage(doc, art);
			}

			art = undefined;
		}

		await processPdf();
	}

	function loadFile() {
		const input = document.createElement('input');
		input.type = 'file';
		input.multiple = true;
		input.accept = 'image/jpeg,image/png,application/pdf';
		input.click();

		input.onchange = async () => {
			const rawFiles = Array.from(input.files);
			await processFiles(rawFiles);
		};
	}

	$: if (docPages && $options.docSize !== docSize) resizeDoc();
	onMount(newPdf);
</script>

<aside class="col yfill">
	<select class="outline xfill" bind:value={$options.docSize}>
		{#each Object.entries(PageSizes) as [key, value]}
			<option {value}>{key}</option>
		{/each}
	</select>

	<div class="row jbetween acenter xfill">
		<label for="autorotate">Autorotate</label>
		<input type="checkbox" id="autorotate" bind:checked={$options.autoRotate} />
	</div>

	<div class="row jbetween acenter xfill">
		<label for="fit">Fit</label>
		<input type="checkbox" id="fit" bind:checked={$options.fit} />
	</div>

	<div class="row jbetween acenter xfill">
		<label for="bleed">Bleed</label>
		<input type="checkbox" id="bleed" bind:checked={$options.bleed} />
	</div>

	{#if $options.bleed}
		<div class="row jbetween acenter xfill">
			<label for="mirror">Mirror Bleed</label>
			<input type="checkbox" id="mirror" bind:checked={$options.mirrorBleed} />
		</div>
	{/if}

	<button class="sec xfill" on:click={loadFile}>ADD</button>
	<button class="sec-outline xfill" on:click={newPdf}>RESET</button>
</aside>

<style lang="scss">
	aside {
		width: 300px;
		gap: 20px;
		accent-color: var(--color-sec);
		padding: 20px;
	}
</style>

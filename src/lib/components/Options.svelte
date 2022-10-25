<script>
	import { options, queue } from '$lib/stores';
	import { PDFDocument, PageSizes } from 'pdf-lib';
	import { readFile, processEmbedPdf, processEmbedImage, toMm, mm } from '$lib/utils';
	import { onMount } from 'svelte';

	let doc, docPages, art;
	let { docSize } = $options;
	let pageSizes = [];
	let freeWidth = Math.round(toMm($options.docSize[0]));
	let freeHeight = Math.round(toMm($options.docSize[1]));

	for (let size in PageSizes) {
		const width = Math.round(toMm(PageSizes[size][0]));
		const height = Math.round(toMm(PageSizes[size][1]));

		const newSize = {
			label: size,
			mm: [width, height],
			pt: PageSizes[size]
		};

		pageSizes = [...pageSizes, newSize];
	}

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
			const rotate = angle !== 0;

			const width = $options.docSize[rotate ? 1 : 0] / page.getTrimBox().width;
			const height = $options.docSize[rotate ? 0 : 1] / page.getTrimBox().height;

			page.scale(width, height);
		});

		docSize = $options.docSize;

		if (doc.pageCount > 0) {
			processPdf();
		}
	}

	async function processFiles(rawFiles) {
		for (let r = 0; r < rawFiles.length; r++) {
			$queue.message = `Processing file ${r + 1} of ${rawFiles.length}`;

			const rawFile = rawFiles[r];
			const type = rawFile.type.split('/')[1];
			const fileBuffer = await readFile(rawFile);

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

	function updateFreeSize() {
		freeWidth = Math.round(toMm($options.docSize[0]));
		freeHeight = Math.round(toMm($options.docSize[1]));
	}

	function sizeToPt() {
		$options.docSize = [mm(freeWidth), mm(freeHeight)];
	}

	$: if (docPages && $options.docSize !== docSize) resizeDoc();
	$: console.log($options.docSize);

	onMount(newPdf);
</script>

<div class="scroll">
	<aside class="col xfill">
		<select class="outline xfill" bind:value={$options.docSize} on:change={updateFreeSize}>
			{#each pageSizes as page}
				<option value={page.pt}>{page.label} - {page.mm[0]}x{page.mm[1]}mm</option>
			{/each}
		</select>

		<div class="dbl-input row acenter nowrap xfill">
			<div class="input-wrapper row acenter nowrap">
				<input
					class="size-input outline"
					type="number"
					steps="0.01"
					min="0"
					id="width"
					bind:value={freeWidth}
					on:change={sizeToPt}
				/>
				<label for="width">x</label>
			</div>

			<div class="input-wrapper row acenter nowrap">
				<input
					class="size-input outline"
					type="number"
					steps="0.01"
					min="0"
					id="height"
					bind:value={freeHeight}
					on:change={sizeToPt}
				/>
				<label for="height">mm</label>
			</div>
		</div>

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

		<div class="row jbetween acenter xfill">
			<label for="tablePrint">Table Print</label>
			<input type="checkbox" id="tablePrint" bind:checked={$options.tablePrint} />
		</div>

		{#if $options.tablePrint}
			<select class="outline xfill" bind:value={$options.tableSize}>
				{#each pageSizes as page}
					<option value={page.pt}>{page.label} - {page.mm[0]}x{page.mm[1]}mm</option>
				{/each}
			</select>

			<div class="col xfill">
				<label for="columns">Columns</label>
				<input
					class="outline xfill"
					type="number"
					min="1"
					id="columns"
					bind:value={$options.columns}
				/>
			</div>

			<div class="col xfill">
				<label for="rows">Rows</label>
				<input class="outline xfill" type="number" min="1" id="rows" bind:value={$options.rows} />
			</div>

			<div class="col xfill">
				<label for="gap">Gap (mm)</label>
				<input class="outline xfill" type="number" min="1" id="gap" bind:value={$options.gap} />
			</div>

			<button class="sec xfill" on:click={newPdf}>PREPARE TABLE</button>
		{/if}

		<button class="sec-outline xfill" on:click={newPdf}>RESET</button>
	</aside>
</div>

<style lang="scss">
	.scroll {
		width: 300px;
	}

	aside {
		gap: 20px;
		accent-color: var(--color-sec);
		padding: 20px;
	}

	.dbl-input {
		gap: 10px;
		margin-top: -10px;

		input {
			width: 100%;
			margin-right: 10px;
			padding-left: 10px;
			padding-right: 10px;
		}
	}
</style>

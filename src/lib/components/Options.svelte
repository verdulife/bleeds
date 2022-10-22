<script>
	import { options, queue } from '$lib/stores';
	import {
		PDFDocument,
		PageSizes,
		degrees,
		moveTo,
		lineTo,
		clipEvenOdd,
		closePath,
		endPath,
		popGraphicsState,
		pushGraphicsState
	} from 'pdf-lib';
	import { readFile, mm, addCropMarks, addBleeds } from '$lib/utils';
	import { onMount } from 'svelte';

	let doc, docPages;
	let { docSize } = $options;

	async function createPdf() {
		doc = await PDFDocument.create();
		$queue.src = undefined;
	}

	onMount(createPdf);

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

	$: if (docPages && $options.docSize !== docSize) resizeDoc();

	async function processFiles(rawFiles) {
		for (let r = 0; r < rawFiles.length; r++) {
			$queue.message = `Processing file ${r + 1} of ${rawFiles.length}`;

			const rawFile = rawFiles[r];
			const type = rawFile.type.split('/')[1];
			const fileBuffer = await readFile(rawFile);

			let embedImage;
			let pdfPages;

			if (type === 'pdf') {
				const loadedPdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
				pdfPages = loadedPdf.getPages();
			} else if (type === 'jpeg') embedImage = await doc.embedJpg(fileBuffer);
			else if (type === 'png') embedImage = await doc.embedPng(fileBuffer);

			if (embedImage) {
				const newPage = doc.addPage(docSize);
				const isHorizontal = embedImage.width > embedImage.height;
				const rotateImage = $options.autoRotate && isHorizontal;
				const mediaSize = mm(12);
				const bleedSize = mm(6);

				if ($options.bleeds) {
					newPage.setMediaBox(0, 0, docSize[0] + mediaSize, docSize[1] + mediaSize);
					newPage.setBleedBox(mm(3), mm(3), docSize[0] + bleedSize, docSize[1] + bleedSize);
					newPage.setTrimBox(mm(6), mm(6), docSize[0], docSize[1]);
				}

				const printWidth = rotateImage ? embedImage.height : embedImage.width;
				const printHeight = rotateImage ? embedImage.width : embedImage.height;
				const imgWidthScale = newPage.getTrimBox().width / printWidth;
				const imgHeightScale = newPage.getTrimBox().height / printHeight;
				const imgScale = $options.fit
					? Math.max(imgWidthScale, imgHeightScale)
					: Math.min(imgWidthScale, imgHeightScale);
				const imgSize = embedImage.scale(imgScale);

				if (rotateImage) {
					if ($options.bleeds) {
						newPage.setMediaBox(0, 0, docSize[1] + mediaSize, docSize[0] + mediaSize);
						newPage.setBleedBox(mm(3), mm(3), docSize[1] + bleedSize, docSize[0] + bleedSize);
						newPage.setTrimBox(mm(6), mm(6), docSize[1], docSize[0]);
					} else newPage.setSize(docSize[1], docSize[0]);

					newPage.setRotation(degrees(90));
				}

				const cropDistance = $options.bleeds ? mm(3) : 0;
				newPage.pushOperators(
					pushGraphicsState(),
					moveTo(cropDistance, cropDistance),
					lineTo(newPage.getMediaBox().width - cropDistance, cropDistance),
					lineTo(
						newPage.getMediaBox().width - cropDistance,
						newPage.getMediaBox().height - cropDistance
					),
					lineTo(cropDistance, newPage.getMediaBox().height - cropDistance),
					closePath(),
					clipEvenOdd(),
					endPath()
				);

				addBleeds({
					page: newPage,
					art: embedImage,
					imgSize,
					bleeds: $options.bleeds,
					mirror: $options.mirrorBleed
				});

				newPage.pushOperators(popGraphicsState());

				if ($options.bleeds) addCropMarks(newPage);
			}

			if (pdfPages) {
				for (let p = 0; p < pdfPages.length; p++) {
					$queue.message = `Processing page ${p} of ${pdfPages.length} from file ${r + 1} of ${
						rawFiles.length
					}`;

					const page = await doc.embedPage(pdfPages[p]);
					const newPage = doc.addPage($options.docSize);
					const isHorizontal = page.width > page.height;
					const rotateImage = $options.autoRotate && isHorizontal;
					const printWidth = rotateImage ? page.height : page.width;
					const printHeight = rotateImage ? page.width : page.height;
					const imgWidthScale = $options.docSize[0] / printWidth;
					const imgHeightScale = $options.docSize[1] / printHeight;
					const imgScale = $options.fit
						? Math.max(imgWidthScale, imgHeightScale)
						: Math.min(imgWidthScale, imgHeightScale);
					const imgSize = page.scale(imgScale);

					if (rotateImage) {
						newPage.setSize($options.docSize[1], $options.docSize[0]);
						newPage.setRotation(degrees(90));
					}

					newPage.drawPage(page, {
						x: newPage.getWidth() / 2 - imgSize.width / 2,
						y: newPage.getHeight() / 2 - imgSize.height / 2,
						width: imgSize.width,
						height: imgSize.height
					});
				}
			}

			embedImage = undefined;
			pdfPages = undefined;
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
		<label for="bleeds">Bleeds</label>
		<input type="checkbox" id="bleeds" bind:checked={$options.bleeds} />
	</div>

	{#if $options.bleeds}
		<div class="row jbetween acenter xfill">
			<label for="mirror">Mirror Bleed</label>
			<input type="checkbox" id="mirror" bind:checked={$options.mirrorBleed} />
		</div>
	{/if}

	<button class="sec xfill" on:click={loadFile}>ADD</button>
	<button class="sec-outline xfill" on:click={createPdf}>RESET</button>
</aside>

<style lang="scss">
	aside {
		width: 300px;
		gap: 20px;
		accent-color: var(--color-sec);
		padding: 20px;
	}
</style>

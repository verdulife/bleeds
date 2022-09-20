<script>
	import { PDFDocument, PageSizes, degrees } from 'pdf-lib';
	import { onMount } from 'svelte';

	let src, doc;
	let selectedSize = PageSizes.A6;
	let statusmessage = 'Nothing to process';

	function updateStatus(message) {
		statusmessage = message;
	}

	async function createPdf() {
		doc = await PDFDocument.create();
	}

	onMount(createPdf);

	async function processPdf(doc) {
		const pdfDataUri = await doc.saveAsBase64({ dataUri: true });
		const res = await fetch(pdfDataUri);
		const blob = await res.blob();
		const url = URL.createObjectURL(blob);
		src = url + '#view=fit';
	}

	function readFile(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = () => {
				resolve(reader.result);
			};

			reader.onerror = reject;

			reader.readAsArrayBuffer(file);
		});
	}

	function loadFile() {
		const input = document.createElement('input');
		input.type = 'file';
		input.multiple = true;
		input.accept = 'image/jpeg,image/png,application/pdf';
		input.click();

		input.onchange = async () => {
			const rawFiles = Array.from(input.files);

			for (let i = 0; i < rawFiles.length; i++) {
				updateStatus(`Processing image ${i + 1} of ${rawFiles.length}`);

				const rawFile = rawFiles[i];
				const newPage = doc.addPage(selectedSize);
				const { type } = rawFile;

				if (type === 'application/pdf') console.log('Is PDF');
				else console.log('Is image');

				const fileBuffer = await readFile(rawFile);
				const embedImage = await doc.embedJpg(fileBuffer);
				const isHorizontal = embedImage.width > embedImage.height;
				const printWidth = isHorizontal ? embedImage.height : embedImage.width;
				const printHeight = isHorizontal ? embedImage.width : embedImage.height;
				const imgWidthScale = selectedSize[0] / printWidth;
				const imgHeightScale = selectedSize[1] / printHeight;
				const imgScale = Math.max(imgWidthScale, imgHeightScale);
				const imgSize = embedImage.scale(imgScale);

				if (isHorizontal) {
					newPage.setSize(selectedSize[1], selectedSize[0]);
					newPage.setRotation(degrees(90));
				}

				newPage.drawImage(embedImage, {
					x: newPage.getWidth() / 2 - imgSize.width / 2,
					y: newPage.getHeight() / 2 - imgSize.height / 2,
					width: imgSize.width,
					height: imgSize.height
				});
			}

			processPdf(doc);
			updateStatus('Nothing to process');
		};
	}

	$: if (selectedSize) createPdf();
</script>

<section class="viewport row nowrap">
	<aside class="yfill">
		<button class="sec xfill" on:click={loadFile}>ADD</button>

		<select class="outline xfill" bind:value={selectedSize}>
			{#each Object.entries(PageSizes) as [key, value]}
				<option {value}>{key}</option>
			{/each}
		</select>
	</aside>

	<article class="col grow yfill">
		<div class="status xfill tcenter">{statusmessage}</div>

		{#if src}
			<iframe class="fill" {src} title="=PDF preview" />
		{/if}
	</article>
</section>

<style lang="scss">
	aside {
		width: 300px;
		padding: 20px;
	}

	iframe {
		border: none;
	}

	article {
		background: #000;
	}

	.status {
		background: var(--color-sec);
		color: #fff;
		padding: 5px;
	}
</style>

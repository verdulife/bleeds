<script>
	import { PDFDocument, PageSizes } from 'pdf-lib';
	import { onMount } from 'svelte';

	let src, doc, page;
	let selectedSize = PageSizes.A6;

	async function createPdf() {
		doc = await PDFDocument.create();
		page = doc.addPage(selectedSize);

		const pdfDataUri = await doc.saveAsBase64({ dataUri: true });
		src = pdfDataUri + '#view=fit';
	}

	onMount(createPdf);

	function readFile(file) {
		return new Promise((resolve, reject) => {
			let reader = new FileReader();

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
		input.accept = 'image/jpeg,image/png,application/pdf';
		input.click();

		input.onchange = async () => {
			const rawFile = input.files[0];
			const { type } = rawFile;

			if (type === 'application/pdf') console.log('Is PDF');
			else console.log('Is image');

			const fileBuffer = await readFile(rawFile);
			const embedImage = await doc.embedJpg(fileBuffer);
			const imgWidthScale = selectedSize[0] / embedImage.width;
			const imgHeightScale = selectedSize[1] / embedImage.height;
			const imgScale = Math.max(imgWidthScale, imgHeightScale);
			const imgSize = embedImage.scale(imgScale);

			page.drawImage(embedImage, {
				x: page.getWidth() / 2 - imgSize.width / 2,
				y: page.getHeight() / 2 - imgSize.height / 2,
				width: imgSize.width,
				height: imgSize.height
			});

			const pdfDataUri = await doc.saveAsBase64({ dataUri: true });
			src = pdfDataUri + '#view=fit';
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

	{#if src}
		<iframe class="grow yfill" {src} title="=PDF preview" />
	{/if}
</section>

<style lang="scss">
	aside {
		width: 300px;
		padding: 20px;
	}

	iframe {
		border: none;
	}
</style>

<script>
	import { PDFDocument, PageSizes, degrees } from 'pdf-lib';
	import { onMount } from 'svelte';

	let src, doc, docPages;
	let selectedSize = PageSizes.A6;
	let statusmessage = 'Start adding images or pdfs';
	let autoRotate = true;
	let fit = true;

	function updateStatus(message) {
		statusmessage = message;
	}

	async function createPdf() {
		doc = await PDFDocument.create();
		src = undefined;
		updateStatus('Start adding images or pdfs');
	}

	onMount(createPdf);

	async function processPdf() {
		const pdfDataUri = await doc.saveAsBase64({ dataUri: true });
		const res = await fetch(pdfDataUri);
		const blob = await res.blob();
		const url = URL.createObjectURL(blob);
		src = url + '#view=fit';
		docPages = doc.pageCount;
		updateStatus(`${docPages} Pages loaded`);
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

			for (let r = 0; r < rawFiles.length; r++) {
				updateStatus(`Processing image ${r + 1} of ${rawFiles.length}`);

				const rawFile = rawFiles[r];
				const type = rawFile.type.split('/')[1];
				const fileBuffer = await readFile(rawFile);

				console.log(`Is ${type}`);

				let embedImage;
				let pdfPages;

				if (type === 'pdf') {
					const loadedPdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
					pdfPages = loadedPdf.getPages();
				} else if (type === 'jpeg') embedImage = await doc.embedJpg(fileBuffer);
				else if (type === 'png') embedImage = await doc.embedPng(fileBuffer);

				if (embedImage) {
					const newPage = doc.addPage(selectedSize);
					const isHorizontal = embedImage.width > embedImage.height;
					const rotateImage = autoRotate && isHorizontal;
					const printWidth = rotateImage ? embedImage.height : embedImage.width;
					const printHeight = rotateImage ? embedImage.width : embedImage.height;
					const imgWidthScale = selectedSize[0] / printWidth;
					const imgHeightScale = selectedSize[1] / printHeight;
					const imgScale = fit
						? Math.max(imgWidthScale, imgHeightScale)
						: Math.min(imgWidthScale, imgHeightScale);
					const imgSize = embedImage.scale(imgScale);

					if (rotateImage) {
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

				if (pdfPages) {
					for (let p = 0; p < pdfPages.length; p++) {
						const page = await doc.embedPage(pdfPages[p]);
						const newPage = doc.addPage(selectedSize);
						const isHorizontal = page.width > page.height;
						const rotateImage = autoRotate && isHorizontal;
						const printWidth = rotateImage ? page.height : page.width;
						const printHeight = rotateImage ? page.width : page.height;
						const imgWidthScale = selectedSize[0] / printWidth;
						const imgHeightScale = selectedSize[1] / printHeight;
						const imgScale = fit
							? Math.max(imgWidthScale, imgHeightScale)
							: Math.min(imgWidthScale, imgHeightScale);
						const imgSize = page.scale(imgScale);

						if (rotateImage) {
							newPage.setSize(selectedSize[1], selectedSize[0]);
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
		};
	}

	$: if (selectedSize) createPdf();
</script>

<section class="viewport row nowrap">
	<aside class="col yfill">
		<select class="outline xfill" bind:value={selectedSize}>
			{#each Object.entries(PageSizes) as [key, value]}
				<option {value}>{key}</option>
			{/each}
		</select>

		<div class="row jbetween acenter xfill">
			<label for="autorotate">Autorotate</label>
			<input type="checkbox" id="autorotate" bind:checked={autoRotate} />
		</div>

		<div class="row jbetween acenter xfill">
			<label for="fit">Fit</label>
			<input type="checkbox" id="fit" bind:checked={fit} />
		</div>

		<button class="sec xfill" on:click={loadFile}>ADD</button>
		<button class="sec-outline xfill" on:click={createPdf}>RESET</button>
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
		gap: 20px;
		accent-color: var(--color-sec);
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

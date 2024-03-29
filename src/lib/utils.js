import {
	rgb,
	degrees,
	pushGraphicsState,
	moveTo,
	lineTo,
	closePath,
	clipEvenOdd,
	endPath,
	popGraphicsState
} from 'pdf-lib';
import { get } from 'svelte/store';
import { options } from '$lib/stores';

export function pt2mm(n) {
	return n / 2.834645663;
}

export function mm2pt(n) {
	return n * 2.834645663;
}

function getSize(size) {
	const sizes = {
		cropMark: {
			size: 0,
			distance: 0
		},
		mediaBox: {
			distance: 0,
			width: mm2pt(get(options).docSize[0]) + mm2pt(12),
			height: mm2pt(get(options).docSize[1]) + mm2pt(12)
		},
		bleedBox: {
			distance: mm2pt(3),
			width: mm2pt(get(options).docSize[0]) + mm2pt(6),
			height: mm2pt(get(options).docSize[1]) + mm2pt(6)
		},
		trimBox: {
			distance: mm2pt(6),
			width: mm2pt(get(options).docSize[0]),
			height: mm2pt(get(options).docSize[1])
		}
	}
	return sizes[size];
};

export function readFile(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			resolve(reader.result);
		};

		reader.onerror = reject;

		reader.readAsArrayBuffer(file);
	});
}

export function rotateArt(art) {
	const { autoRotate } = get(options);
	const isHorizontal = art.width > art.height;
	return autoRotate && isHorizontal;
}

export function rotatePage(page, art) {
	const { docSize, bleed } = get(options);
	const width_pt = mm2pt(docSize[0]);
	const height_pt = mm2pt(docSize[1]);

	if (bleed) setBoxSize(page, art);
	else page.setSize(height_pt, width_pt);

	page.setRotation(degrees(90));
}

export function setBoxSize(page, art) {
	const mediaBox = getSize("mediaBox");
	const bleedBox = getSize("bleedBox");
	const trimBox = getSize("trimBox");
	const rotate = rotateArt(art);
	const mediaBoxWidth = rotate ? mediaBox.height : mediaBox.width;
	const mediaBoxHeight = rotate ? mediaBox.width : mediaBox.height;
	const bleedBoxWidth = rotate ? bleedBox.height : bleedBox.width;
	const bleedBoxHeight = rotate ? bleedBox.width : bleedBox.height;
	const trimBoxWidth = rotate ? trimBox.height : trimBox.width;
	const trimBoxHeight = rotate ? trimBox.width : trimBox.height;

	page.setMediaBox(mediaBox.distance, mediaBox.distance, mediaBoxWidth, mediaBoxHeight);
	page.setBleedBox(bleedBox.distance, bleedBox.distance, bleedBoxWidth, bleedBoxHeight);
	page.setTrimBox(trimBox.distance, trimBox.distance, trimBoxWidth, trimBoxHeight);
}

export function getArtSize(page, art) {
	const rotate = rotateArt(art);
	const { fit } = get(options);

	const artWidth = rotate ? art.height : art.width;
	const artHeight = rotate ? art.width : art.height;

	const artWidthScale = fit
		? page.getBleedBox().width / artWidth
		: page.getTrimBox().width / artWidth;
	const artHeightScale = fit
		? page.getBleedBox().height / artHeight
		: page.getTrimBox().height / artHeight;

	const imgScale = fit
		? Math.max(artWidthScale, artHeightScale)
		: Math.min(artWidthScale, artHeightScale);

	return art.scale(imgScale);
}

export function addCropMarks(page) {
	const width = page.getWidth();
	const height = page.getHeight();
	const lineSize = mm2pt(4);
	const lineDistance = mm2pt(6);

	//bottom left
	page.drawLine({
		start: { x: 0, y: lineDistance },
		end: { x: lineSize, y: lineDistance },
		thickness: 0.75,
		color: rgb(1, 1, 1)
	});
	page.drawLine({
		start: { x: 0, y: lineDistance },
		end: { x: lineSize, y: lineDistance },
		thickness: 0.25
	});
	page.drawLine({
		start: { x: lineDistance, y: 0 },
		end: { x: lineDistance, y: lineSize },
		thickness: 0.75,
		color: rgb(1, 1, 1)
	});
	page.drawLine({
		start: { x: lineDistance, y: 0 },
		end: { x: lineDistance, y: lineSize },
		thickness: 0.25
	});

	//bottom right
	page.drawLine({
		start: { x: width, y: lineDistance },
		end: { x: width - lineSize, y: lineDistance },
		thickness: 0.75,
		color: rgb(1, 1, 1)
	});
	page.drawLine({
		start: { x: width, y: lineDistance },
		end: { x: width - lineSize, y: lineDistance },
		thickness: 0.25
	});
	page.drawLine({
		start: { x: width - lineDistance, y: 0 },
		end: { x: width - lineDistance, y: lineSize },
		thickness: 0.75,
		color: rgb(1, 1, 1)
	});
	page.drawLine({
		start: { x: width - lineDistance, y: 0 },
		end: { x: width - lineDistance, y: lineSize },
		thickness: 0.25
	});

	//top left
	page.drawLine({
		start: { x: 0, y: height - lineDistance },
		end: { x: lineSize, y: height - lineDistance },
		thickness: 0.75,
		color: rgb(1, 1, 1)
	});
	page.drawLine({
		start: { x: 0, y: height - lineDistance },
		end: { x: lineSize, y: height - lineDistance },
		thickness: 0.25
	});
	page.drawLine({
		start: { x: lineDistance, y: height },
		end: { x: lineDistance, y: height - lineSize },
		thickness: 0.75,
		color: rgb(1, 1, 1)
	});
	page.drawLine({
		start: { x: lineDistance, y: height },
		end: { x: lineDistance, y: height - lineSize },
		thickness: 0.25
	});

	//top right
	page.drawLine({
		start: { x: width, y: height - lineDistance },
		end: { x: width - lineSize, y: height - lineDistance },
		thickness: 0.75,
		color: rgb(1, 1, 1)
	});
	page.drawLine({
		start: { x: width, y: height - lineDistance },
		end: { x: width - lineSize, y: height - lineDistance },
		thickness: 0.25
	});
	page.drawLine({
		start: { x: width - lineDistance, y: height },
		end: { x: width - lineDistance, y: height - lineSize },
		thickness: 0.75,
		color: rgb(1, 1, 1)
	});
	page.drawLine({
		start: { x: width - lineDistance, y: height },
		end: { x: width - lineDistance, y: height - lineSize },
		thickness: 0.25
	});
}

export function addBleed(page, art, artSize) {
	const boxWidth = page.getMediaBox().width;
	const boxHeight = page.getMediaBox().height;
	const { bleed, mirrorBleed } = get(options);
	const typeName = art.constructor.name.toLowerCase();
	const isEmbededPage = typeName.includes('page');

	function draw(art, opts) {
		if (isEmbededPage) page.drawPage(art, opts);
		else page.drawImage(art, opts);
	}

	//center
	draw(art, {
		x: boxWidth / 2 - artSize.width / 2,
		y: boxHeight / 2 - artSize.height / 2,
		width: artSize.width,
		height: artSize.height
	});

	if (!bleed) return;
	if (!mirrorBleed) return;

	//top-left
	draw(art, {
		x: boxWidth / 2 - artSize.width / 2,
		y: boxHeight / 2 - artSize.height / 2 + artSize.height * 2,
		width: -artSize.width,
		height: -artSize.height
	});

	//center-left
	draw(art, {
		x: boxWidth / 2 - artSize.width / 2,
		y: boxHeight / 2 - artSize.height / 2,
		width: -artSize.width,
		height: artSize.height
	});

	//bottom-left
	draw(art, {
		x: boxWidth / 2 - artSize.width / 2,
		y: boxHeight / 2 - artSize.height / 2,
		width: -artSize.width,
		height: -artSize.height
	});

	//top-center
	draw(art, {
		x: boxWidth / 2 - artSize.width / 2,
		y: boxHeight / 2 - artSize.height / 2 + artSize.height * 2,
		width: artSize.width,
		height: -artSize.height
	});

	//bottom-center
	draw(art, {
		x: boxWidth / 2 - artSize.width / 2,
		y: boxHeight / 2 - artSize.height / 2,
		width: artSize.width,
		height: -artSize.height
	});

	//top-right
	draw(art, {
		x: boxWidth / 2 - artSize.width / 2 + artSize.width * 2,
		y: boxHeight / 2 - artSize.height / 2 + artSize.height * 2,
		width: -artSize.width,
		height: -artSize.height
	});

	//center-right
	draw(art, {
		x: boxWidth / 2 - artSize.width / 2 + artSize.width * 2,
		y: boxHeight / 2 - artSize.height / 2,
		width: -artSize.width,
		height: artSize.height
	});

	//bottom-right
	draw(art, {
		x: boxWidth / 2 - artSize.width / 2 + artSize.width * 2,
		y: boxHeight / 2 - artSize.height / 2,
		width: -artSize.width,
		height: -artSize.height
	});
}

export function drawPdf(page, art, artSize) {
	const { bleed } = get(options);
	const cropDistance = bleed ? mm2pt(3) : 0;

	page.pushOperators(
		pushGraphicsState(),
		moveTo(cropDistance, cropDistance),
		lineTo(page.getMediaBox().width - cropDistance, cropDistance),
		lineTo(page.getMediaBox().width - cropDistance, page.getMediaBox().height - cropDistance),
		lineTo(cropDistance, page.getMediaBox().height - cropDistance),
		closePath(),
		clipEvenOdd(),
		endPath()
	);

	addBleed(page, art, artSize);
}

export async function processEmbedPdf(doc, art) {
	const { docSize, bleed } = get(options);
	const width_pt = mm2pt(docSize[0]);
	const height_pt = mm2pt(docSize[1]);

	for (let p = 0; p < art.length; p++) {
		const embeded = await doc.embedPage(art[p]);
		const newPage = doc.addPage([width_pt, height_pt]);
		const rotate = rotateArt(embeded);
		const artSize = getArtSize(newPage, embeded);

		if (bleed) setBoxSize(newPage, embeded);
		if (rotate) rotatePage(newPage, embeded);

		drawPdf(newPage, embeded, artSize);
		newPage.pushOperators(popGraphicsState());

		if (bleed) addCropMarks(newPage);
	}
}

export function processEmbedImage(doc, art) {
	const { docSize, bleed } = get(options);
	const width_pt = mm2pt(docSize[0]);
	const height_pt = mm2pt(docSize[1]);
	const newPage = doc.addPage([width_pt, height_pt]);
	const rotate = rotateArt(art);
	const artSize = getArtSize(newPage, art);

	if (bleed) setBoxSize(newPage, art);
	if (rotate) rotatePage(newPage, art);

	drawPdf(newPage, art, artSize);
	newPage.pushOperators(popGraphicsState());

	if (bleed) addCropMarks(newPage);
}

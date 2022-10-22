import { rgb } from 'pdf-lib';

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

export function mm(n) {
	return n * 2.834645663;
}

export function addCropMarks(page) {
	const width = page.getWidth();
	const height = page.getHeight();
	const lineSize = mm(4);
	const lineDistance = mm(6);

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

export function addBleeds({ page, art, imgSize, bleeds, mirror }) {
	const docWidth = page.getMediaBox().width;
	const docHeight = page.getMediaBox().height;

	//center
	page.drawImage(art, {
		x: docWidth / 2 - imgSize.width / 2,
		y: docHeight / 2 - imgSize.height / 2,
		width: imgSize.width,
		height: imgSize.height
	});

	if (!bleeds) return;
	if (!mirror) return;

	//top-left
	page.drawImage(art, {
		x: docWidth / 2 - imgSize.width / 2,
		y: docHeight / 2 - imgSize.height / 2 + imgSize.height * 2,
		width: -imgSize.width,
		height: -imgSize.height
	});

	//center-left
	page.drawImage(art, {
		x: docWidth / 2 - imgSize.width / 2,
		y: docHeight / 2 - imgSize.height / 2,
		width: -imgSize.width,
		height: imgSize.height
	});

	//bottom-left
	page.drawImage(art, {
		x: docWidth / 2 - imgSize.width / 2,
		y: docHeight / 2 - imgSize.height / 2,
		width: -imgSize.width,
		height: -imgSize.height
	});

	//top-center
	page.drawImage(art, {
		x: docWidth / 2 - imgSize.width / 2,
		y: docHeight / 2 - imgSize.height / 2 + imgSize.height * 2,
		width: imgSize.width,
		height: -imgSize.height
	});

	//bottom-center
	page.drawImage(art, {
		x: docWidth / 2 - imgSize.width / 2,
		y: docHeight / 2 - imgSize.height / 2,
		width: imgSize.width,
		height: -imgSize.height
	});

	//top-right
	page.drawImage(art, {
		x: docWidth / 2 - imgSize.width / 2 + imgSize.width * 2,
		y: docHeight / 2 - imgSize.height / 2 + imgSize.height * 2,
		width: -imgSize.width,
		height: -imgSize.height
	});

	//center-right
	page.drawImage(art, {
		x: docWidth / 2 - imgSize.width / 2 + imgSize.width * 2,
		y: docHeight / 2 - imgSize.height / 2,
		width: -imgSize.width,
		height: imgSize.height
	});

	//bottom-right
	page.drawImage(art, {
		x: docWidth / 2 - imgSize.width / 2 + imgSize.width * 2,
		y: docHeight / 2 - imgSize.height / 2,
		width: -imgSize.width,
		height: -imgSize.height
	});
}

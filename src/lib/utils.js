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

export function addBleeds(page) {
	const width = page.getWidth();
	const height = page.getHeight();

	//bottom left
	page.drawLine({
		start: { x: 0, y: mm(4) },
		end: { x: mm(3), y: mm(4) },
		thickness: 0.75,
		color: rgb(1, 1, 1)
	});
	page.drawLine({
		start: { x: 0, y: mm(4) },
		end: { x: mm(3), y: mm(4) },
		thickness: 0.25
	});
	page.drawLine({
		start: { x: mm(4), y: 0 },
		end: { x: mm(4), y: mm(3) },
		thickness: 0.75,
		color: rgb(1, 1, 1)
	});
	page.drawLine({
		start: { x: mm(4), y: 0 },
		end: { x: mm(4), y: mm(3) },
		thickness: 0.25
	});

	//bottom right
	page.drawLine({
		start: { x: width, y: mm(4) },
		end: { x: width - mm(3), y: mm(4) },
		thickness: 0.75,
		color: rgb(1, 1, 1)
	});
	page.drawLine({
		start: { x: width, y: mm(4) },
		end: { x: width - mm(3), y: mm(4) },
		thickness: 0.25
	});
	page.drawLine({
		start: { x: width - mm(4), y: 0 },
		end: { x: width - mm(4), y: mm(3) },
		thickness: 0.75,
		color: rgb(1, 1, 1)
	});
	page.drawLine({
		start: { x: width - mm(4), y: 0 },
		end: { x: width - mm(4), y: mm(3) },
		thickness: 0.25
	});

	//top left
	page.drawLine({
		start: { x: 0, y: height - mm(4) },
		end: { x: mm(3), y: height - mm(4) },
		thickness: 0.75,
		color: rgb(1, 1, 1)
	});
	page.drawLine({
		start: { x: 0, y: height - mm(4) },
		end: { x: mm(3), y: height - mm(4) },
		thickness: 0.25
	});
	page.drawLine({
		start: { x: mm(4), y: height },
		end: { x: mm(4), y: height - mm(3) },
		thickness: 0.75,
		color: rgb(1, 1, 1)
	});
	page.drawLine({
		start: { x: mm(4), y: height },
		end: { x: mm(4), y: height - mm(3) },
		thickness: 0.25
	});

	//top right
	page.drawLine({
		start: { x: width, y: height - mm(4) },
		end: { x: width - mm(3), y: height - mm(4) },
		thickness: 0.75,
		color: rgb(1, 1, 1)
	});
	page.drawLine({
		start: { x: width, y: height - mm(4) },
		end: { x: width - mm(3), y: height - mm(4) },
		thickness: 0.25
	});
	page.drawLine({
		start: { x: width - mm(4), y: height },
		end: { x: width - mm(4), y: height - mm(3) },
		thickness: 0.75,
		color: rgb(1, 1, 1)
	});
	page.drawLine({
		start: { x: width - mm(4), y: height },
		end: { x: width - mm(4), y: height - mm(3) },
		thickness: 0.25
	});
}

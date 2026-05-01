class Trimmer {
	constructor() {}

	static getAlpha(data, width, x, y) {
		return data[y * (width * 4) + x * 4 + 3];
	}

	static getLeftSpace(data, width, height, threshold = 0) {
		let x = 0;

		for (x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				if (Trimmer.getAlpha(data, width, x, y) > threshold) {
					return x;
				}
			}
		}

		return 0;
	}

	static getRightSpace(data, width, height, threshold = 0) {
		let x = 0;

		for (x = width - 1; x >= 0; x--) {
			for (let y = 0; y < height; y++) {
				if (Trimmer.getAlpha(data, width, x, y) > threshold) {
					return width - x - 1;
				}
			}
		}

		return 0;
	}

	static getTopSpace(data, width, height, threshold = 0) {
		let y = 0;

		for (y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				if (Trimmer.getAlpha(data, width, x, y) > threshold) {
					return y;
				}
			}
		}

		return 0;
	}

	static getBottomSpace(data, width, height, threshold = 0) {
		let y = 0;

		for (y = height - 1; y >= 0; y--) {
			for (let x = 0; x < width; x++) {
				if (Trimmer.getAlpha(data, width, x, y) > threshold) {
					return height - y - 1;
				}
			}
		}

		return 0;
	}

	static trim(rects, threshold = 0) {
		const cns = document.createElement("canvas");
		const ctx = cns.getContext("2d");

		for (const item of rects) {
			const img = item.image;

			cns.width = img.width;
			cns.height = img.height;

			ctx.clearRect(0, 0, img.width, img.height);

			ctx.drawImage(
				img,
				0,
				0,
				img.width,
				img.height,
				0,
				0,
				img.width,
				img.height,
			);

			const data = ctx.getImageData(0, 0, img.width, img.height).data;

			const spaces = { left: 0, right: 0, top: 0, bottom: 0 };

			spaces.left = Trimmer.getLeftSpace(
				data,
				img.width,
				img.height,
				threshold,
			);
			if (spaces.left !== img.width) {
				spaces.right = Trimmer.getRightSpace(
					data,
					img.width,
					img.height,
					threshold,
				);
				spaces.top = Trimmer.getTopSpace(
					data,
					img.width,
					img.height,
					threshold,
				);
				spaces.bottom = Trimmer.getBottomSpace(
					data,
					img.width,
					img.height,
					threshold,
				);

				if (
					spaces.left > 0 ||
					spaces.right > 0 ||
					spaces.top > 0 ||
					spaces.bottom > 0
				) {
					item.trimmed = true;
					item.spriteSourceSize.x = spaces.left;
					item.spriteSourceSize.y = spaces.top;
					item.spriteSourceSize.w = img.width - spaces.left - spaces.right;
					item.spriteSourceSize.h = img.height - spaces.top - spaces.bottom;
				}
			} else {
				item.trimmed = true;
				item.spriteSourceSize.x = 0;
				item.spriteSourceSize.y = 0;
				item.spriteSourceSize.w = 1;
				item.spriteSourceSize.h = 1;
			}

			if (item.trimmed) {
				item.frame.w = item.spriteSourceSize.w;
				item.frame.h = item.spriteSourceSize.h;
			}
		}
	}
}

export default Trimmer;

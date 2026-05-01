import allPackers from "./packers";
import MaxRectsBinPack from "./packers/MaxRectsBin";
import OptimalPacker from "./packers/OptimalPacker";
import I18 from "./utils/I18";
import TextureRenderer from "./utils/TextureRenderer";
import Trimmer from "./utils/Trimmer";

class PackProcessor {
	static detectIdentical(rects) {
		const identical = [];

		for (let i = 0; i < rects.length; i++) {
			const rect1 = rects[i];
			for (let n = i + 1; n < rects.length; n++) {
				const rect2 = rects[n];
				if (
					rect1.image._base64 === rect2.image._base64 &&
					identical.indexOf(rect2) < 0
				) {
					rect2.identical = rect1;
					identical.push(rect2);
				}
			}
		}

		for (const rect of identical) {
			rects.splice(rects.indexOf(rect), 1);
		}

		return {
			rects: rects,
			identical: identical,
		};
	}

	static applyIdentical(rects, identical) {
		const clones = [];
		const removeIdentical = [];

		for (const item of identical) {
			const ix = rects.indexOf(item.identical);
			if (ix >= 0) {
				const rect = rects[ix];

				const clone = Object.assign({}, rect);

				clone.name = item.name;
				clone.image = item.image;
				clone.originalFile = item.file;
				clone.skipRender = true;

				removeIdentical.push(item);
				clones.push(clone);
			}
		}

		for (const item of removeIdentical) {
			identical.splice(identical.indexOf(item), 1);
		}

		for (const item of clones) {
			item.cloned = true;
			rects.push(item);
		}

		return rects;
	}

	static pack(images = {}, options = {}, onComplete = null, onError = null) {
		let rects = [];

		const padding = options.padding || 0;
		const extrude = options.extrude || 0;

		let maxWidth = 0,
			maxHeight = 0;
		let minWidth = 0,
			minHeight = 0;

		let alphaThreshold = options.alphaThreshold || 0;
		if (alphaThreshold > 255) alphaThreshold = 255;

		const names = Object.keys(images).sort();

		for (const key of names) {
			const img = images[key];

			const name = key.split(".")[0];

			maxWidth += img.width;
			maxHeight += img.height;

			if (img.width > minWidth)
				minWidth = img.width + padding * 2 + extrude * 2;
			if (img.height > minHeight)
				minHeight = img.height + padding * 2 + extrude * 2;

			rects.push({
				frame: { x: 0, y: 0, w: img.width, h: img.height },
				rotated: false,
				trimmed: false,
				spriteSourceSize: { x: 0, y: 0, w: img.width, h: img.height },
				sourceSize: { w: img.width, h: img.height },
				name: name,
				file: key,
				image: img,
			});
		}

		let width = options.width || 0;
		let height = options.height || 0;

		if (!width) width = maxWidth;
		if (!height) height = maxHeight;

		if (options.powerOfTwo) {
			const sw = Math.round(Math.log(width) / Math.log(2));
			const sh = Math.round(Math.log(height) / Math.log(2));

			let pw = 2 ** sw;
			let ph = 2 ** sh;

			if (pw < width) pw = 2 ** (sw + 1);
			if (ph < height) ph = 2 ** (sh + 1);

			width = pw;
			height = ph;
		}

		if (width < minWidth || height < minHeight) {
			if (onError)
				onError({
					description: I18.f("INVALID_SIZE_ERROR", minWidth, minHeight),
				});
			return;
		}

		if (options.allowTrim) {
			Trimmer.trim(rects, alphaThreshold);
		}

		for (const item of rects) {
			item.frame.w += padding * 2 + extrude * 2;
			item.frame.h += padding * 2 + extrude * 2;
		}

		let identical = [];

		if (options.detectIdentical) {
			const res = PackProcessor.detectIdentical(rects);

			rects = res.rects;
			identical = res.identical;
		}

		const getAllPackers = () => {
			const methods = [];
			for (const packerClass of allPackers) {
				if (packerClass !== OptimalPacker) {
					for (const method in packerClass.methods) {
						methods.push({
							packerClass,
							packerMethod: packerClass.methods[method],
							allowRotation: false,
						});
						if (options.allowRotation) {
							methods.push({
								packerClass,
								packerMethod: packerClass.methods[method],
								allowRotation: true,
							});
						}
					}
				}
			}
			return methods;
		};

		const packerClass = options.packer || MaxRectsBinPack;
		const packerMethod =
			options.packerMethod || MaxRectsBinPack.methods.BestShortSideFit;
		const packerCombos =
			packerClass === OptimalPacker
				? getAllPackers()
				: [{ packerClass, packerMethod, allowRotation: options.allowRotation }];

		let optimalRes;
		let optimalSheets = Infinity;
		let optimalEfficiency = 0;

		let sourceArea = 0;
		for (const rect of rects) {
			sourceArea += rect.sourceSize.w * rect.sourceSize.h;
		}

		for (const combo of packerCombos) {
			const res = [];
			let sheetArea = 0;

			// duplicate rects if more than 1 combo since the array is mutated in pack()
			const _rects =
				packerCombos.length > 1
					? rects.map((rect) => {
							return Object.assign({}, rect, {
								frame: Object.assign({}, rect.frame),
								spriteSourceSize: Object.assign({}, rect.spriteSourceSize),
								sourceSize: Object.assign({}, rect.sourceSize),
							});
						})
					: rects;

			// duplicate identical if more than 1 combo and fix references to point to the
			//  cloned rects since the array is mutated in applyIdentical()
			const _identical =
				packerCombos.length > 1
					? identical.map((rect) => {
							for (const rect2 of _rects) {
								if (rect.identical.image._base64 == rect2.image._base64) {
									return Object.assign({}, rect, { identical: rect2 });
								}
							}
						})
					: identical;

			while (_rects.length) {
				const packer = new combo.packerClass(
					width,
					height,
					combo.allowRotation,
				);
				let result = packer.pack(_rects, combo.packerMethod);

				for (const item of result) {
					item.frame.x += padding + extrude;
					item.frame.y += padding + extrude;
					item.frame.w -= padding * 2 + extrude * 2;
					item.frame.h -= padding * 2 + extrude * 2;
				}

				if (options.detectIdentical) {
					result = PackProcessor.applyIdentical(result, _identical);
				}

				res.push(result);

				for (const item of result) {
					PackProcessor.removeRect(_rects, item.name);
				}

				const { width: sheetWidth, height: sheetHeight } =
					TextureRenderer.getSize(result, options);
				sheetArea += sheetWidth * sheetHeight;
			}

			const sheets = res.length;
			const efficiency = sourceArea / sheetArea;

			if (
				sheets < optimalSheets ||
				(sheets === optimalSheets && efficiency > optimalEfficiency)
			) {
				optimalRes = res;
				optimalSheets = sheets;
				optimalEfficiency = efficiency;
			}
		}

		if (onComplete) {
			onComplete(optimalRes);
		}
	}

	static removeRect(rects, name) {
		for (let i = 0; i < rects.length; i++) {
			if (rects[i].name === name) {
				rects.splice(i, 1);
				return;
			}
		}
	}
}

export default PackProcessor;

import * as plist from "plist";
import Splitter from "./Splitter";

class UIKit extends Splitter {
	static check(data, cb) {
		try {
			const atlas = plist.parse(data);

			if (atlas && atlas.frames) {
				const names = Object.keys(atlas.frames);
				const frame = atlas.frames[names[0]];

				if (!frame) {
					cb(false);
					return;
				}

				cb(
					frame.x !== undefined &&
						frame.y !== undefined &&
						frame.w !== undefined &&
						frame.h !== undefined &&
						frame.oX !== undefined &&
						frame.oY !== undefined &&
						frame.oW !== undefined &&
						frame.oH !== undefined,
				);
			}

			cb(false);
		} catch (e) {
			cb(false);
		}
	}

	static split(data, options, cb) {
		const res = [];

		try {
			const atlas = plist.parse(data);
			const names = Object.keys(atlas.frames);

			for (const name of names) {
				const item = atlas.frames[name];

				const trimmed = item.w < item.oW || item.h < item.oH;

				res.push({
					name: Splitter.fixFileName(name),
					frame: {
						x: item.x,
						y: item.y,
						w: item.w,
						h: item.h,
					},
					spriteSourceSize: {
						x: item.oX,
						y: item.oY,
						w: item.w,
						h: item.h,
					},
					sourceSize: {
						w: item.oW,
						h: item.oH,
					},
					trimmed: trimmed,
					rotated: false,
				});
			}
		} catch (e) {}

		cb(res);
	}

	static get type() {
		return "UIKit";
	}
}

export default UIKit;

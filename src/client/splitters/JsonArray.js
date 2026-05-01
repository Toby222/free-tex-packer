import Splitter from "./Splitter";

class JsonArray extends Splitter {
	static check(data, cb) {
		try {
			const json = JSON.parse(data);
			cb(json && json.frames && Array.isArray(json.frames));
		} catch (e) {
			cb(false);
		}
	}

	static split(data, options, cb) {
		const res = [];

		try {
			const json = JSON.parse(data);

			for (const item of json.frames) {
				item.name = Splitter.fixFileName(item.filename);
				res.push(item);
			}
		} catch (e) {}

		cb(res);
	}

	static get type() {
		return "JSON (array)";
	}
}

export default JsonArray;

import Splitter from "./Splitter";

class JsonHash extends Splitter {
	static check(data, cb) {
		try {
			const json = JSON.parse(data);
			cb(json && json.frames && !Array.isArray(json.frames));
		} catch (e) {
			cb(false);
		}
	}

	static split(data, options, cb) {
		const res = [];

		try {
			const json = JSON.parse(data);

			const names = Object.keys(json.frames);

			for (const name of names) {
				const item = json.frames[name];

				item.name = Splitter.fixFileName(name);
				res.push(item);
			}
		} catch (e) {}

		cb(res);
	}

	static get type() {
		return "JSON (hash)";
	}
}

export default JsonHash;

const fs = require("fs");
const chokidar = require("chokidar");
const { dialog } = require("electron").remote;

import Controller from "platform/Controller";
import { GLOBAL_EVENT, Observer } from "../../Observer";
import Base64ImagesLoader from "../../utils/Base64ImagesLoader";
import I18 from "../../utils/I18";

const IMAGES_EXT = ["jpg", "png", "gif"];

let watcher = null;

class FileSystem {
	static fixPath(path) {
		return path.split("\\").join("/");
	}

	static getExtFromPath(path) {
		return path.split(".").pop().toLowerCase();
	}

	static selectFolder() {
		const dir = dialog.showOpenDialog({
			properties: ["openDirectory"],
		});
		return dir;
	}

	static getFolderFilesList(dir, base = "", list = []) {
		const files = fs.readdirSync(dir);
		for (const file of files) {
			if (
				fs.statSync(dir + file).isDirectory() &&
				(dir + file).toUpperCase().indexOf("__MACOSX") < 0
			) {
				list = FileSystem.getFolderFilesList(
					dir + file + "/",
					base + file + "/",
					list,
				);
			} else {
				list.push({
					name: (base ? base : "") + file,
					path: dir + file,
				});
			}
		}

		return list;
	}

	static addImages(cb) {
		const list = dialog.showOpenDialog({
			filters: [{ name: I18.f("IMAGES"), extensions: IMAGES_EXT }],
			properties: ["openFile", "multiSelections"],
		});

		if (list) {
			const files = [];
			for (let path of list) {
				path = FileSystem.fixPath(path);
				const name = path.split("/").pop();

				files.push({
					name: name,
					path: path,
					folder: "",
				});
			}

			FileSystem.loadImages(files, cb);
		} else {
			if (cb) cb();
		}
	}

	static addFolder(cb) {
		const dir = dialog.showOpenDialog({
			properties: ["openDirectory"],
		});

		if (dir && dir.length) {
			const path = FileSystem.fixPath(dir[0]);
			FileSystem.loadFolder(path, cb);
		} else {
			if (cb) cb();
		}
	}

	static startWatch(path) {
		try {
			if (!watcher) {
				watcher = chokidar.watch(path, { ignoreInitial: true });
				watcher.on("all", FileSystem.onWatchEvent);
			} else {
				watcher.add(path);
			}
		} catch (e) {}
	}

	static stopWatch(path) {
		if (watcher) {
			watcher.unwatch(path);
		}
	}

	static terminateWatch() {
		if (watcher) {
			watcher.close();
			watcher = null;
		}
	}

	static onWatchEvent(event, path) {
		Observer.emit(GLOBAL_EVENT.FS_CHANGES, {
			event: event,
			path: FileSystem.fixPath(path),
		});
	}

	static loadImages(list, cb) {
		const files = [];

		for (const item of list) {
			const path = item.path;
			const ext = FileSystem.getExtFromPath(path);

			if (IMAGES_EXT.indexOf(ext) >= 0) {
				if (!item.folder) FileSystem.startWatch(path);

				try {
					let content = fs.readFileSync(path, "base64");
					content = "data:image/" + ext + ";base64," + content;
					files.push({ name: item.name, url: content, fsPath: item });
				} catch (e) {}
			}
		}

		const loader = new Base64ImagesLoader();
		loader.load(files, null, (res) => {
			if (cb) cb(res);
		});
	}

	static loadFolder(path, cb) {
		if (fs.existsSync(path)) {
			FileSystem.startWatch(path);

			const parts = path.split("/");
			let name = "";
			while (parts.length && !name) name = parts.pop();

			const list = FileSystem.getFolderFilesList(path + "/", name + "/");

			for (const item of list) {
				item.folder = path;
			}

			FileSystem.loadImages(list, cb);
		} else {
			cb({});
		}
	}

	static saveProject(data, path = "") {
		const options = {
			filters: [{ name: "Free texture packer", extensions: ["ftpp"] }],
		};

		if (!path) {
			path = dialog.showSaveDialog(options);
		}

		if (path) {
			path = FileSystem.fixPath(path);

			try {
				fs.writeFileSync(path, JSON.stringify(data, null, 2));
				Controller.updateProject(path);
			} catch (e) {}
		}

		return path;
	}

	static loadProject(pathToLoad = "") {
		let path;

		if (pathToLoad) {
			path = FileSystem.fixPath(pathToLoad);
		} else {
			path = dialog.showOpenDialog({
				filters: [{ name: "Free texture packer", extensions: ["ftpp"] }],
				properties: ["openFile"],
			});

			if (path && path[0]) {
				path = FileSystem.fixPath(path[0]);
			}
		}

		let data = null;

		if (path) {
			try {
				data = fs.readFileSync(path);
				data = JSON.parse(data);
				Controller.updateProject(path);
			} catch (e) {
				data = null;
			}
		}

		return { path, data };
	}
}

export default FileSystem;

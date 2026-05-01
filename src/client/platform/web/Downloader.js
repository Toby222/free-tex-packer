import FileSaver from "file-saver";
import JSZip from "jszip";

class Downloader {
	static run(files, fileName) {
		const zip = new JSZip();

		for (const file of files) {
			zip.file(file.name, file.content, { base64: !!file.base64 });
		}

		const ext = fileName.split(".").pop();
		if (ext !== "zip") fileName = fileName + ".zip";

		zip.generateAsync({ type: "blob" }).then((content) => {
			FileSaver.saveAs(content, fileName);
		});
	}
}

export default Downloader;

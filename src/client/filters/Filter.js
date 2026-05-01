class Filter {
	constructor() {}

	apply(buffer) {
		const retCanvas = document.createElement("canvas");
		const retCtx = retCanvas.getContext("2d");

		retCanvas.width = buffer.width;
		retCanvas.height = buffer.height;

		const bufferCtx = buffer.getContext("2d");
		const imageData = bufferCtx.getImageData(0, 0, buffer.width, buffer.height);

		retCtx.putImageData(this.applyImageData(imageData), 0, 0);

		return retCanvas;
	}

	applyImageData(imageData) {
		return imageData;
	}

	static get type() {
		return "none";
	}
}

export default Filter;

import Filter from "./Filter";
import Grayscale from "./Grayscale";
import Mask from "./Mask";

const list = [Filter, Mask, Grayscale];

function getFilterByType(type) {
	for (const item of list) {
		if (item.type === type) {
			return item;
		}
	}
	return null;
}

export { getFilterByType };
export default list;

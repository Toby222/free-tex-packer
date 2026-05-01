import MaxRectsBin from "./MaxRectsBin";
import MaxRectsPacker from "./MaxRectsPacker";
import OptimalPacker from "./OptimalPacker";

const list = [MaxRectsBin, MaxRectsPacker, OptimalPacker];

function getPackerByType(type) {
	for (const item of list) {
		if (item.type === type) {
			return item;
		}
	}
	return null;
}

export { getPackerByType };
export default list;

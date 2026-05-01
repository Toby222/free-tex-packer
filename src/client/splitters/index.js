import Grid from "./Grid";
import JsonArray from "./JsonArray";
import JsonHash from "./JsonHash";
import Spine from "./Spine";
import UIKit from "./UIKit";
import XML from "./XML";

const list = [Grid, JsonHash, JsonArray, XML, UIKit, Spine];

function getSplitterByType(type) {
	for (const item of list) {
		if (item.type === type) {
			return item;
		}
	}
	return null;
}

function getSplitterByData(data, cb) {
	for (const item of list) {
		if (item.type !== Grid.type) {
			item.check(data, (checked) => {
				if (checked) {
					if (cb) {
						cb(item);
						cb = null;
					}
				}
			});
		}
	}

	return getDefaultSplitter();
}

function getDefaultSplitter() {
	return Grid;
}

export { getDefaultSplitter, getSplitterByData, getSplitterByType };
export default list;

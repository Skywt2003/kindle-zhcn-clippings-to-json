// Lifted from https://github.com/sawyerh/highlights/blob/main/packages/kindle-clippings-to-json/kindle-my-clippings.js
"use strict";

const Clip = function () {};

Clip.prototype.splitFileIntoRecords = function (data) {
	// @todo check if file is kindle clippings valid format, contains ========== (take from tests ?)
	return data.split("==========\n");
};

Clip.prototype.splitRecord = function (record) {
	const lines = record.split(/\n\n|\n-/);
	const trimmedLines = [];

	for (let j = 0; j < lines.length; j++) {
		const l = lines[j];
		if (l !== "") {
			trimmedLines.push(l.trim().replace(/\n/g, " "));
		}
	}

	return trimmedLines;
};

Clip.prototype.getFirstLine = function (lines) {
	if (lines[0] !== undefined) {
		const t = lines[0].split(" (");
		const author = t[1] ? t[1].slice(0, -1) : "";
		return {
			title: t[0],
			author: author,
		};
	} else {
		return false;
	}
};

Clip.prototype.getSecondLine = function (lines) {
	if (lines[1] !== undefined) {
		const t = lines[1].split("|");

		const singleRecord = {};
		for (let y = 0; y < t.length; y++) {
			const el = t[y];
			// Examples
            // * 您在第 2 页（位置 #37-#38）的标注 | 添加于 2018年12月31日星期一 下午11:56:41
            // * 您在位置 #37-#38的标注 | 添加于 2018年12月31日星期一 下午11:56:41

			// type: Highlight | Bookmark | Note
			if (el.match(/标注/)) {
				singleRecord.type = "Highlight";
			} else if (el.match(/书签/)) {
				singleRecord.type = "Bookmark";
			} else if (el.match(/笔记/)) {
				singleRecord.type = "Note";
			}

			// on Page (if exists)
			if (el.match(/您在第/)) {
				const matchResult = el.match(/您在第(.*?)页/);
				singleRecord.page = this.trim(matchResult[1]);
			}

			// location
			if (el.match(/位置/)) {
                if (el.match(/#(\d+)-(\d+)/)){
                    const matchResult = el.match(/#(\d+)-(\d+)/);
                    singleRecord.start = this.trim(matchResult[1]);
                    singleRecord.end = this.trim(matchResult[2]);
                } else {
                    const matchResult = el.match(/#(\d+)/);
                    singleRecord.start = this.trim(matchResult[1]);
                }
			}

            // time
            if (el.match(/添加于/)) {
                const t = el.split("添加于");
                singleRecord.time = parseDateString(this.trim(t.pop()));
            }
		}
		return singleRecord;
	} else {
		return false;
	}
};

Clip.prototype.getThirdLine = function (lines) {
	if (lines[2] !== undefined) {
		return this.trim(lines[2]);
	} else {
		return false;
	}
};

Clip.prototype.getParsed = function (data) {
	const self = this;

	const arr = self.splitFileIntoRecords(data);
	const col = [];

	for (let i = 0; i < arr.length; i++) {
		const record = arr[i];

		const lines = self.splitRecord(record);
		const first = self.getFirstLine(lines);
		const second = self.getSecondLine(lines);
		const third = self.getThirdLine(lines);

		if (!third) continue;
        const singleRecord = {...first, ...second};
        singleRecord.text = third;
        col.push(singleRecord);
	}

	const jsonArray = [];
	col.forEach((el) => {
		jsonArray.push(el);
	});
    return jsonArray;
};

Clip.prototype.trim = function (str) {
	str = str.replace(/^\s+/, "");
	for (let i = str.length - 1; i >= 0; i--) {
		if (/\S/.test(str.charAt(i))) {
			str = str.substring(0, i + 1);
			break;
		}
	}
	return str;
};

function parseDateString(dateString) {
    const dateParts = dateString.match(/(\d+)/g);
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[2]);
    const hour = parseInt(dateParts[3]) + (dateString.match(/下午/) ? 12 : 0);
    const minute = parseInt(dateParts[4]);
    const second = parseInt(dateParts[5]);
  
    const date = new Date(year, month, day, hour, minute, second);
    return date;
}

module.exports = Clip;
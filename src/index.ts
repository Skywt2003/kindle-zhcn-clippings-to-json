// Lifted from https://github.com/sawyerh/highlights/blob/main/packages/kindle-clippings-to-json/kindle-my-clippings.js
// Support Simplified Chinese only.

interface record {
	type?: string | undefined,
	title?: string | undefined,
	author?: string | undefined,
	page?: number | undefined,
	start?: number | undefined,
	end?: number | undefined,
	time?: Date | undefined,
	text?: string | undefined
}

function splitFileIntoRecords(data: string): string[] {
	return data.split("==========\n");
};

function splitRecord(record: string): string[] {
	const lines = record.split(/\n\n|\n-/);
	const trimmedLines: string[] = [];

	for (let j = 0; j < lines.length; j++) {
		const l = lines[j];
		if (l !== "") {
			trimmedLines.push(l.trim().replace(/\n/g, " "));
		}
	}

	return trimmedLines;
};

function getFirstLine(line: string): record {
	const t = line.split(" (");
	const author = t[1] ? t[1].slice(0, -1) : "";
	return {
		title: t[0],
		author: author,
	};
};

function getSecondLine(line: string): record {
	const t = line.split("|");
	const singleRecord: record = {};
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
			const matchResult = el.match(/您在第(.*?)页/) || "";
			singleRecord.page = parseInt(trim(matchResult[1]));
		}

		// location
		if (el.match(/位置/)) {
			if (el.match(/#(\d+)-(\d+)/)) {
				const matchResult = el.match(/#(\d+)-(\d+)/) || "";
				singleRecord.start = parseInt(trim(matchResult[1]));
				singleRecord.end = parseInt(trim(matchResult[2]));
			} else {
				const matchResult = el.match(/#(\d+)/) || "";
				singleRecord.start = parseInt(trim(matchResult[1]));
			}
		}

		// time
		if (el.match(/添加于/)) {
			const t = el.split("添加于");
			singleRecord.time = parseDateString(trim(t.pop() || ""));
		}
	}
	return singleRecord;
};

function getThirdLine(line: string): string {
	return trim(line);
};

function getParsed(data: string): record[] {
	const arr = splitFileIntoRecords(data);
	const ret: record[] = [];

	for (let i = 0; i < arr.length; i++) {
		const record = arr[i];

		const lines = splitRecord(record);
		if (lines.length < 3) continue;
		const first = getFirstLine(lines[0]);
		const second = getSecondLine(lines[1]);
		const third = getThirdLine(lines[2]);

		if (!third) continue;
		const singleRecord: record = { ...first, ...second };
		singleRecord.text = third;
		ret.push(singleRecord);
	}

	return ret;
};

function trim(str: string): string {
	str = str.replace(/^\s+/, "");
	for (let i = str.length - 1; i >= 0; i--) {
		if (/\S/.test(str.charAt(i))) {
			str = str.substring(0, i + 1);
			break;
		}
	}
	return str;
};

function parseDateString(dateString: string): Date {
	const dateParts = dateString.match(/(\d+)/g) || "";
	const year = parseInt(dateParts[0]);
	const month = parseInt(dateParts[1]) - 1;
	const day = parseInt(dateParts[2]);
	const hour = parseInt(dateParts[3]) + (dateString.match(/下午/) ? 12 : 0);
	const minute = parseInt(dateParts[4]);
	const second = parseInt(dateParts[5]);

	const date = new Date(year, month, day, hour, minute, second);
	return date;
}

export function toObject(text: string): record[] {
	return getParsed(text.replaceAll('\r', ''));
}
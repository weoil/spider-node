export function $get(obj: any, path: string, defaultValue: any = null): any {
	const paths = path.split('.');
	let val = obj;
	try {
		for (const i of paths) {
			const tmp = val[i];
			if (tmp) {
				val = tmp;
			} else {
				throw new Error();
			}
		}
		return val;
	} catch (err) {
		return defaultValue;
	}
}
export function $call(obj: any, key: any, defaultValue: any = null): any {
	if (obj && obj[key] && typeof obj[key] === 'function') {
		return obj[key]();
	}
	return defaultValue;
}

export function handlerJSONP(data: any) {
	data
		.replace(/\\"/g, '"')
		.replace(/"\{/g, '{')
		.replace(/\}"/g, '}')
		.replace(/"\[/g, '[')
		.replace(/\]"/g, ']');
	// console.log(data)
	const rdata = JSON.parse(data);
	return rdata;
}

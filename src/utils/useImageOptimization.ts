export const resizeImage = (url: string) => {
	console.log(url);
	const indices: number[] = [];
	for (let i = 0; i < url.length; i++) {
		if (url[i] === '/') {
			indices.push(i);
		}
	}
	const res = url.slice(indices[4] + 1, indices[5]);
	const dimensions: string[] = res.split('x');

	if (parseInt(dimensions[0]) * parseInt(dimensions[1]) > 10000000) {
		return url + '/m/filters:quality(20)';
	}
	if (parseInt(dimensions[0]) * parseInt(dimensions[1]) > 500000) {
		return url + '/m/filters:quality(40)';
	}
	if (parseInt(dimensions[0]) * parseInt(dimensions[1]) > 100000) {
		return url + '/m/filters:quality(60)';
	}
	if (parseInt(dimensions[0]) * parseInt(dimensions[1]) <= 100000) {
		return url + '/m/filters:quality(80)';
	}
};

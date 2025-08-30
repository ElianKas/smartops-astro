// smardApi https://github.com/bundesAPI/smard-api

// https://www.smard.de/app/chart_data/{filter}/{region}/index_{resolution}.json
// for developer to check available timestamps for different resolutions (e.g. hour, day, week, month, year)

// https://www.smard.de/app/chart_data/{filter}/{region}/{filterCopy}_{regionCopy}_{resolution}_{timestamp}.json
// for time series data

interface Timestamps {
	timestamps: string[];
}

interface TimeSeriesData {
	series: [number, number | null][];
}

interface FilterDataPoint {
	latestDataPoint: [number, number | null] | undefined;
	filterId: string;
}

interface FilterOutput {
	totalPercentage: string;
	filterId: string;
	generationMwh: number;
}

import { smartApiFilters } from './useLists';

const fetchAvailableTimestamps = async (filter: string, region: string, resolution: string) => {
	try {
		const response = await fetch(
			`https://www.smard.de/app/chart_data/${filter}/${region}/index_${resolution}.json`
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		return data;
	} catch (error) {
		console.error('Error fetching available timestamps:', error);
		throw error;
	}
};

const fetchTimeSeriesData = async (
	filter: string,
	region: string,
	resolution: string,
	timestamp: string
) => {
	try {
		// filterCopy and regionCopy must match filter and region (API design requirement)
		const filterCopy = filter;
		const regionCopy = region;

		const response = await fetch(
			`https://www.smard.de/app/chart_data/${filter}/${region}/${filterCopy}_${regionCopy}_${resolution}_${timestamp}.json`
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching time series data:', error);
		throw error;
	}
};

export const fetchAllTimeSeriesData = async (region: string, resolution: string) => {
	let filterDataPoints: FilterDataPoint[] = [];

	await Promise.all(
		smartApiFilters.map(async (filter) => {
			const availableTimestamps: Timestamps = await fetchAvailableTimestamps(
				filter.id,
				region,
				resolution
			);
			const latestTimestamp =
				availableTimestamps.timestamps[availableTimestamps.timestamps.length - 1];
			const timeSeriesData: TimeSeriesData = await fetchTimeSeriesData(
				filter.id,
				region,
				resolution,
				latestTimestamp
			);
			let latestDataPoint;
			if (resolution === 'day') {
				latestDataPoint = getLatestActiveDataPoint(timeSeriesData);
			}
			filterDataPoints.push({
				latestDataPoint: latestDataPoint,
				filterId: filter.id,
			});
		})
	);

	const filterOutputs = getDailyPercentages(filterDataPoints);
	return { filterOutputs };
};

const getLatestActiveDataPoint = (data: TimeSeriesData) => {
	const series = data.series;
	const currentTimestamp = new Date().setHours(0, 0, 0, 0);
	const latestDataPointIndex = series.findIndex((point) => point[0] === currentTimestamp);
	const latestDataPoint = series[latestDataPointIndex - 1]; // index -1 if resolution is day because of late daily updates
	return latestDataPoint;
};

const getDailyPercentages = (dataPoints: FilterDataPoint[]) => {
	let totalMwh = 0;
	let filterOutput: FilterOutput[] = [];

	dataPoints.forEach((dp) => {
		if (dp.latestDataPoint && dp.latestDataPoint[1] !== null) {
			const valueMwh = dp.latestDataPoint[1];
			totalMwh += valueMwh;
			filterOutput.push({
				totalPercentage: '',
				generationMwh: valueMwh,
				filterId: dp.filterId,
			});
		} else {
			console.log(`No valid data point for filter ID: ${dp.filterId}`);
		}
	});

	filterOutput = filterOutput.map((fo) => {
		fo.totalPercentage = ((fo.generationMwh / totalMwh) * 100).toFixed(2) + '%';
		return fo;
	});

	return filterOutput;
};

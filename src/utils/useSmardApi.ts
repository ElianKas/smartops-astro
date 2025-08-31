// smardApi https://github.com/bundesAPI/smard-api

// https://www.smard.de/app/chart_data/{filter}/{region}/index_{resolution}.json
// for developer to check available timestamps for different resolutions (e.g. hour, day, week, month, year)

// https://www.smard.de/app/chart_data/{filter}/{region}/{filterCopy}_{regionCopy}_{resolution}_{timestamp}.json
// for time series data

import { smardApiFilters } from './useLists';
import { calcTargetValues, getPastPercentages } from './useSmardHelpers';

interface Timestamps {
	timestamps: string[];
}

interface TimeSeriesData {
	series: [number, number][];
}

export interface FilterDataPoint {
	latestDataPoint: [number, number] | undefined;
	pastDataPoints: [number, number][];
	filterId: string;
	filterResolution: string;
}

export interface FilterOutput {
	totalPercentage: string;
	filterId: string;
	generationMwh: number;
}

export interface SmardApiValues {
	filterOutputs: FilterOutput[];
	resGenerationEEPercentage: number;
	resGenerationEEGwh: number;
	pastPercentagesEE: [number, number][];
	targetPercentagesEE: [number, number][];
}

export const RESOLUTION_CONFIG = {
	day: { timestampCount: 9, dataPointScale: 9 },
	month: { timestampCount: 13, dataPointScale: 13 },
	year: { timestampCount: 10, dataPointScale: 10 },
} as const;

export type Resolution = keyof typeof RESOLUTION_CONFIG;

export const fetchAllTimeSeriesData = async (region: string, resolution: string) => {
	if (!isValidResolution(resolution)) {
		throw new Error(`Unsupported resolution: ${resolution}`);
	}

	const filterDataPoints = await Promise.all(
		smardApiFilters.map(async (filter) => {
			const availableTimestamps = await fetchAvailableTimestamps(filter.id, region, resolution);
			const timestampStack = getTimestampStack(availableTimestamps, resolution);
			const timeSeriesData = await fetchTimeSeriesData(
				filter.id,
				region,
				resolution,
				timestampStack
			);

			const { latestDataPoint, pastDataPoints } = getLatestActiveDataPoint(
				timeSeriesData,
				resolution
			);

			return {
				latestDataPoint,
				pastDataPoints,
				filterId: filter.id,
				filterResolution: resolution,
			};
		})
	);

	const finalSmardValues = getFinalValues(filterDataPoints, resolution);
	return { finalSmardValues };
};

const isValidResolution = (resolution: string): resolution is Resolution => {
	return resolution in RESOLUTION_CONFIG;
};

const getTimestampStack = (availableTimestamps: Timestamps, resolution: Resolution): string[] => {
	const config = RESOLUTION_CONFIG[resolution];
	const timestamps = availableTimestamps.timestamps;
	const latestTimestampStack: string[] = [];

	for (let i = 1; i <= config.timestampCount; i++) {
		const timestamp = timestamps[timestamps.length - i];
		if (timestamp) {
			latestTimestampStack.push(timestamp);
		}
	}

	return latestTimestampStack;
};

const fetchAvailableTimestamps = async (
	filter: string,
	region: string,
	resolution: string
): Promise<Timestamps> => {
	try {
		const url = `https://www.smard.de/app/chart_data/${filter}/${region}/index_${resolution}.json`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Failed to fetch timestamps: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error(`Error fetching available timestamps for filter ${filter}:`, error);
		throw error;
	}
};

const fetchTimeSeriesData = async (
	filter: string,
	region: string,
	resolution: string,
	timestamps: string[]
): Promise<TimeSeriesData> => {
	if (timestamps.length === 0) {
		throw new Error('No timestamps provided for fetching time series data');
	}

	try {
		const responses = await Promise.all(
			timestamps.map((timestamp) => {
				const url = `https://www.smard.de/app/chart_data/${filter}/${region}/${filter}_${region}_${resolution}_${timestamp}.json`;
				return fetch(url);
			})
		);

		// Check for failed responses
		const failedResponses = responses.filter((response) => !response.ok);
		if (failedResponses.length > 0) {
			throw new Error(`Failed to fetch ${failedResponses.length} time series requests`);
		}

		const allData = await Promise.all(responses.map((response) => response.json()));

		// Combine all series data
		return {
			...allData[0],
			series: allData.flatMap((data) => data.series || []),
		};
	} catch (error) {
		console.error(`Error fetching time series data for filter ${filter}:`, error);
		throw error;
	}
};

const getLatestActiveDataPoint = (data: TimeSeriesData, resolution: string) => {
	if (!data.series || data.series.length === 0) {
		return { latestDataPoint: undefined, pastDataPoints: [] };
	}

	const series = data.series;
	let latestDataPointIndex = series.findIndex((point) => point[1] === null);

	// If no null values found, use the last available data point
	if (latestDataPointIndex === -1) {
		latestDataPointIndex = series.length;
	}

	const latestDataPoint = series[latestDataPointIndex - 1];

	if (!isValidResolution(resolution)) {
		return { latestDataPoint, pastDataPoints: [] };
	}

	const config = RESOLUTION_CONFIG[resolution];
	const startIndex = Math.max(0, latestDataPointIndex - config.dataPointScale);
	const pastDataPoints = series.slice(startIndex, latestDataPointIndex);

	return { latestDataPoint, pastDataPoints };
};

const getFinalValues = (dataPoints: FilterDataPoint[], resolution: string): SmardApiValues => {
	const finalValues: SmardApiValues = {
		filterOutputs: [],
		resGenerationEEPercentage: 0,
		resGenerationEEGwh: 0,
		pastPercentagesEE: getPastPercentages(dataPoints),
		targetPercentagesEE: [], // Will be calculated below
	};

	// Calculate total MWh and create filter outputs
	let totalMwh = 0;
	const validDataPoints = dataPoints.filter(
		(dp) => dp.latestDataPoint && dp.latestDataPoint[1] !== null
	);

	validDataPoints.forEach((dp) => {
		const valueMwh = dp.latestDataPoint![1];
		totalMwh += valueMwh;

		finalValues.filterOutputs.push({
			totalPercentage: '', // Will be calculated below
			generationMwh: valueMwh,
			filterId: dp.filterId,
		});
	});

	// Calculate percentages
	finalValues.filterOutputs = finalValues.filterOutputs.map((output) => ({
		...output,
		totalPercentage:
			totalMwh > 0 ? `${((output.generationMwh / totalMwh) * 100).toFixed(2)}%` : '0%',
	}));

	// Calculate renewable energy statistics
	const { totalRenewablePercentage, totalGwhRenewable } = calculateRenewableStats(
		dataPoints,
		totalMwh
	);
	finalValues.resGenerationEEGwh = totalGwhRenewable;
	finalValues.resGenerationEEPercentage = totalRenewablePercentage;

	// Calculate target values based on current EE percentage and past data
	finalValues.targetPercentagesEE = calcTargetValues(
		finalValues.pastPercentagesEE,
		totalRenewablePercentage,
		resolution
	);

	return finalValues;
};

const calculateRenewableStats = (dataPoints: FilterDataPoint[], totalMwh: number) => {
	const renewableDataPoints = dataPoints.filter((dp) => {
		const filter = smardApiFilters.find((f) => f.id === dp.filterId);
		return filter?.category === 'renewable' && dp.latestDataPoint && dp.latestDataPoint[1] !== null;
	});

	const totalMwhRenewable = renewableDataPoints.reduce((sum, dp) => {
		return sum + (dp.latestDataPoint![1] || 0);
	}, 0);

	const totalRenewablePercentage = totalMwh > 0 ? totalMwhRenewable / totalMwh : 0;
	const totalGwhRenewable = totalMwhRenewable / 1000;

	return { totalRenewablePercentage, totalGwhRenewable };
};

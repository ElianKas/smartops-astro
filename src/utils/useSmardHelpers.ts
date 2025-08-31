import type { FilterDataPoint } from './useSmardApi';
import { smardApiFilters } from './useLists';

// Target configuration
const TARGET_CONFIG = {
	targetYear: 2035,
	targetEEPercentage: 1.0, // 100% renewable energy
} as const;

export const calcTargetValues = (
	pastPercentages: [number, number][],
	currentEEPercentage: number,
	resolution: string
): [number, number][] => {
	if (pastPercentages.length === 0) {
		return [];
	}

	const currentDate = new Date();
	const targetDate = new Date(TARGET_CONFIG.targetYear, 11, 31); // December 31, 2035
	const currentShare = currentEEPercentage;

	// Linear interpolation function to calculate target share for any date
	const calculateTargetShare = (timestamp: number): number => {
		const date = new Date(timestamp);
		const currentTime = currentDate.getTime();
		const targetTime = targetDate.getTime();
		const dateTime = date.getTime();

		// If date is in the past relative to current date, calculate what the target should have been
		const ratio = (dateTime - currentTime) / (targetTime - currentTime);
		const targetShare = Math.max(
			0,
			Math.min(1, currentShare + (TARGET_CONFIG.targetEEPercentage - currentShare) * ratio)
		);

		return targetShare;
	};

	// Calculate target values for each timestamp in pastPercentages
	return pastPercentages.map(([timestamp, _]) => [timestamp, calculateTargetShare(timestamp)]);
};

export const getPastPercentages = (dataPoints: FilterDataPoint[]) => {
	// Calculate total for each timestamp across all filters
	const timestampTotals: { [timestamp: number]: number } = {};

	// Calculate totals for each timestamp
	dataPoints.forEach((dp) => {
		dp.pastDataPoints.forEach((point) => {
			const [timestamp, value] = point;
			if (value !== null) {
				timestampTotals[timestamp] = (timestampTotals[timestamp] || 0) + value;
			}
		});
	});

	// Filter renewable data points
	const renewableDataPoints = dataPoints.filter((dp) => {
		const filter = smardApiFilters.find((f) => f.id === dp.filterId);
		return filter && filter.category === 'renewable';
	});

	// Calculate renewable percentage for each timestamp
	const pastPercentages: [number, number][] = [];

	Object.entries(timestampTotals).forEach(([timestamp, totalForTimestamp]) => {
		const ts = parseInt(timestamp);
		let renewableTotalForTimestamp = 0;

		renewableDataPoints.forEach((rdp) => {
			const dataPoint = rdp.pastDataPoints.find((p) => p[0] === ts);
			if (dataPoint && dataPoint[1] !== null) {
				renewableTotalForTimestamp += dataPoint[1];
			}
		});

		if (totalForTimestamp > 0) {
			const percentage = renewableTotalForTimestamp / totalForTimestamp;
			pastPercentages.push([ts, percentage]);
		}
	});

	return pastPercentages.sort((a, b) => a[0] - b[0]);
};

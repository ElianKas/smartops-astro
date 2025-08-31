import type { FilterDataPoint } from './useSmardApi';
import { smardApiFilters } from './useLists';
import { RESOLUTION_CONFIG } from './useSmardApi';

const TARGET_YEAR = 2035;

export const calcTargetValues = (
	pastPercentages: [number, number][],
	currentEEPercentage: number,
	resolution: string
): [number, number][] => {
	if (pastPercentages.length === 0) return [];

	const config = RESOLUTION_CONFIG[resolution as keyof typeof RESOLUTION_CONFIG];
	const currentDate = new Date();
	const targetDate = new Date(TARGET_YEAR, 11, 31);

	// Calculate baseline date based on resolution
	const baselineDate = new Date(currentDate);
	if (resolution === 'day') baselineDate.setDate(baselineDate.getDate() - config.dataPointScale);
	if (resolution === 'month')
		baselineDate.setMonth(baselineDate.getMonth() - config.dataPointScale);
	if (resolution === 'year')
		baselineDate.setFullYear(baselineDate.getFullYear() - config.dataPointScale);

	const baselineTime = baselineDate.getTime();
	const targetTime = targetDate.getTime();
	const totalDuration = targetTime - baselineTime;

	return pastPercentages.map(([timestamp, _]) => {
		const progressRatio = (timestamp - baselineTime) / totalDuration;
		const targetShare = currentEEPercentage + (1.0 - currentEEPercentage) * progressRatio;
		return [timestamp, Math.max(0, Math.min(1, targetShare))];
	});
};

export const getPastPercentages = (dataPoints: FilterDataPoint[]) => {
	const timestampTotals: { [timestamp: number]: number } = {};
	const pastPercentages: [number, number][] = [];

	// Calculate totals
	dataPoints.forEach((dp) => {
		dp.pastDataPoints.forEach(([timestamp, value]) => {
			if (value !== null) {
				timestampTotals[timestamp] = (timestampTotals[timestamp] || 0) + value;
			}
		});
	});

	// Filter renewable data points
	const renewableDataPoints = dataPoints.filter((dp) => {
		const filter = smardApiFilters.find((f) => f.id === dp.filterId);
		return filter?.category === 'renewable';
	});

	// Calculate percentages
	Object.entries(timestampTotals).forEach(([timestamp, total]) => {
		const ts = parseInt(timestamp);
		const renewable = renewableDataPoints.reduce((sum, rdp) => {
			const point = rdp.pastDataPoints.find((p) => p[0] === ts);
			return sum + (point?.[1] || 0);
		}, 0);

		if (total > 0) {
			pastPercentages.push([ts, renewable / total]);
		}
	});

	return pastPercentages.sort((a, b) => a[0] - b[0]);
};

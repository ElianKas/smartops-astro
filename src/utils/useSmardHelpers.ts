import type { FilterDataPoint } from './useSmardApi';
import { smardApiFilters } from './useLists';

export const calcTargetValue = (
	totalToday: number,
	eeToday: number,
	eeShareToday: number,
	currentDate: Date,
	targetDate: Date
) => {
	const t0 = new Date(currentDate); // heute
	const tEnd = new Date(targetDate); // Ziel
	const share0 = eeShareToday; // Anteil heute (Dezimal, z.B. 0.58)

	// Hilfsfunktion: lineare Interpolation Soll-Anteil
	function targetShare(date: Date) {
		const d0 = t0.getTime();
		const d1 = tEnd.getTime();
		const d = new Date(date).getTime();
		const ratio = (d - d0) / (d1 - d0);
		return Math.max(0, Math.min(1, share0 + (1 - share0) * ratio));
	}

	// Array für die letzten 7 Tage
	const result = [];
	for (let i = 6; i >= 0; i--) {
		const d = new Date(t0);
		d.setDate(d.getDate() - i);
		result.push([d.getTime(), targetShare(d)]);
	}

	return result;
};

export const getPastPercentages = (dataPoints: FilterDataPoint[]) => {
	// Calculate total for each day across all filters
	const dayTotals: { [timestamp: number]: number } = {};

	// Calculate totals for each day
	dataPoints.forEach((dp) => {
		dp.pastDataPoints.forEach((point) => {
			const [timestamp, value] = point;
			if (value !== null) {
				dayTotals[timestamp] = (dayTotals[timestamp] || 0) + value;
			}
		});
	});

	// Filter renewable data points
	const renewableDataPoints = dataPoints.filter((dp) => {
		const filter = smardApiFilters.find((f) => f.id === dp.filterId);
		return filter && filter.category === 'renewable';
	});

	// Calculate renewable percentage for each day
	const pastPercentages: [number, number][] = [];

	Object.entries(dayTotals).forEach(([timestamp, totalForDay]) => {
		const ts = parseInt(timestamp);
		let renewableTotalForDay = 0;

		renewableDataPoints.forEach((rdp) => {
			const dayPoint = rdp.pastDataPoints.find((p) => p[0] === ts);
			if (dayPoint && dayPoint[1] !== null) {
				renewableTotalForDay += dayPoint[1];
			}
		});

		if (totalForDay > 0) {
			const percentage = renewableTotalForDay / totalForDay;
			pastPercentages.push([ts, percentage]);
		}
	});
	return pastPercentages.sort((a, b) => a[0] - b[0]);
};

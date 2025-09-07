export async function fetchSumMastr() {
	// speicherkapazität aller erneuerbaren energieträger zum aktuellen zeitpunkt
	const filterPrivat = `
https://www.marktstammdatenregister.de/MaStR/Einheit/EinheitJson/GetSummenDerLeistungswerte?gridName=SEE&filter=Energietr%C3%A4ger~eq~%272493%2C2403%2C2495%2C2404%2C2496%2C2497%27~and~Name%20des%20Anlagenbetreibers%20(nur%20Org.)~ct~%27nat%C3%BCrliche%20Person%27~and~Betriebs-Status~eq~%2735%27`;
	const res1 = await fetch(filterPrivat);
	const res1Json = await res1.json();

	const filterIndustry = `
https://www.marktstammdatenregister.de/MaStR/Einheit/EinheitJson/GetSummenDerLeistungswerte?gridName=SEE&filter=Energietr%C3%A4ger~eq~%272493%2C2403%2C2495%2C2404%2C2496%2C2497%27~and~Name%20des%20Anlagenbetreibers%20(nur%20Org.)~nct~%27nat%C3%BCrliche%20Person%27~and~Betriebs-Status~eq~%2735%27`;
	const res2 = await fetch(filterIndustry);
	const res2Json = await res2.json();

	const filterIndustryPlanned = `
    https://www.marktstammdatenregister.de/MaStR/Einheit/EinheitJson/GetSummenDerLeistungswerte?gridName=SEE&filter=Energietr%C3%A4ger~eq~%272493%2C2403%2C2495%2C2404%2C2496%2C2497%27~and~Name%20des%20Anlagenbetreibers%20(nur%20Org.)~nct~%27nat%C3%BCrliche%20Person%27~and~Betriebs-Status~eq~%2735%27`;
	const res3 = await fetch(filterIndustryPlanned);
	const res3Json = await res3.json();

	const filterPrivatPlanned = `
https://www.marktstammdatenregister.de/MaStR/Einheit/EinheitJson/GetSummenDerLeistungswerte?gridName=SEE&filter=Energietr%C3%A4ger~eq~%272493%2C2403%2C2495%2C2404%2C2496%2C2497%27~and~Name%20des%20Anlagenbetreibers%20(nur%20Org.)~ct~%27nat%C3%BCrliche%20Person%27~and~Betriebs-Status~eq~%2731%27`;
	const res4 = await fetch(filterPrivatPlanned);
	const res4Json = await res4.json();

	const totalKw = res1Json.nettoleistungSumme + res2Json.nettoleistungSumme;
	const totalKwPlanned = res3Json.nettoleistungSumme + res4Json.nettoleistungSumme;

	const privatPercentage = res1Json.nettoleistungSumme / totalKw;
	const industryPercentage = res2Json.nettoleistungSumme / totalKw;

	const industryPercentagePlanned = res3Json.nettoleistungSumme / totalKwPlanned;
	const privatPercentagePlanned = res4Json.nettoleistungSumme / totalKwPlanned;

	const finalMastrValues = {
		privatPercentage,
		industryPercentage,
		industryPercentagePlanned,
		privatPercentagePlanned,
	};
	return finalMastrValues;
}

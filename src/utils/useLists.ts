export const projectCategories = [
	//value is matching the storyblok project_categories value

	// Technologien
	{ group: 'Technologien', name: 'Solar', value: 'technology_solar' },
	{ group: 'Technologien', name: 'Wind', value: 'technology_wind' },
	{ group: 'Technologien', name: 'Speicher', value: 'technology_speicher' },
	{ group: 'Technologien', name: 'ESYS', value: 'technology_esys' },
	{ group: 'Technologien', name: 'eMobil', value: 'technology_emobil' },

	// Sparring
	{ group: 'Sparring', name: 'Management Consulting', value: 'sparring_mc' },
	{ group: 'Sparring', name: 'Advisory', value: 'sparring_advisory' },
	{ group: 'Sparring', name: 'Review & 2nd Opinion', value: 'sparring_review' },
	{ group: 'Sparring', name: 'Coaching', value: 'sparring_coaching' },

	// Projekte & Lösungen
	{ group: 'Projekte & Lösungen', name: 'Konzeptstudien', value: 'pl_konzeptstudien' },
	{
		group: 'Projekte & Lösungen',
		name: 'Potential- & Ertragsstudien',
		value: 'pl_potentialstudien',
	},
	{ group: 'Projekte & Lösungen', name: 'Umweltstudien', value: 'pl_umweltstudien' },
	{ group: 'Projekte & Lösungen', name: 'Machbarkeitsstudien', value: 'pl_machbarkeitsstudien' },
	{ group: 'Projekte & Lösungen', name: 'Engineering & Design (Entwurf)', value: 'pl_engineering' },
	{
		group: 'Projekte & Lösungen',
		name: 'Spezifikation & Ausschreibung',
		value: 'pl_spezifikation',
	},
	{ group: 'Projekte & Lösungen', name: 'Baubetreuung', value: 'pl_baubetreuung' },
	{ group: 'Projekte & Lösungen', name: 'Audits & Abnahme', value: 'pl_audits' },
];

export const smardApiFilters = [
	{ id: '4066', name: 'Biomasse', category: 'renewable', color: '#7BAD66' },
	{ id: '1223', name: 'Braunkohle', category: 'conventional', color: '' },
	{ id: '4071', name: 'Erdgas', category: 'conventional', color: '' },
	{ id: '4068', name: 'Photovoltaik', category: 'renewable', color: '#FBF37B' },
	{ id: '4070', name: 'Pumpspeicher', category: 'conventional', color: '' },
	{ id: '1228', name: 'Sonstige Erneuerbare', category: 'renewable', color: '#A2C976' },
	{ id: '1227', name: 'Sonstige Konventionelle', category: 'conventional', color: '' },
	{ id: '4069', name: 'Steinkohle', category: 'conventional', color: '' },
	{ id: '1226', name: 'Wasserkraft', category: 'renewable', color: '#BCDFF9' },
	{ id: '1225', name: 'Wind Offshore', category: 'renewable', color: '#7ED0F6' },
	{ id: '4067', name: 'Wind Onshore', category: 'renewable', color: '#5D67ED' },
];

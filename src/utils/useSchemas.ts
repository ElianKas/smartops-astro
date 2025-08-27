export interface SmartopsImage {
	id: number;
	alt: string;
	filename: string;
}

// -----------------------------------------------------------------------------------------

export interface SmartopsProject {
	project_image: SmartopsImage;
	project_title: string;
	project_sections: Array<SmartopsProjectImageSection | SmartopsProjectTextSection>;
	project_categories: Array<string>;
}

export interface SmartopsProjectImageSection {
	component: 'project_section_assets';
	section_assets: Array<SmartopsImage>;
}

export interface SmartopsProjectTextSection {
	component: 'project_section_text';
	section_richtext: object;
}

// -----------------------------------------------------------------------------------------

export interface SmartopsPage {
	page_title: string;
	page_meta_description: string;
	page_showcase_project: Array<{ content: SmartopsProject; full_slug: string }>;
	page_blocks: Array<object>;
}

export interface SmartopsPageSectionText {
	component: 'page_section_text';
	section_description: object;
}

export interface SmartopsPageSectionHero {
	component: 'page_section_hero';
	section_image: SmartopsImage;
	section_title: string;
	section_description: object;
}

export interface SmartopsPageSectionFeatures {
	component: 'page_section_features';
	section_items: Array<SmartopsPageSectionFeaturesItem>;
}

export interface SmartopsPageSectionFeaturesItem {
	features_item_title: string;
	features_item_description: object;
}

export interface SmartopsPageSectionCarousel {
	component: 'page_section_carousel';
	section_items: Array<SmartopsPageSectionCarouselItem>;
}

export interface SmartopsPageSectionCarouselItem {
	carousel_item_image: SmartopsImage;
	carousel_item_title: string;
	carousel_item_description: string;
}

export interface SmartopsPageSectionSparringInfo {
	component: 'page_section_sparring_info';
}

export interface SmartopsPageSectionReferences {
	component: 'page_section_references';
	section_references: Array<string>;
}

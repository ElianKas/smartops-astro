export interface Story {
	name: string;
	uuid: string;
	slug: string;
	full_slug: string;
	content: SmartopsProject;
}

export interface SmartopsProject {
	project_image: SmartopsProjectImage;
	project_title: string;
	project_sections: Array<SmartopsProjectImageSection | SmartopsProjectTextSection>;
	project_categories: Array<string>;
}

export interface SmartopsProjectImageSection {
	component: 'project_section_assets';
	section_assets: Array<SmartopsProjectImage>;
}

export interface SmartopsProjectTextSection {
	component: 'project_section_text';
	section_richtext: any;
}

export interface SmartopsProjectImage {
	id: number;
	alt: string;
	filename: string;
}

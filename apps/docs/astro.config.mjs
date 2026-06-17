// @ts-check
import { defineConfig } from 'astro/config';
import mermaid from 'astro-mermaid';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		mermaid({ autoTheme: true }),
		starlight({
			title: 'awesome-pushup-standards',
			description:
				'Curated code-pushup plugins and presets — orchestration, scoring, CI/CD, and E2E testing.',
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/kacperpaczos/Awesome-Pushup-Standards',
				},
			],
			editLink: {
				baseUrl:
					'https://github.com/kacperpaczos/Awesome-Pushup-Standards/edit/main/apps/docs/',
			},
			sidebar: [
				{
					label: 'Guides',
					items: [
						{ slug: 'guides/plugin-authoring' },
						{ slug: 'guides/llm-configuration' },
						{ slug: 'guides/e2e-testing' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ slug: 'reference/scoring-model' },
						{ slug: 'reference/domains' },
					],
				},
				{
					label: 'Project',
					items: [
						{ slug: 'project/backlog' },
						{ slug: 'project/monorepo-ci' },
					],
				},
			],
		}),
	],
});

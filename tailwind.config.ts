import kobalte from '@kobalte/tailwindcss';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
import colors from 'tailwindcss/colors.js';
import { fontFamily } from 'tailwindcss/defaultTheme.js';
import plugin from 'tailwindcss/plugin.js';

export default {
	content: ['./src/**/*.{astro,js,jsx,ts,tsx}'],
	theme: {
		extend: {
	fontFamily: {
  sans: ['nextexit-variable', ],
},
			colors: {
				theme: {
base: {
						50: "#f0562b",
						100: "white",
												200: "#EAEAEA",
												
												400: "#EAEAEA",
												300: "white",

												500: "green",

												600: "#083da1",
												700: "purple",
												800: "purple",
																								900: "#f0562b",

												950: "purple",

					}				},
			},
		},
	},
	plugins: [
		animate,
		kobalte,
		typography,
		plugin(function customStyles(api) {
			api.addUtilities({
				'.grid-center': {
					display: 'grid',
					'place-items': 'center',
					'place-content': 'center',
				},
			});
		}),
	],
	corePlugins: {
		container: false,
	},
} satisfies Config;

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	plugins: [
		function ({ addUtilities }) {
			addUtilities(
			  {
				'.bg-transparent-important': {
				  backgroundColor: 'transparent !important',
				},
				'.bg-red-important': {
					backgroundColor: '#dc2626 !important',
				  },
				'.border-red-important': {
					borderColor: '#dc2626 !important',
				  },
			  },
			  ['responsive', 'hover'] // you can specify variants if needed
			);
		  },
	]
};

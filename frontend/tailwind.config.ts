import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12221e',
        forest: '#153b32',
        mint: '#d9f5e8',
        canvas: '#f4f7f5',
      },
      boxShadow: {
        panel: '0 14px 40px rgba(22, 42, 35, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;

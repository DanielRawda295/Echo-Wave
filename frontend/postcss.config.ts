import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import type { AcceptedPlugin } from 'postcss';

const config = {
  plugins: [tailwindcss as AcceptedPlugin, autoprefixer as AcceptedPlugin],
};

export default config;
import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'bici-components',
  favicon: '/logoSVG.svg',
  logo: '/logoPNG.png',
  outputPath: 'docs-dist',
  styles:
    process.env.NODE_ENV === 'development'
      ? [`https://cdn.bootcdn.net/ajax/libs/antd/4.16.9/antd.compact.css`]
      : ['https://cdn.bootcdn.net/ajax/libs/antd/4.16.9/antd.compact.css'],
});

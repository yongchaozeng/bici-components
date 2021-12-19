import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'bici-components',
  favicon: 'http://zysco.test.bicisims.com/static/media/LOGO_WHITE_TEXT.cf0d5096.svg',
  logo: 'http://zysco.test.bicisims.com/static/media/LOGO_WHITE_TEXT.cf0d5096.svg',
  outputPath: 'docs-dist',
  styles:
    process.env.NODE_ENV === 'development'
      ? [`https://cdn.bootcdn.net/ajax/libs/antd/4.16.9/antd.compact.css`]
      : [],
});

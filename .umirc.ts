import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'bici-components',
  favicon:
    'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  logo: 'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  outputPath: 'docs-dist',
  styles:
    process.env.NODE_ENV === 'development'
      ? [`https://cdn.bootcdn.net/ajax/libs/antd/4.16.9/antd.compact.css`]
      : [], 
});

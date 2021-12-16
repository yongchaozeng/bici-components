import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'bici-components',
  favicon:
    'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  logo: 'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  outputPath: 'docs-dist',
  styles:
    process.env.NODE_ENV === 'development'
      ? [`https://gw.alipayobjects.com/os/lib/antd/4.6.6/dist/antd.css`]
      : [], 
});

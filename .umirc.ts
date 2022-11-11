import {defineConfig} from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    {
      component: '@/layout/layout',
      routes: [
        {title: 'Small Pan', path: '/', component: 'index/index'},
        {component: '404'}
      ]
    },
  ],
  fastRefresh: {},
});

export default {
  // 开发环境配置
  development: {
    logger: {
      handler: 'console'
    },
    host_permissions: [
      'https://jenkins.fengzhangame.net/**' 
    ],
  },
  // 生产环境配置
  production: {
    logger: {
      handler: {
        name: 'http',
        params: ['https://www.baidu.com/log/collect/']
      }
    }
  },
  // 默认配置
  default: {

  }
}

import type { HAConfig } from '../types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfigStore = defineStore('config', () => {
  // 1. 读取旧数据作为初始值
  const oldHaConfig = localStorage.getItem('ha_config')
  const haConfig = ref<HAConfig>(oldHaConfig
    ? JSON.parse(oldHaConfig)
    : {
        url: '',
        token: '',
        entities: [],
      })

  const clockConfig = ref({
    /** 时钟颜色 */
    color: '#ffffff',
    /** 字重 */
    fontWeight: 800,
    /** 数字随机倾斜 */
    enableTilt: true,
    /** 显示秒钟 */
    showSeconds: false,
    /** 透明度 */
    opacity: 0.9,
    /** 24小时制 */
    is24Hour: true,
  })

  // 2. 清理旧版 key
  if (oldHaConfig) {
    localStorage.removeItem('ha_config')
  }

  return {
    haConfig,
    clockConfig,
  }
}, {
  persist: true,
})

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import ClockSettingsModal from '../components/ClockSettingsModal.vue'
import Digit from '../components/Digit.vue'
import Weather from '../components/Weather.vue'
import { useTime } from '../hooks/useTime'
import { useConfigStore } from '../stores/config'

const configStore = useConfigStore()
const { clockConfig } = storeToRefs(configStore)

const { h1, h2, m1, m2, s1, s2, lunar, now } = useTime({
  is24Hour: computed(() => clockConfig.value.is24Hour),
})

const showClockSettings = ref(false)

const baseDelay = computed(() => {
  return clockConfig.value.showSeconds ? 0 : -2
})
</script>

<template>
  <div class="glass-panel h-full flex flex-col items-center justify-evenly text-white w-full">
    <!-- 日期与农历 -->
    <div class="flex flex-col md:flex-row items-center md:items-start gap-6 w-full justify-center">
      <div class="flex items-center gap-4">
        <div class="date-day-big">
          {{ now.getDate() }}
        </div>
        <div class="flex flex-col mt-2">
          <span class="text-5xl tracking-[0.2em] opacity-90 uppercase">
            {{ now.toLocaleDateString('zh-CN', { weekday: 'long' }) }}
          </span>
          <span class="text-4xl tracking-[0.2em] font-light opacity-70 mt-1">
            {{ now.getFullYear() }}年{{ now.getMonth() + 1 }}月
          </span>
        </div>
      </div>
      <div class="hidden md:block w-px h-16 mx-16 self-center" />
      <div class="flex flex-col items-center md:items-start mt-5">
        <span class="text-5xl font-medium text-white/90 tracking-wider">{{ lunar.fullDate }}</span>
        <span class="text-4xl tracking-[0.2em] font-light opacity-70 mt-2">{{ lunar.year }}{{ lunar.month }}</span>
      </div>
    </div>

    <!-- 时钟显示 -->
    <div
      class="clock-display tabular-nums cursor-pointer transition-all duration-500"
      :class="{ 'with-seconds': clockConfig.showSeconds }"
      :style="{ color: clockConfig.color, fontWeight: clockConfig.fontWeight, opacity: clockConfig.opacity }"
      @click="showClockSettings = true"
    >
      <Digit
        v-if="clockConfig.is24Hour || h1 !== 0"
        :value="h1" :show-seconds="clockConfig.showSeconds" :enable-tilt="clockConfig.enableTilt"
        :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
        :delay="(5 - baseDelay) * 100"
        class="opacity-95"
      />
      <Digit
        :value="h2" :show-seconds="clockConfig.showSeconds" :enable-tilt="clockConfig.enableTilt"
        :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
        :delay="(4 - baseDelay) * 100"
        class="opacity-95"
        :class="[{
          brightness: clockConfig.is24Hour || (!clockConfig.is24Hour && h1 !== 0),
        }]"
      />

      <div class="clock-separator">
        :
      </div>

      <Digit
        :value="m1" :show-seconds="clockConfig.showSeconds" :enable-tilt="clockConfig.enableTilt"
        :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
        :delay="(3 - baseDelay) * 100"
        class="opacity-95"
      />
      <Digit
        :value="m2" :show-seconds="clockConfig.showSeconds" :enable-tilt="clockConfig.enableTilt"
        :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
        :delay="(2 - baseDelay) * 100"
        class="opacity-95 brightness"
      />

      <template v-if="clockConfig.showSeconds">
        <div
          class="clock-separator second-separator"
          :style="{ opacity: clockConfig.opacity * 0.65 }"
        >
          :
        </div>
        <Digit
          class="second-digit opacity-60" :value="s1" :show-seconds="clockConfig.showSeconds"
          :trigger="now.getTime()"
          :delay="100"
          :enable-tilt="clockConfig.enableTilt"
        />
        <Digit
          class="second-digit brightness opacity-60" :value="s2" :show-seconds="clockConfig.showSeconds"
          :trigger="now.getTime()"
          :delay="0"
          :enable-tilt="clockConfig.enableTilt"
        />
      </template>
    </div>

    <!-- 天气展示 -->
    <Weather />

    <!-- 时钟设置弹窗 -->
    <ClockSettingsModal :show="showClockSettings" @close="showClockSettings = false" />
  </div>
</template>

<style scoped>
.glass-panel {
  max-width: 1200px;
}

.date-day-big {
  font-size: 8rem; /* iOS 12 Fallback: 约 80px */
  line-height: 1;
  font-weight: 700;
  background: linear-gradient(to bottom, #ffffff, rgba(255, 255, 255, 0.7));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'SF Pro Rounded', sans-serif;
}

.clock-display {
  display: flex;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: center;
  justify-content: center;
  font-family: 'SF Pro Rounded', sans-serif;
  font-size: 35vw; /* iOS 12 Fallback 1: 响应式比例 */
  font-size: 22rem; /* iOS 12 Fallback 2: 强制大字号 */
  font-size: clamp(10rem, 35vw, 25rem);
  font-weight: 700;
  line-height: 1.1;
}

.clock-display.with-seconds {
  font-size: 28vw; /* iOS 12 Fallback 1 */
}

.clock-separator {
  opacity: 0.98;
  text-align: center;
  margin: 0 -0.1em; /* 适当重叠，但比数字间距小 */
  display: flex;
  justify-content: center;
  line-height: 1;
  position: relative;
  top: -0.05em; /* 稍微上移一点，视觉上更垂直居中 */
  z-index: 10;
  filter: brightness(1.8);
}

.second-separator,
.second-digit {
  opacity: 0.6;
}

.brightness {
  filter: brightness(1.25);
}
</style>

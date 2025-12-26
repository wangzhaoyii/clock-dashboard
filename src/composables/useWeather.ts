import type { WeatherInfo } from '../types'
import { ref } from 'vue'
import { mapWmoCode } from '../utils/weather'

const weatherData = ref<any>(null)
const loading = ref(true)
const locationText = ref('定位中...')
const weatherInfo = ref<WeatherInfo>({ text: '点击刷新', icon: mapWmoCode(-1).icon })
const cachedCoords = ref<{ lat: number, lon: number, city: string } | null>(null)

export function useWeather() {
  async function fetchWeather(lat: number, lon: number, locationName?: string, isRealLocation: boolean = false) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,rain,wind_speed_10m,is_day,apparent_temperature,showers,relative_humidity_2m,precipitation,weather_code&hourly=precipitation_probability,uv_index,temperature_2m&timezone=auto&forecast_days=1`
    try {
      const response = await fetch(url)
      const data = await response.json()

      const currentHour = new Date().getHours()
      data.current_hour_index = currentHour

      weatherData.value = data
      weatherInfo.value = mapWmoCode(data.current.weather_code, data.current.is_day === 1)
      loading.value = false

      if (locationName) {
        locationText.value = locationName
        if (isRealLocation) {
          cachedCoords.value = { lat, lon, city: locationName }
        }
      }
      else if (locationText.value.includes('定位中')) {
        locationText.value = `${lon.toFixed(2)}, ${lat.toFixed(2)}`
      }
    }
    catch (error) {
      weatherInfo.value.text = '接口错误'
      weatherInfo.value.icon = mapWmoCode(-1).icon
    }
  }

  async function reverseGeocode(lat: number, lon: number) {
    try {
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`)
      const data = await response.json()
      const city = data.city || data.locality || data.principalSubdivision || '未知城市'
      return city
    }
    catch (e) {
      return `${lon.toFixed(2)}, ${lat.toFixed(2)}`
    }
  }

  async function fetchByIp() {
    try {
      const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=zh')
      const data = await res.json()
      if (data.latitude && data.longitude) {
        const city = data.city || data.locality || data.principalSubdivision || '未知城市'
        await fetchWeather(data.latitude, data.longitude, city, true)
      }
      else {
        throw new Error('定位失败')
      }
    }
    catch (e) {
      await fetchWeather(39.9, 116.4, '北京市 (默认)')
    }
  }

  async function getLocationAndWeather() {
    loading.value = true
    if (cachedCoords.value) {
      const { lat, lon, city } = cachedCoords.value
      await fetchWeather(lat, lon, city, true)
      return
    }

    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (p) => {
            const lat = p.coords.latitude
            const lon = p.coords.longitude
            const city = await reverseGeocode(lat, lon)
            await fetchWeather(lat, lon, city, true)
          },
          async () => await fetchByIp(),
          { timeout: 5000 },
        )
      }
      else {
        await fetchByIp()
      }
    }
    catch (err) {
      weatherInfo.value.text = '更新超时'
      loading.value = false
    }
  }

  return {
    weatherData,
    loading,
    locationText,
    weatherInfo,
    getLocationAndWeather,
  }
}

<template>
  <section class="bg-primary-200 py-10 sm:py-16" ref="containerRef">
    <div class="max-w-7xl mx-auto  sm:px-6 lg:px-8 text-center">
      <SectionTitle title-tag="h2" >{{ title }}</SectionTitle>
      
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mt-10">          
        <div v-for="(stat, index) in stats" :key="stat.text">
          <p class="text-3xl md:text-4xl font-extrabold text-secondary">{{ animatedCounts[index]}}<span v-if="String(stat.count).includes('+')">+</span>
          </p>
          <p class="opacity-75">{{ stat.text }}</p>
        </div>
      </div>
    </div>
  </section>    
</template> 
<script setup lang="ts">
import type { Stat } from '~/types/stats'

const props = defineProps<{
  stats: Stat[],
  title: String
}>()

const containerRef = ref<HTMLElement | null>(null)
const hasAnimated = ref(false) ;
const animatedCounts = ref<number[]>(
  props.stats.map(() => 0)
)

onMounted(() => {
  if (!containerRef.value) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !hasAnimated.value) {
        hasAnimated.value = true
        
        props.stats.forEach((stat, index) => {
          const numericValue = Number(
            String(stat.count).replace(/\D/g, '')
          )

          if (!isNaN(numericValue)) {
            animateCount(index, numericValue, index * 100, numericValue > 30 ? 1200 : 400)
          }
        })

        observer.disconnect()
      }
    }
  );
  
  observer.observe(containerRef.value)
})

const animateCount = (index: number, target: number, delay: number, duration = 1200) => {

  setTimeout(() => {
    const start = performance.now()
  
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      animatedCounts.value[index] = Math.floor(progress * target)
  
      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }
  
    requestAnimationFrame(tick)
  }, delay)
};

</script>
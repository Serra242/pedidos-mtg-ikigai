<script setup lang="ts">
const { mensaje, color, visible } = useToast()
</script>

<template>
  <div class="toast" :class="{ show: visible }" :style="{ borderBottomColor: color }">
    {{ mensaje }}
  </div>
</template>

<template>
    <div ref="root" id="root"></div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import RC from '../embed'

const instance = ref()
onMounted(async () => {
    instance.value = await RC.init('root', '123', '123');
    console.log(11, RC.getAllInstances())
})

</script>
<style scoped >
 #root {
    width: 100vw;
    height: 100vh;
 }
</style>

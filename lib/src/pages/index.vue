<template>
    <div ref="root" id="root"></div>
    <a-modal width="400px" :title-align="'start'" v-model:visible="visible" title="初始化" :on-before-ok="handleClick" :hide-cancel="true">
        <a-form :model="form" :rules="rules" auto-label-width ref="formRef">
            <a-form-item field="accessToken" label="Access Token" :rules="[{ required: true, message: '请输入 Access Token' }]">
                <a-input v-model="form.accessToken" />
            </a-form-item>
        </a-form>
    </a-modal>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { type FormInstance } from '@arco-design/web-vue'
import RC from '../embed'

const instance = ref()
const visible = ref(true)
const formRef = ref<FormInstance>()
const form = ref({
    accessToken: ''
})
const rules = ref({
    accessToken: [{ required: true, message: '请输入 Access Token' }]
})
const handleClick = async () => {
    console.log(await formRef.value?.validate())
    if ( !(await formRef.value?.validate())) {
        instance.value = await RC.init('root', form.value.accessToken);
        return true
    }
    return false
}

</script>
<style scoped >
 #root {
    width: 100vw;
    height: 100vh;
 }
</style>

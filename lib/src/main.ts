import { createApp } from 'vue'
import App from './pages/index.vue'
import ArcoVue from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';

createApp(App).use(ArcoVue).mount('#app')
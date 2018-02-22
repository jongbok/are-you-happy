// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import {auth} from '@/helpers/FirebaseHelper';
import firebase from 'firebase';
import VueFire from 'vuefire';
import VueMaterial from 'vue-material';
import VueAwesomeSwiper from 'vue-awesome-swiper';
import VueSession from 'vue-session';
import config from '@/config/FirebaseConfig';
import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default.css';
import 'swiper/dist/css/swiper.css';

// firebase.initializeApp(config);

Vue.use(VueFire);
Vue.use(VueMaterial);
Vue.use(VueAwesomeSwiper, /* { default global options } */);
Vue.use(VueSession);

Vue.config.productionTip = false;
auth.useDeviceLanguage();
// firebase.auth().useDeviceLanguage();

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});
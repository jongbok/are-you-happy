import Vue from 'vue';
import Router from 'vue-router';
import Main from '@/components/Main';
import Help from '@/components/Help';
import PrivateInformation from '@/components/PrivateInformation';
import Terms from '@/components/Terms';

Vue.use(Router);

export default new Router({
	mode: 'history',
	routes: [
		{ path: '/', name: 'main', component: Main },
		{ path: '/help', name: 'help', component: Help},
		{ path: '/private', name: 'private', component: PrivateInformation},
		{ path: 'terms', name: 'terms', component: Terms}
	]
});
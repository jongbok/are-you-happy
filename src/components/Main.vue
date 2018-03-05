<template>
	<div>
		<md-content>
			<md-autocomplete v-model="selectedWord" :md-options="words" :md-open-on-focus="true" md-layout="box" @md-changed="href" md-dense >
				<label>주제를 검색 하세요!</label>
			</md-autocomplete>
		</md-content>

		<md-card>
			<md-card-media>
				<swiper v-if="slides.length" :options="swiperOption" ref="swiper" >
					<swiper-slide v-for="slide in slides" :key="slide.title" :id="slide.id" >
						<p class="md-title">
							<md-icon>keyboard_arrow_right</md-icon>
							{{slide.title}}의 {{subject}}이란?
						</p>
						<div>{{slide.content}}</div>
					</swiper-slide>
					<div class="swiper-button-prev" slot="button-prev" ></div>
					<div class="swiper-button-next" slot="button-next" ></div>
				</swiper>
				<div v-else >
					<p class="md-title">
						"{{subject}}"에 대한 공감키워드가 존재하지 않습니다.
					</p>
				</div>
			</md-card-media>
			<md-card-actions>
				<md-button class="md-raised md-icon-button" @click.stop="share" :disabled="!slides.length" >
					<md-icon>share</md-icon>
				</md-button>
			</md-card-actions>
		</md-card>

		<md-card>
			<md-card-header>
				<div class="md-title" >
					<md-icon>keyboard_arrow_right</md-icon>
					<span v-if="user" >{{user.name}}님의 {{subject}}이란?</span>
					<span v-else>당신의 {{subject}}이란?</span>
				</div>
			</md-card-header>
			<md-card-content id="list" class="md-scrollbar" >
				<md-list v-if="isNotEmpty" key="summary_exists" >
					<md-list-item v-for="(value, key) in summary" :key="key" >
						<div class="md-list-item-text" >
							<span>{{key}} <span class="md-caption" >{{value}}</span></span>
						</div>
						<md-button class="md-raised md-icon-button md-list-action" :disabled="disabled(key)" @click="vote(key)" >
							<md-icon class="md-primary">star</md-icon>
						</md-button>
					</md-list-item>
				</md-list>
				<span class="md-body-2" v-else key="summary_empty" >
					등록된 키워드가 없습니다.
				</span>
			</md-card-content>
			<div>
				<md-field>
					<md-input placeholder="공감가는 키워드가 없다면 등록해 주세요!" v-model="keyword" @keydown.enter="save" ref="keyword" ></md-input>
					<md-button class="md-raised md-primary" @click.stop="save" >등록</md-button>
				</md-field>
			</div>
		</md-card>

		<md-snackbar :md-position="snackbar.position" :md-duration="snackbar.duration" :md-active.sync="snackbar.show" md-persistent>
		    <span>{{snackbar.message}}</span>
		</md-snackbar>		
	</div>
</template>

<script>
	import Vue from 'vue';
	import {db, auth} from '@/helpers/FirebaseHelper';
	import Definition from '@/helpers/Definition';
	import hash from 'string-hash';
	import _ from 'lodash';

	let subscriptions = [];
	const leftPad = v => v > 9 ? v.toString(): `0${v}`,
		getTitle = (year, month, sex, age) => {
			let title = `${year}년도`;
			month && (title += ` ${month}월`);
			age && (title += age === 60 ? ' 60대 이상': ` ${age}대`);
			sex && (title += sex === 'M'? ' 남성': ' 여성');

			return title;
		},
		mapToSlide = function(ref){

			return ({path, title}) => {
				
				return ref.doc(path)
					.onSnapshot(doc => {
						if(doc && doc.exists){
							this.push(new Definition(path, title, doc.data()));
						}
					});
			}
		},
		makeSubscription = function(id){
			this.slides.length = 0;

			const today = new Date(),
				year = today.getFullYear(),
				month = leftPad(today.getMonth() + 1),
				summariesRef = db.collection('words').doc(id).collection('summaries'),
				fnMapToSlide = mapToSlide.call(this.slides, summariesRef),
				paths = [
					{path: `${year}`, title: getTitle(year)},
					{path: `${year}M`, title: getTitle(year, null, 'M')},
					{path: `${year}F`, title: getTitle(year, null, 'F')},
					{path: `${year}${month}`, title: getTitle(year, month)},
					{path: `${year}${month}M`, title: getTitle(year, month, 'M')},
					{path: `${year}${month}F`, title: getTitle(year, month, 'F')},
				];

			if(this.user){
				paths.push({ path: `${year}${this.user.sex}${this.user.age}`, title: getTitle(year, null, this.user.sex, this.user.age) });
				paths.push({ path: `${year}${month}${this.user.sex}${this.user.age}`, title: getTitle(year, month, this.user.sex, this.user.age) });
			
				db.collection('words').doc(id)
					.collection('votes').where('email', '==', this.user.email)
					.orderBy('createdBy', 'desc').limit(1)
					.onSnapshot(votes => {
						if(votes.docs.length){
							const vote = votes.docs[0].data()
							this.votedElement = vote.element;
						}else{
							this.votedElement = null;
						}
					});
			}

			subscriptions.length && (subscriptions.forEach(f => f()));
			subscriptions = paths.map(fnMapToSlide);
			summariesRef.doc(`${year}`)
				.onSnapshot(doc => {
					if(doc && doc.exists){
						this.summary = doc.data();
					}
				});				
		};

	export default {
		props: {
			id: {
				type: String,
				default: '4450009'
			}
		},
		data(){
			return {
				subject: '행복',
				selectedWord: null,
				votedElement: null,
				words: [],
				slides: [],
				summary: {},
				user: null,
				keyword: '',
				isNotEmpty: false,
				swiperOption: {
					slidesPerView: 1,
					spaceBetween: 30,
					loop: true,
					navigation: {
						nextEl: '.swiper-button-next',
						prevEl: '.swiper-button-prev'
					}
				},
				snackbar: {
					show: false,
    				position: 'center',
    				duration: 4000,
    				isInfinity: false,
    				message: ''
				}
			};
		},
		methods: {
			href(){
				this.$router.replace(`/${hash(this.selectedWord)}`);
			},
			share(){
				const slides = this.$refs.swiper.swiper.slides,
					i = this.$refs.swiper.swiper.activeIndex,
					credential = this.$session.get('credential'),
					id = slides[i].id,
					current = _.find(this.slides, {id}),
					text = `${current.title}의 ${this.subject} = ${current.content}`;

				FB.api('/me/feed', 'post', 
					{
						access_token: credential.accessToken,
						message: text, 
						link: 'http://blog.naver.com/asdkf20' 
					}, 
					result => {
						this.alert('Facebook에 게시되었습니다.');
					});
			},
			disabled(element){
				return this.votedElement && this.votedElement === element;
			},
			alert(message){
				this.snackbar.message = message;
				this.snackbar.show = true;
			},
			vote(element){
				db.collection('words').doc(this.id).collection('votes')
					.add({
						email: this.user.email,
						element: element,
						sex: this.user.sex,
						age: this.user.age
					})
					.catch(error => {
						console.error(error);
						this.alert('오류가 발생하였습니다.');
					});
			},
			save(){
				const reg = /[\r\n\t\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
				if(reg.test(this.keyword)){
					this.alert('공백 및 특수문자는 입력할 수 없습니다.');
					this.$refs.keyword.$el.focus();
					return;
				}
				if(!this.keyword){
					this.alert('1글자 이상 입력해 주세요!');
					this.$refs.keyword.$el.focus();
					return;
				}
				if(this.keyword.length > 10){
					this.alert('10글자 이상 입력할 수 없습니다.');
					this.$refs.keyword.$el.focus();
					return;
				}

				db.collection('words').doc(this.id).collection('votes')
					.add({
						email: this.user.email,
						element: this.keyword,
						sex: this.user.sex,
						age: this.user.age
					})
					.then(result => {
						this.alert('등록되었습니다.');
						this.keyword = '';
					})
					.catch(error => {
						console.error(error);
						this.alert('키워드 등록에 실패했습니다.');
					});
			}
		},
		watch: {
			summary(val){
				if(!val){
					Vue.set(this, 'isNotEmpty', false);
				}else{
					const keys = Object.keys(val);
					Vue.set(this, 'isNotEmpty', !!keys.length);
				}
			}
		},
		updated(){
			db.collection('words').doc(this.id)
				.get().then(doc => doc.exists && (this.subject = doc.data().name));
		},
		beforeRouteUpdate(to, from, next){
			console.log(this.id);
			console.log('route', to, from);
			makeSubscription.call(this, to.params.id);
			next();
		},
		created(){
			db.collection('words').orderBy('name')
				.onSnapshot(snapshot => {
					this.words = snapshot.docs.map(doc => doc.get('name'));
				});

			auth.onAuthStateChanged(user  => {	
				if(!user){
					this.user = null;
					makeSubscription.call(this, this.id);
					return;
				}

				const credential = this.$session.get('credential');
	            return FB.api('/me', {
	              fields: 'email,name,gender,location,birthday',
	              access_token: credential.accessToken
	            }, result => {
	                const birthday = new Date(result.birthday),
	                  today = new Date(),
	                  age = today.getFullYear() - birthday.getFullYear(),
	                  sex = result.gender === 'male' ? 'M': 'F';
	                this.user = { 
	                  	name: result.name,
	                  	email: result.email,
	                  	sex,
	                  	age: Math.floor(age/10) * 10
	                  };

	                  makeSubscription.call(this, this.id);

	            });            
			});

		}
	};
</script>

<style scoped>
	.swiper-slide {
		position: relative;		
		min-height: 150px;
	}

	.swiper-slide div {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		font-size: 1.5em;
		left: 2em;
		right: 2em;
	}

	.md-card {
		margin-bottom: 1em;
	}

	.md-content {
		margin-left: 16px;
		margin-right: 16px;
	}

	.md-list {
		border: 1px solid rgba(#000, .12);
	}	

	#list {
		max-height: 150px;
		overflow: auto;
	}
</style>
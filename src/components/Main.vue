<template>
	<div>
		<md-content>
			<md-autocomplete v-model="selectedWord" :md-options="words" :md-open-on-focus="true" md-layout="box" @md-changed="href" md-dense >
				<label>주제를 검색 하세요!</label>
			</md-autocomplete>
		</md-content>

		<md-card>
			<md-card-media>
				<swiper :options="swiperOption" ref="swiper" >
					<swiper-slide v-for="(def, key) in slides" :key="def.title" :id="key" >
						<p class="md-title">
							<md-icon>keyboard_arrow_right</md-icon>
							{{def.title}}의 {{subject}}이란?
						</p>
						<div>{{def.content}}</div>
					</swiper-slide>
					<div class="swiper-button-prev" slot="button-prev" ></div>
					<div class="swiper-button-next" slot="button-next" ></div>
				</swiper>
			</md-card-media>
			<md-card-actions>
				<md-button class="md-raised md-icon-button" @click.stop="share" >
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
						<md-button class="md-raised md-icon-button md-list-action" :disabled="disabled(key)">
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
				
				ref.doc(path)
					.onSnapshot(doc => {
						if(doc && doc.exists){
							this[path] = new Definition(title, doc.data());
						}
					});
			}
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
				slides: {},
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
					current = this.slides[id],
					text = `${current.title}의 ${this.subject} = ${current.content}`;

				FB.api('/me/feed', 
					'post', 
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
			save(){
				const reg = /[\r\n\t\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
				if(reg.test(this.keyword)){
					this.alert('공백 및 특수문자는 사용할 수 없습니다.');
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
		created(){
			db.collection('words').orderBy('name')
				.onSnapshot(snapshot => {
					this.words = snapshot.docs.map(doc => doc.get('name'));
				});

			const today = new Date(),
				year = today.getFullYear(),
				month = leftPad(today.getMonth() + 1),
				summariesRef = db.collection('words').doc(this.id).collection('summaries'),
				fnMapToSlide = mapToSlide.call(this.slides, summariesRef);		
			
			[
				{path: `${year}`, title: getTitle(year)},
				{path: `${year}M`, title: getTitle(year, null, 'M')},
				{path: `${year}F`, title: getTitle(year, null, 'F')},
				{path: `${year}${month}`, title: getTitle(year, month)},
				{path: `${year}${month}M`, title: getTitle(year, month, 'M')},
				{path: `${year}${month}F`, title: getTitle(year, month, 'F')},
			].forEach(fnMapToSlide);

			auth.onAuthStateChanged(user  => {	
				if(!user){
					this.user = null;
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

	                [
	                	{
	                		path: `${year}${sex}${age}`,
	                		title: getTitle(year, null, sex, age)
	                	},
	                	{
	                		path: `${year}${month}${sex}${age}`,
	                		title: getTitle(year, month, sex, age)
	                	}
	                ].forEach(fnMapToSlide);

					db.collection('words').doc(this.id)
						.collection('votes').where('email', '==', this.user.email)	
						.orderBy('createdBy', 'desc').limit(1)
						.get().then(votes => {
							if(votes.docs.length){
								const vote = votes.docs[0].data(),
									now = new Date(),
									gap = now.getTime() - vote.createdBy.getTime();
								this.votedElement = (gap > (1000 * 60 * 60 * 12)) ? vote.element: null;
							}else{
								this.votedElement = null;
							}
						});	                
	            });            
			});

			summariesRef.doc(`${year}${month}`)
				.onSnapshot(doc => {
					if(doc && doc.exists){
						this.summary = doc.data();
						console.dir(this.summary);
					}
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
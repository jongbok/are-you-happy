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
				<md-button class="md-raised md-icon-button" @click="share" >
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
				<md-list>
					<md-list-item v-for="(value, key) in summary" :key="key" >
						<div class="md-list-item-text" >
							<span>{{key}} <span class="md-caption" >{{value}}</span></span>
						</div>
						<md-button class="md-raised md-icon-button md-list-action" disabled>
							<md-icon class="md-primary">star</md-icon>
						</md-button>
					</md-list-item>
				</md-list>
			</md-card-content>
			<div>
				<md-field>
					<md-input placeholder="공감가는 키워드가 없다면 등록해 주세요!" ></md-input>
					<md-button class="md-raised md-primary" >등록</md-button>
				</md-field>
			</div>
		</md-card>

		<md-snackbar :md-position="snackbar.position" :md-duration="snackbar.duration" :md-active.sync="snackbar.show" md-persistent>
		    <span>Facebook에 게시되었습니다.</span>
		    <md-button class="md-primary" @click="snackbar.show = false">Retry</md-button>
		</md-snackbar>		
	</div>
</template>

<script>
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
				words: [],
				slides: {},
				summary: {},
				user: null,
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
    				isInfinity: false					
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
						this.snackbar.show = true
					});
			}
		},
		updated(){
			db.collection('words').doc(this.id).get()
				.then(doc => doc.exists && (this.subject = doc.data().name));
		},
		created(){
			db.collection('words').orderBy('name')
				.onSnapshot(snapshot => {
					this.words = snapshot.docs.map(doc => doc.get('name'));
				});

			const today = new Date(),
				year = today.getFullYear(),
				month = leftPad(today.getMonth() + 1),
				credential = this.$session.get('credential'),
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
	            });            
			});

			summariesRef.doc(`${year}${month}`)
				.onSnapshot(doc => {
					if(doc && doc.exists){
						this.summary = doc.data();
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
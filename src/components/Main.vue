<template>
	<div>
		<md-content>
			<md-autocomplete v-model="selectedWord" :md-options="words" :md-open-on-focus="true" md-layout="box" md-dense >
				<label>주제를 검색 하세요!</label>
			</md-autocomplete>
		</md-content>

		<md-card>
			<md-card-media>
				<swiper :options="swiperOption" >
					<swiper-slide>
						<p class="md-title">
							<md-icon>keyboard_arrow_right</md-icon>
							2018년의 행복이란?
						</p>
						<div>가족(40%) + 돈(30%) + 친구(20%) + 기타(10%)</div>
					</swiper-slide>
					<swiper-slide>
						<div>Slide 2</div>
					</swiper-slide>
					<swiper-slide>
						<div>Slide 3</div>
					</swiper-slide>
					<swiper-slide>
						<div>Slide 4</div>
					</swiper-slide>
					<swiper-slide>
						<div>Slide 5</div>
					</swiper-slide>
					<swiper-slide>
						<div>Slide 6</div>
					</swiper-slide>
					<swiper-slide>
						<div>Slide 7</div>
					</swiper-slide>
					<swiper-slide>
						<div>Slide 8</div>
					</swiper-slide>
					<div class="swiper-button-prev" slot="button-prev" ></div>
					<div class="swiper-button-next" slot="button-next" ></div>
				</swiper>
			</md-card-media>
			<md-card-actions>
				<md-button class="md-raised md-icon-button" >
					<md-icon>share</md-icon>
				</md-button>
			</md-card-actions>
		</md-card>

		<md-card>
			<md-card-header>
				<div class="md-title" >
					<md-icon>keyboard_arrow_right</md-icon>
					<span v-if="user" >{{user.name}}님의 행복이란?</span>
					<span v-else>당신의 행복이란?</span>
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
	</div>
</template>

<script>
	import {db, auth} from '@/helpers/FirebaseHelper';
	import _ from 'lodash';

	const leftPad = v => v > 9 ? v.toString(): `0${v}`;

	export default {
		props: {
			id: {
				type: String,
				default: '4450009'
			}
		},
		data(){
			return {
				selectedWord: null,
				words: [],
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
				}
			};
		},
		created(){
			db.collection('words').orderBy('name')
				.onSnapshot(snapshot => {
					this.words = snapshot.docs.map(doc => doc.get('name'));
				});

			const today = new Date(),
				year = today.getFullYear(),
				month = today.getMonth() + 1,
				path = year + leftPad(month),
				credential = this.$session.get('credential'),
				summariesRef = db.collection('words').doc(this.id).collection('summaries');

			auth.onAuthStateChanged(user  => {	
				if(!user){
					this.user = null;
					return;
				}

	            return FB.api('/me', {
	              fields: 'email,name,gender,location,birthday',
	              access_token: credential.accessToken
	            }, result => {
	            	console.dir(result);
	                const birthday = new Date(result.birthday),
	                  today = new Date(),
	                  age = today.getFullYear() - birthday.getFullYear(),
	                  sex = result.gender === 'male' ? 'M': 'F';
	                this.user = { 
	                  	name: result.name,
	                  	email: result.email,
	                  	sex, 
	                  	age
	                  };

	                console.dir(result);
	            });            
			});

			summariesRef.doc(path)
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
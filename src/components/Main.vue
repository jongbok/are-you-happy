<template>
	<div>
		<md-content>
			<md-autocomplete v-model="selectedSubject" :md-options="subjects" :md-open-on-focus="false" md-layout="box" md-dense >
				<label>주제를 검색 하세요!</label>
			</md-autocomplete>
		</md-content>

		<md-card>
			<md-card-header>
				<div class="md-title" >
					<md-icon>keyboard_arrow_right</md-icon>
					2018년의 행복이란?
				</div>				
			</md-card-header>
			<md-card-media>
				<swiper :options="swiperOption" >
					<swiper-slide>
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
				<md-button class="md-icon-button" >
					<md-icon>share</md-icon>
				</md-button>
			</md-card-actions>
		</md-card>

		<md-card>
			<md-card-header>
				<div class="md-title" >
					<md-icon>keyboard_arrow_right</md-icon>
					2018년 2월 1일 오후 당신의 행복이란?
				</div>
			</md-card-header>
			<md-card-content id="list" class="md-scrollbar" >
				<md-list>
					<md-list-item>
						<div class="md-list-item-text" >
							<span>가족 <span class="md-caption" >36명</span></span>
						</div>
						<md-button class="md-raised md-icon-button md-list-action" disabled>
							<md-icon class="md-primary">star</md-icon>
						</md-button>
					</md-list-item>
					<md-list-item>
						<div class="md-list-item-text" >
							<span>돈</span>
						</div>
						<md-button class="md-raised md-icon-button md-list-action">
							<md-icon>star</md-icon>
						</md-button>
					</md-list-item>
					<md-list-item>
						<div class="md-list-item-text" >
							<span>친구</span>
						</div>

						<md-button class="md-raised md-icon-button md-list-action">
							<md-icon>star</md-icon>
						</md-button>						
					</md-list-item>
					<md-list-item>
						<div class="md-list-item-text" >
							<span>명예</span>
						</div>

						<md-button class="md-raised md-icon-button md-list-action">
							<md-icon>star</md-icon>
						</md-button>						
					</md-list-item>
					<md-list-item>
						<div class="md-list-item-text" >
							<span>사랑</span>
						</div>

						<md-button class="md-raised md-icon-button md-list-action">
							<md-icon>star</md-icon>
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
	
	export default {
		data(){
			return {
				selectedSubject: null,
				subjects: [
					'행복',
					'가족',
					'돈',
					'명예',
					'사랑'
				],
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
		}
	};
</script>

<style scoped>
	.swiper-slide {
		background-color: #eee;
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
import _ from 'lodash';

const map = new Map();
map[Symbol.iterator] = function* () {
    yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
};

class Definition {

	constructor(title, summary){
		this.title = title;
		const keys = _.keys(summary);
		keys.forEach(key => map.set(key, summary[key]));
	}

	get content(){
		const total = _.sumBy([...map], m => m[1]),
			rets = [];
		let percent,
			accrue = 0;

		if(!total){
			return '등록된 키워드가 없습니다. 최초로 공감키워드를 등록해 보세요!';
		}

		for(let [key, value] of map){
			percent = Math.floor(value/total*100);
			accrue += percent;
			rets.push(`${key}(${percent}%)`);
			if(rets.length > 4) 
				break;
		}

		if(accrue < 100){
			rets.push(`기타(${100 - accrue}%)`);
		}

		return rets.join(' + ');
	}
}

export default Definition;
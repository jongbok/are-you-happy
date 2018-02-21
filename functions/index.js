const functions = require('firebase-functions'),
	admin = require('firebase-admin'),
	hash = require('string-hash');

admin.initializeApp(functions.config().firebase);
const db = admin.firestore(),
	leftPad = v => v >= 10 ? v.toString(): `0${v}`;
	delay = 1000 * 60 * 60 * 12;

exports.aggregateVotes = functions.firestore
	.document('words/{wordId}/votes/{voteId}')
	.onCreate(event => {
		const wordId = event.params.wordId,
			voteId = event.params.voteId,
			newVote = event.data.data(),
			email = newVote.email,
			wordsRef = db.collection('words'),
			wordRef = wordsRef.doc(wordId),
			newWordRef = wordsRef.doc(hash(newVote.element).toString());
			voteRef = wordRef.collection('votes').where('email', '==', email).orderBy('createdBy', 'desc').limit(1),
			summariesRef = wordRef.collection('summaries'),
			batch = db.batch(),
			newDate = new Date(),
			serverTimestamp = newDate.getTime(),
			newYear = newDate.getFullYear(),
			newMonth = leftPad(newDate.getMonth() + 1),
			newAge = newVote.age,
			newSex = newVote.sex,
			promises = [];
		let p;

		p = event.data.ref.set({createdBy: newDate}, {merge: true});
		promises.push(p);

		p = newWordRef.get()
		.then(word => {
			if(!word.exists){
				batch.set(word.ref, {name: newVote.element});
			}
		});
		promises.push(p);

		const increasePromises = [
				`${newYear}`, 
				`${newYear}${newSex}`,
				`${newYear}${newSex}${newAge}`,
				`${newYear}${newMonth}`,
				`${newYear}${newMonth}${newSex}`,
				`${newYear}${newMonth}${newSex}${newAge}`
			].map(path => { 
				return summariesRef.doc(path).get().then(doc => {
					const data = doc.data(),
						element = newVote.element,
						param = {};
					param[element] = doc.exists && data[element] ? data[element] + 1: 1;
					batch.set(doc.ref, param, {merge: true});
				});
			});
		promises.push(Promise.all(increasePromises));

		p = voteRef.get()
		.then(votes => {
			if(!votes.docs.length){
				return Promise.resolve('frist vote!');
			}

			const vote = votes.docs[votes.docs.length - 1],
				oldVote = vote.data(),
				oldDate = oldVote.createdBy,
				oldYear = oldDate.getFullYear(),
				oldMonth = leftPad(oldDate.getMonth() + 1),
				oldAge = oldVote.age,
				oldSex = oldVote.sex,
				gap = serverTimestamp - oldVote.createdBy.getTime();

			if(gap > delay){
				return Promise.resolve('It took 12 hours!');
			}

			const decreasePromises = [
					`${oldYear}`,
					`${oldYear}${oldSex}`,
					`${oldYear}${oldSex}${oldAge}`,
					`${oldYear}${oldMonth}`,
					`${oldYear}${oldMonth}${oldSex}`,
					`${oldYear}${oldMonth}${oldSex}${oldAge}`
				].map(path => {

					return summariesRef.doc(path).get().then(doc => {
						const data = doc.data(),
							element = oldVote.element,
							param = {};
						if(doc.exists){
							param[element] = data[element] - 1;
							batch.set(doc.ref, param, {merge: true});
						}
					});
				});

			return Promise.all(decreasePromises);
		});
		promises.push(p);

		return Promise.all(promises).then(result => batch.commit());
	});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

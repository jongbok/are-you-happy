import firebase from 'firebase';

const  provider = new firebase.auth.FacebookAuthProvider();
provider.addScope('email');
provider.addScope('publish_actions');
provider.addScope('public_profile');
provider.addScope('user_about_me');
provider.addScope('user_location');

export default provider;
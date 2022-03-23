var admin = require("firebase-admin");

var serviceAccount = require("./pitchventure-bc3a3-firebase-adminsdk-lv6md-053bc3bf1b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pitchventure-bc3a3-default-rtdb.firebaseio.com"
});


  exports.onLogin =  (account) => {
    const message = {
        notification: {
          title: 'Login',
          body: 'You are logged in successfully!!'
        }
      };

    var options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
    };
    account.fcmToken.forEach(token => 
        admin.messaging().sendToDevice(token, message, options).then(function(response){
            console.log("Successfully sent message", response);
        })
        .catch(function(error) {
            console.log("Error in sending message", error);
        })
        );
    
  }

  exports.onRequest =  (franchise,storeOwner) => {
    const message = {
        notification: {
          title: 'New Request',
          body: storeOwner.name + 'sent you a request'
        }
      };

    var options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
    };
    franchise.fcmToken.forEach(token => 
        admin.messaging().sendToDevice(token, message, options).then(function(response){
            console.log("Successfully sent message", response);
        })
        .catch(function(error) {
            console.log("Error in sending message", error);
        })
        );
    
  }
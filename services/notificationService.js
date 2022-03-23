var admin = require("firebase-admin");

var serviceAccount = require("./pitchventure-bc3a3-firebase-adminsdk-lv6md-053bc3bf1b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pitchventure-bc3a3-default-rtdb.firebaseio.com"
});


  exports.onLogin =  (account) => {
    var payload = {
        data: {
            MyKey1: "Logged In"
        }
    };

    var options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
    };
    account.fcmToken.forEach(token => 
        admin.messaging().sendToDevice(token, payload, options).then(function(response){
            console.log("Successfully sent message", response);
        })
        .catch(function(error) {
            console.log("Error in sending message", error);
        })
        );
    
  }
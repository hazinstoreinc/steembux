angular.module('steembux.controllers', [])
.controller('QrScanCtrl',function($q,$rootScope,$scope,$state){

 $scope.$on('$ionicView.enter', function(e) {
    console.log("view changed: ",e);
      $scope.onScan();
  });

  $scope.closeVideo = function(){
      $scope.mediaStream.getTracks().forEach(function(track){
          console.log("stopping track: ",track);
          track.stop();
      });
  };

/**
   * Start the QR ScannerService
   */
  $scope.onScan = function(){
    var video =  document.getElementById('videoElement');
    var canvas = document.getElementById('qr-canvas');
    console.log("video: ",video);
    console.log("canvas: ",canvas);
    $scope.startScan(video,canvas);
  };

 
  $scope.startScan = function(video,canvas){

      $scope.scanning = false;
      $scope.video = video;
      $scope.canvas = canvas;
      $scope.context = canvas.getContext('2d');
      $scope.qr = new QrCode();
      $scope.mediaStream = null;
      $scope.qr.callback = $scope.onFrameProcessed;

      console.log("video: ",$scope.video);
      console.log("canvas: ",$scope.canvas); 
      console.log("context: ",$scope.context); 
      console.log("starting scan...");
      
      $scope.video.addEventListener('timeupdate', (e)=>{
          
          //console.log("$scope is: ",$scope);
          $scope.video.pause();

          //console.log("context: ",$scope.context); 
          $scope.context.drawImage($scope.video, 0, 0);
          
          //console.log("decoding...");
          $scope.qr.decode($scope.context.getImageData(0, 0, 300, 300));
      }, false);

      //Why 300 x 300?  Because QR scanning works much faster with less pixels to have to deal with!
      var constraints = {
          audio : false,
          video: { 
              facingMode: "environment",
              width: 300, height: 300 
          }
      }
      //open video stream
      navigator.mediaDevices.getUserMedia(constraints).then((mediaStream)=>{
          $scope.video.srcObject = mediaStream;
          $scope.mediaStream = mediaStream;
          $scope.scanning = true;
          video.onloadedmetadata = function(e) {
              video.play();
          };
      }).catch((err)=>{
          console.error(err);
          $ionicPopup.alert({
              title : "Error!",
              template : "There was an error acquiring the camera "+JSON.stringify(err)
          });
          $state.go("app.payments");
      });
  };

  $scope.onCancelScan = function(){
      //closeVideo
      console.log("cancelling scan...");
      $scope.scanning = false;
      $scope.closeVideo();
      $state.go("app.payments");
  };

  $scope.onFrameProcessed = function(result,err){           
      //console.log("decode finished: ",result,err);
      //console.log("$scope is: ",$scope);
      
        if(result){
            $scope.closeVideo(); 
            console.log(result);
            
            new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=").play(); //FYI That's how you spell BEEP!

            $rootScope.qrData = result;
            $state.go("app.payments");
        }else{
            if(err){
                console.log(err);
            }
            if($scope.scanning){
                $scope.video.play();
            }
        }
    };
})
.controller('AppCtrl', function($rootScope, $scope, $state, $stateParams
            , $window, $ionicModal, $ionicPopup, $timeout, $interval, $ionicHistory
            , AvatarService, SettingsService, WalletService, ContactsService) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  $scope.$on('$ionicView.enter', function(e) {
    console.log("view changed: ",e);
    //Make sure back is disabled
      $ionicHistory.nextViewOptions({
          disableBack: true
      });
      if($rootScope.qrData){
        $scope.handleQr();
      }
  });

  $scope.handleQr = function(){
    var data = $rootScope.qrData;
    delete $rootScope.qrData;
    $ionicPopup.alert({
      title : "Success!",
      template : "Scanner Returned "+data
    })
    //replace / and @ with empty
    data = data.replace(/\//g,"");
    data = data.replace(/@/g,"");
    /** 
     * strategy, starting with...
     * bitcoin:1HJ4FFBRkbVBVMzbR4NEyXcjit2NkAsfty?amount=1&memo=hello
     * first...
     * [bitcoin]:[1HJ4FFBRkbVBVMzbR4NEyXcjit2NkAsfty?amount=1&memo=hello]
     * second..
     * [bitcoin]:[1HJ4FFBRkbVBVMzbR4NEyXcjit2NkAsfty]?[amount=1&memo=hello]
     * third...
     * [bitcoin]:[1HJ4FFBRkbVBVMzbR4NEyXcjit2NkAsfty]?[amount=1]&[memo=hello]
     * final...
     * [bitcoin]:[1HJ4FFBRkbVBVMzbR4NEyXcjit2NkAsfty]?[amount]=[1]&[memo]=[hello]
    */

    var payment = {};
    first = data.split(":");
    if(first[1]){
      payment.coin = first[0];
      second = first[1].split("?");
      payment.dest = second[0];
      if(second[1]){
        second[1].split("&").forEach(function(str){
          let pair = str.split("=");
          payment[pair[0]] = pair[1]; 
        });
      }
      console.log("parsed: ",payment);
    }else{
      //Was not an array
      payment.dest = first;
    }
    if(payment.amount && (typeof payment.amount === 'string')){
      payment.amount = parseFloat(payment.amount);
    }
    $scope.payment = payment;
    /*
    console.log(parser.protocol); // => "http:"
    console.log(parser.hostname); // => "example.com"
    console.log(parser.port);     // => "3000"
    console.log(parser.pathname); // => "/pathname/"
    console.log(parser.search);   // => "?search=test"
    console.log(parser.hash);     // => "#hash"
    console.log(parser.host);     // => "example.com:3000"
    */    

  };

  

  // Initialization vectors
  $scope.loginData = {};
  $scope.settings = SettingsService.fetch() || {
    keys :{
      active : null,
      posting : null,
      memo : null
    }
  };
  $scope.account = {};
  $scope.history = {};
  $scope.failcount = 0;
  $scope.paymentUrl = "sbd:williambanks?amount=1&amp;memo=thank%20you%20keep%20steemin";
  $scope.qrWidth = $window.innerWidth * 0.9;
  $scope.history = [];

  /**
   * Convenience function to check and see if we have some stored settings.
   */
  $scope.hasSettings = function(){
    return SettingsService.fetch() ? true : false;
  };

  /**
   * Logout and reset the UI.  Note that this does not clear any of the settings!
   */
  $scope.doLogout = function(){
    $scope.loginData = {};
    $scope.settings = {};
    $ionicHistory.nextViewOptions({
        disableBack: true
    });
    $state.go("app.login");
  };

  /**
   * Called once we are actually logged in or created
   */
  $scope.onLoggedIn = function(){
      $scope.loginData.status = true;
      $scope.contacts = ContactsService.fetch();
      
      WalletService.init({},$scope.settings.username)
      .then((account)=>{
          console.log("account: ",account);
          $scope.account = account[0];
          WalletService.fetchHistory($scope.settings.username,$scope.history)
            .then((data)=>{
              $scope.history = data;
              $state.go("app.history");
            },$scope.onError);

          $interval(()=>{
            WalletService.fetchHistory($scope.settings.username,$scope.history)
            .then((data)=>{
              $scope.history = data;
            },$scope.onError);
          },30000);
          

          $scope.keyring = {};
          if($scope.settings.keys){
            $scope.restoreKeyring();
          }else{
            $scope.settings.keys = {
              active : null,
              posting : null,
              memo : null
            }
            $ionicPopup.alert({
              title : "Welcome!",
              template : "It appears your account isn't setup yet.  Please make sure you input your master password or the individual private keys in the settings screen."
            });
            $state.go("app.settings");
          }
          
      },$scope.onError);
  };

  /**
   * Create a blank new contact object (used by addressbook.html + button)
   */
  $scope.newContact = function(){
    $scope.newcontact = {};
  }
/**
 * create a new payment object from currently selected contact
 */
  $scope.newPayment = function(contact){
    $scope.payment = {
        avatar : contact.avatar,
        curcode : contact.address.split(":")[0].replace(/:/,''),
        dest : contact.address.split(":")[1].replace(/:/,''),
        amount : 1.00,
        memo : ""
    };
    $scope.updatePaymentUrl();
    $state.go("app.payments");
  };

  /**
   * Update the payment URL
   */
  $scope.updatePaymentUrl = function(){
     if($scope.payment.dest.indexOf('@') != -1){
            $scope.payment.dest = $scope.payment.dest.replace(/@/g,'');
        }
        $scope.paymentUrl = $scope.payment.curcode+':'+$scope.payment.dest
        +'?amount='+$scope.payment.amount;
        if($scope.payment.memo){
             $scope.paymentUrl+='&memo='+encodeURI($scope.payment.memo);
        }
        console.log("paymentUrl has updated: ", $scope.paymentUrl);
  };

  /**
  * Perform the login action when the user submits the login form
  */
  $scope.doLogin = function() {
      console.log('Doing login', $scope.loginData);
      //Make sure back is disabled
      $ionicHistory.nextViewOptions({
          disableBack: true
      });
      //Did they enter a username and password?
      if($scope.loginData.username && $scope.loginData.password){
        //Yes they did, do we have settings?
          $scope.settings = SettingsService.fetch();
          
          if(!$scope.settings.username){
            //No settings found, this is a first run
              $scope.settings = {};
              $scope.settings.password = $scope.loginData.password; //We should be storing a hash of this ASAP
              $scope.settings.username = $scope.loginData.username;
              SettingsService.store($scope.settings);
              $state.go("app.settings");
              $ionicHistory.clearHistory();
              $scope.onLoggedIn();
          }else{
            //There was a username and probably a password stored, so check those
            if($scope.settings.username == $scope.loginData.username && $scope.settings.password == $scope.loginData.password){
              //It was a match...  This is where all the post login setup stuff occurs
              $scope.onLoggedIn();
          }else{
            //There was no match
            console.debug($scope.settings);
            $scope.onError("Username or Password Mismatch");
            $scope.failcount++;
            if($scope.failcount == 5){
              $scope.settings = {};
              $scope.loginData = {};
              $scope.onError("All settings have been erased as an emergency precaution, you will need to go to settings and reconfigure the application.");
              SettingsService.store($scope.settings);
              $scope.failcount = 0;
            }
          }
        }
      }else{
        //They didn't enter either a username or password or both.
        $scope.onError("You must enter a username and password to proceed, if you don't have one then make one up.  This is for your phone only.");
      }
  };
 /* Debug function to see the current settings
  $scope.onSettingsChange = function(){
    console.log("rootscope: ",$rootScope.settings);
    console.log("scope: ",$scope.settings);
  }
  */

  $scope.generateKeys = function(){
      var keyring = WalletService.generateKeys($scope.settings.username, $scope.settings.masterpass);
      console.log("keyring: ",keyring);
      var privKeys = keyring.privKeys; 
      console.log("privKeys: ",privKeys);
      var keys = Object.getOwnPropertyNames(privKeys);
      console.log("adding keys to: ",$scope.settings);
      if(!$scope.settings.keys){
        $scope.settings.keys = {
          active : null,
          posting : null,
          memo : null
        };
      }
      keys.forEach(function(key){
        console.log("key: ", key, " is ",privKeys[key].toWif());
        $scope.settings.keys[key] = privKeys[key].toWif();
      });
      delete $scope.settings.masterpass; //we don't keep this
      //$scope.keyring = keyring;
  }

  $scope.restoreKeyring = function(){
    console.log("restoring keyring");
    var keys = Object.getOwnPropertyNames($scope.settings.keys);
    keys.forEach((role)=>{
      $scope.keyring[role] = 
        WalletService
        .fromPrivKey($scope.settings.username, $scope.settings.keys[role], role);
    });
  }
  /**
   * Save the settings
   */
  $scope.saveSettings = function(){
    SettingsService.store($scope.settings);
    if($scope.settings.masterpass){
        $scope.generateKeys();
    }

    AvatarService.fetch($scope.settings).then((avatar)=>{
      $scope.settings.avatar = avatar;
      console.log("storing: ",$scope.settings);
      SettingsService.store($scope.settings);
      $scope.loginData.username = $scope.settings.username;
      $ionicPopup.alert(
        {
          title : "Saved!",
          template : "Your settings have been saved, you can use the menu to navigate the rest of the app"
        }
      );
    },$scope.onError);
  };

  /**
   * Save a new contact
   */
  $scope.saveContact = function(){
    AvatarService.fetch($scope.newcontact).then((avatar)=>{
      $scope.newcontact.avatar = avatar;
      $scope.contacts.push($scope.newcontact);
      ContactsService.store($scope.contacts);
      $ionicPopup.alert({
        title : "Success!",
        template : "New contact has been saved successfully!"
      });
      delete $scope.newcontact;
    });
  };

  /**
   * update avatar
   */
  $scope.updateAvatar = function(id){
    AvatarService.fetch(id).then((avatar)=>{
      id.avatar = avatar;
      console.log("id");
    });
  }

  /**
   * Discard a contact from the contactslist or newcontact
   */
  $scope.discardContact = function(contact){
    if(!contact){
      delete $scope.newcontact;
    }else{
      $ionicPopup.confirm({
        title : "Confirm",
        template : "Are you sure you want to remove this contact?  This action cannot be undone."
      }).then((res)=>{
        var index = $scope.contacts.indexOf(contact);
        if (index > -1) {
            $scope.contacts.splice(index, 1);
            ContactsService.store($scope.contacts);
        }
      });
    }
  };

  /**
   * send a payment, this function is called by the "pay" button on the "payments page"
   */
  $scope.sendPayment = function(){
    $scope.restoreKeyring();
    if($scope.keyring && $scope.keyring.active){
      $ionicPopup.confirm({
          title : "Confirm",
          template : "Are you sure you want to send "
          +$scope.payment.amount+" "+$scope.payment.curcode
          +" with memo "+$scope.payment.memo
          +" to "+$scope.payment.dest+"? This action cannot be undone"
        }).then((res)=>{
          if(res){
            WalletService.sendPayment($scope.account,$scope.payment,$scope.settings.keys,$scope.keyring)
            .then((result)=>{
              //pop up a success dialog
              $ionicPopup.alert({
                title: "Success!",
                template : "Sent "+$scope.payment.amount+" "+$scope.payment.curcode
                  +" with memo "+$scope.payment.memo
                  +" to "+$scope.payment.dest
            })
            },$scope.error);
          }
        });
    }else{
      console.error("missing keys on $scope.keyring: ",$scope.keyring);
      $scope.onError("Your keys are missing from the keyring: "+JSON.stringify($scope.settings));
    }
  }

 
    /**
   * General purpose error function
   */
  $scope.onError = function(err){
    console.error(err);
    $ionicPopup.alert({
      title : "Error!",
      template : JSON.stringify(err)
    });
  };

  /**
   * QR Scan Button on the Payments Page
   */
  $scope.scanStart = function(){
    console.log("scanner button pressed");
    $state.go('app.scan');
  };
});


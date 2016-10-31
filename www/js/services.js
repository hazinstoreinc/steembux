angular.module('steembux.services', [])

.factory('BlankFactory', [function(){

}])
.service('SettingsService',function(){
    return {
        get : function(name){
            var settings = JSON.parse(localStorage.getItem('settings'));
            if(name){
                return settings[name];
            }else{
                return settings;
            }
        },
        save : function(settings){
            localStorage.setItem('settings',JSON.stringify(settings));
        }
    }
})
.service('AvatarService', ['$q','$http',function($q){
    return {
        fetch : function(obj) {
            var deferred = $q.defer();
            var url = encodeURI("https://eightbitavatar.herokuapp.com/?id="+obj.username+"&s="+obj.gender);
            console.log("fetching: ",url);
            deferred.resolve(url);
            return deferred.promise;
        }
    }
}])
.service('BlockTradesService', ['$q','$http',function($q,$http){
    return {
        blocktradesURL : "https://blocktrades.us/api/v2/simple-api/initiate-trade",
        fetchAddress : function(obj) {
            var deferred = $q.defer();
            $http.post(blocktradesURL,obj).then(deferred.resolve,deferred.reject);
            return deferred.promise;
        }
    }
}])
.service('SettingsService', [function(){
    return {
        fetch : function() {
            //console.log("calling settings.fetch");
            var settings = null;
            try{
                settings = JSON.parse(localStorage.getItem('settings'));
            }catch(err){
                console.error("Safely caught: ",err);
                console.warn("Something corrupted our settings, clearing them now!");
                localStorage.clear("settings");
            }

            if(!settings){
                settings = {
                    username : null,
                    hideBalance : true,
                    gender : 'male',
                    name : "",
                    pin : null,
                    memokey : null,
                    activekey : null,
                    avatar : "//eightbitavatar.herokuapp.com/?id=unknown&s=male",
                    keys :{
                        active : null,
                        posting : null,
                        memo : null
                    }
                }
            }
            return settings;
        },
        store : function(settings){
            console.log("calling settings.store: ",settings);
            localStorage.setItem('settings',JSON.stringify(settings));
        }
    }
}])
.service('ContactsService', [function(){
    return {
        fetch : function() {
            //console.log("calling contacts.fetch");
            var contacts = null;
            try{
                contacts = JSON.parse(localStorage.getItem('contacts'));
            }catch(err){
                console.error("Safely caught: ",err);
                console.warn("Something corrupted our contacts, clearing them now!");
                localStorage.clear("contacts");
            }
            if(!contacts){
                contacts = [
                    {
                        username : "William Banks",
                        address : "sbd:williambanks",
                        gender : "male",
                        avatar : "//eightbitavatar.herokuapp.com/?id=WilliamBanks&s=male",
                        nodelete : true
                    },
                    {
                        username : "Ghostwriter",
                        address : "sbd:ghostwriter",
                        gender : "female",
                        avatar : "//eightbitavatar.herokuapp.com/?id=GhOSTWrITER&s=female",
                        nodelete : true
                    },
                    {
                        username : "badassbarbie",
                        address : "sbd:badassbarbie",
                        gender : "female",
                        avatar : "//eightbitavatar.herokuapp.com/?id=BADASSBARBIE&s=female",
                        nodelete : true
                    },
                    {
                        username : "alechahn",
                        address : "sbd:alechahn",
                        gender : "female",
                        avatar : "//eightbitavatar.herokuapp.com/?id=alechahn&s=male",
                        nodelete : true
                    },
                    {
                        username : "tyler-fletcher",
                        address : "sbd:tyler-fletcher",
                        gender : "male",
                        avatar : "//eightbitavatar.herokuapp.com/?id=tyler-fletcher&s=male",
                        nodelete : true
                    },
                    {
                        username : "someguy123",
                        address : "sbd:someguy123",
                        gender : "male",
                        avatar : "//eightbitavatar.herokuapp.com/?id=someguy123&s=male",
                        nodelete : true
                    },
                    {
                        username : "sykochica",
                        address : "sbd:sykochica",
                        gender : "male",
                        avatar : "//eightbitavatar.herokuapp.com/?id=sykochica&s=female",
                        nodelete : true
                    }
                ];
                this.store(contacts);
            }
            return contacts;
        },
        store : function(contacts){
            //console.log("calling contacts.store: ",contacts);
            localStorage.setItem('contacts',JSON.stringify(contacts));
        }
    }
}])
.service('WalletService', ['$q',function($q,$window,$timeout){
    return {
        Client : steemJS.steemRPC.Client,
        Account : null,
        login : null,
        Api : null,
        history : null,
        /**
         * Start the process of connecting to the websocket and initializing the keystore
         */
        init : function(options,username){
            console.log("Initializing WalletService with ",options,username);
            var deferred = $q.defer();
            if(!this.Api){
                this.Api = this.Client.get(options, true);
                this.Api.initPromise
                .then((resp)=>{
                    console.log("steemJS: ",steemJS);
                    this.login = new steemJS.Login();
                    this.Api.database_api().exec("get_accounts", [[username]]).then(deferred.resolve,deferred.reject)
                },
                deferred.reject);
               
            }else{
                console.log("WalletService was already initialized");
                this.Api.database_api().exec("get_accounts", [[username]]).then(deferred.resolve,deferred.reject);
            }
            return deferred.promise;
        },

        /**
         * Check validity of keys and setup "login" which is actually a client side signer since we already have keys at this point.
         * This should be called before saving settings
         */
        fromPrivKey : function(username,keyWif,role){
            
            //Login roles...
            //["active", 0 //The active key is used to make transfers and place orders in the internal market.
            //"owner",   1 //The owner key is the master key for the account and is required to change the other keys.
            //"posting", 2 //The posting key is used for posting and voting. It should be different from the active and owner keys.
            //"memo"     3 //The memo key is used to create and read memos.
            //]
            this.login.setRoles([role]);
            return this.login.fromPrivKey(username,keyWif,[role],"STM"); 
        },

        generateKeys : function(accountName, password){
            var prefix = "STM";
            var roles = ["active","posting","memo"];
            console.log(accountName, password);
            return this.login.generateKeys(accountName, password, roles, prefix);
        },

        fetchHistory : function(username,history){
            var deferred = $q.defer();
            this.fetchHistoryItems(username,-1,100).then((items)=>{
                    console.log("start.WalletService.fetchHistoryItems: ",items);
                    
                    while(items.length > 0){
                        var arr = items.pop();
                        //console.log("arr: ",arr);
                        let obj = arr[1];
                        if(!obj){
                            break;
                        }
                        let timestamp = obj.timestamp;
                        let op = obj.op;
                        let code = op[0];
                        let item = op[1];

                        //Need to check history for uniqueness
                        switch(code){
                            case "transfer":
                            case "transfer_to_savings":
                            case "interest":
                            case "curation_reward":
                            case "author_reward":
                                item.timestamp = timestamp;
                                item.op = code;
                                if(!history.find(function(el){
                                    return el.timestamp == item.timestamp;
                                })){
                                    history.push(item);
                                }
                                //console.debug("found a "+code+" : ",item);
                            break;
                            case "vote":
                            case "comment":
                            case "fill_order":
                                //console.log("Skipping votes, comments and fill_orders such as ",item);
                            break;
                            default:
                                //console.warn("No idea what a "+code+" is but it looks like ",item);
                            break;
                        }
                    }
                    history.sort(function(a,b){
                        return (new Date(b.timestamp) - new Date(a.timestamp));
                    });
                    localStorage.setItem('history',JSON.stringify(history));
                    //console.log("history length is now: ",history.length);
                    deferred.resolve(history);
                },this.onError);
            return deferred.promise;
        },
       
        /**
         * Send a payment to someone, requires payment object and keys
         */
        sendPayment : function(account,payment,keys,keyring){
            var deferred = $q.defer();
            var activeLogin = new steemJS.Login();
            var amount = payment.amount.toFixed(3) +" "+payment.curcode.toUpperCase();
            var to = payment.dest;
            var memo = payment.memo;
            var curcode = payment.curcode;
            console.log("account: ",account);
            console.log("keys: ",keys);
            console.log("keyring: ",keyring);
            console.log("amount: ",amount);
            
            var key = keys.active;
            var pubKey = keyring.active.pubKeys.active;

            activeLogin.setRoles(["active"]);

            var tochk = {
                accountName: account.name,
                password : null,
                privateKey: keys.active,
                auths: {
                    active: account.active.key_auths
                }
            };
            console.log("checking: ",tochk);
            var authorized = activeLogin.checkKeys(tochk);
            console.log("auhorized result was: ",authorized);

            if(authorized){
                var tr = new steemJS.TransactionBuilder();
                var p =  {
                    from : account.name,
                    to: to, 
                    amount: amount,
                    memo: memo
                };

                console.log("payment: ",p);
                tr.add_type_operation("transfer",p);
                console.log("added operation, now processing tx with ",activeLogin.getPubKeys());

                tr.process_transaction(activeLogin, null, true).then(deferred.resolve,deferred.reject);
            }else{
                deferred.reject("There was a problem with your active key");
            }
            return deferred.promise;
        },
        
        /**
         * fetch transactional history
         */
        fetchHistoryItems : function(username,from,limit){
            console.log("WalletService.fetchHistory with ",username,from,limit);
            var deferred = $q.defer();
            this.Api.database_api().exec("get_account_history", [username,from,limit]).then(deferred.resolve,deferred.reject);
            return deferred.promise;
        },

        /**
         * cb for error handling
         */
        onError : function(err){
            console.error(err);
        }
        
    };
}]);

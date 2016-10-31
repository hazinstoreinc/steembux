This is the open source version of steembux, the simple wallet for steem dollars.

It is provided without warranty of any kind and is licensed under terms of GPL v3
Pull requests are gladly accepted.

In addition to the code here you will need to have npm v3, node v6, as well as cordova latest and ionic 1x latest.
You will also need to have steemjs-lib from https://github.com/svk31/steemjs-lib
This should be added to the bower.json file via bower add steemjs-lib
I have left it off this version because I am personally having issues with bower but that is probably something quirky with my system.  It was working before.

This is NOT a stable release it is intended for your own personal experimentation.
To get it working you will need to do the following
`sudo apt install npm nodejs

npm install -g cordova ionic

git clone https://github.com/svk31/steemjs-lib

git clone https://github.com/hazinstoreinc/steembux.git

cd steembux/www

bower add steemjs-lib

cd ..

ionic platform add android

ionic plugin add phonegap-barcodescanner

ionic run
`
Note that I have added a fallback for QR scanning to allow testing in the browser and am working to add this to my own fork of the phonegap-barcodescanner but it will only be able to support standard QR codes, none of the extra barcode types supported by the cordova plugin will be available.
I will commit that as soon as the work is complete on it, because it annoys me to not be able to test functionality in the browser when that's kinda the point of phonegap.
Steembux is part of the [havin.store](www.havin.store) project.

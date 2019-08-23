# widget
Widget for embedding vouch feeds into web pages

# instruction

- clone project to folder
- run command in terminal "npm install"

after this you can work in two ways - dev or prod

1. run command "gulp dev" // for developing version (with https://api.dev.vouch4.me/v1/widget/ endpoint)

	- build/js - folder with js file
	- build/styles - folder with css file
	- build/img - folder with images (logo and spinner)
 
2. run command "gulp prod" // for production version (with https://api.vouch4.me/v1/widget/ endpoint)
	- production/js - folder with js file
	- production/css - folder with css file
	- production/img - folder with images (logo and spinner)
	
	
in both ways you need to copy "js", "styles" and "img" folders and upload it to your server (for example https://testserver.com)
after this you can insert widget on any sites in next way "path to server" + "js/index.min.js"  (for example https://testserver.com/js/index.min.js)


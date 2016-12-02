Neighborhood Map
=============
The neighborhood map project plots all Bart stations. For each Bart station, information is diplayed and **Top 5** recommended venues nearby are suggested to the user.

The following technologies were used in building this project:
>  - Knockout
>  - Jquery (AJAX)
>  - HTML5 LocalStorage
>  - Twitter Bootstrap
>  - FontAwesome
>  - Grunt (minifying js/css and running jshint)

Moreover, below are the APIs used in this project:
 
> - Foursquare API to power venue recommendations
> - Bart API for Bart station informations
> - Google API to display map and markers

How to Use?
==============
To build a minified and production quality code:

 - Go to the root of the project.
 - Prior to running ***grunt***, run the following code to ensure ***grunt*** is installed and other required packages to build the app:
	 - *npm i --save-dev grunt*
 - Run **grunt**
	 - Minifies the ***map.js*** and the ***style.css***.  
	 - Checks js files with JSHint.
 - Go to "**dist**" folder and open index.html

To see the developmental code, just go to the "**src**" folder and all the files used are in there.
	

What features are supported?
=============

The following features are supported:

 - Search for particular bart station.
 - Animate a station marker and display info window when either (A) clicked on the search list or (B) marker is clicked directly.
 - Tag station as favorite by clicking star icon on the search list.
 - Show only favorite stations (i.e., star button on the nav).
 - Toggle search panel (i.e., more button on the nav).
 - Persist data (i.e. search term and favorites) when app is closed then reopened.
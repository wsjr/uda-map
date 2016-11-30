Neighborhood Map
=============
The neighborhood map project uses Google Map to map all the bart stations via Bart API and shows **Top 5** recommended venues for each station by users within 1000 meters using Foursquare API. 

The following technologies were used in building this project:
 
 - Knockout
 - Jquery (AJAX)
 - Multiple APIs(Google Map, Bart and Foursquare)
 - HTML5 LocalStorage
 - Twitter Bootstrap
 - FontAwesome
 - Grunt for generating minified code

How to Use?
==============
To build a minified and production quality code:

 - Go to the root of the project.
 - Run "**grunt**"
	 - This will minify the ***map.js*** and the ***style.css***.  
 - Go to "**dist**" folder and open index.html

To see the developmental code, just go to the "**src**" folder and all the files used are in there.
	

What features are supported?
=============

The following features are supported:

 - Search for particular bart station.
 - Animate a station marker when clicked on the search list.
 - Tag station as favorite by clicking star icon on the search list.
 - Show only favorite stations (i.e., star button on the nav).
 - Toggle search panel (i.e., more button on the nav).
 - Persist data (i.e. search term and favorites) when app is closed then reopened.
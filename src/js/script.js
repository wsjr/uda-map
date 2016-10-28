
function loadData() {

    var $body = $('body');
    var $wikiElem = $('#wikipedia-links');
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    var $greeting = $('#greeting');

    // clear out old data before new request
    $wikiElem.text("");
    $nytElem.text("");

    // load streetview

    // YOUR CODE GOES HERE!
    var $street = $('#street')
    var $city = $('#city')
    var streetStr = $street.val()
    var cityStr = $city.val()

    var url = "http://maps.googleapis.com/maps/api/streetview?size=600x400&location=" + streetStr + "," + cityStr
    $body.append('<img class="bgimg" src="' + url + '">');


    // NYT AJAX request goes here
    var nytimesKey = '6be0415ef0314c5ab48c18bbaeedda90';
    var nytimesUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + cityStr + '&sort=newest&api-key=' + nytimesKey;

    $.getJSON(nytimesUrl, function(data) {
        $nytHeaderElem.text('New York Times Articles About ' + cityStr);

        articles = data.response.docs;
        for (var i = 0; i < articles.length; i++) {
            var article = articles[i];
            $nytElem.append('<li class="article">' + 
                '<a href="' + article.web_url + '">' + article.headline.main + '</a>' +
                '<p>' + article.snippet + '</p>' + 
            '</li>');
        }
    }).error(function(e) {
        $nytHeaderElem.text('New York Times Articles Could Not Be Loaded')
    });

    // Wikipedia AJAX request goes here
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + cityStr + '&format=json&callback=wikiCallback';
    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        success: function (response) {
            var articleList = response[1];

            for (var i = 0; i  < articleList.length; i++) {
                var articleStr = articleList[i];
                var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                $wikiElem.append('<li><a href="' + url + '">' + articleStr + '</a></li>');
            }
        }
    })


    return false;
};

$('#form-container').submit(loadData);

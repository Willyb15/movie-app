$(document).ready(function(){

	var genreArray = [];

	$('#searchFilter').change(function(){
		console.log($(this).val());
	})

	var imagePath;
	//The URL of all our API calls
	var baseURL = 'https://api.themoviedb.org/3/';
	//The query string including apiKey anytime they ask for it
	var apiKey = '?api_key=	5e2170b9fb801a61d6d784870c4c2eb1';
	//The configURL so that we can get basic config data
	var configURL = baseURL + 'configuration' + apiKey;

	//Make an AJAX call to the config URL.
	$.getJSON(configURL, function(configData){
		//Set our global var imagePath to the result of our AJAX call
		imagePath = configData.images.base_url;
	});


	var genreURL = baseURL + 'genre/movie/list' + apiKey;
	//Make an AJAX call to the genre URL.
	$.getJSON(genreURL, function(genreData){
		// console.log(genreData);
		for(i=0; i<genreData.genres.length; i++){
			var genreID = genreData.genres[i].id;
			var genreName = genreData.genres[i].name;
			genreArray[genreID]= genreName;
		}

		var genreHTML = '';
		for(i=0; i<genreArray.length; i++){
			if(genreArray[i] != undefined){
				genreHTML += '<input type="button" id="'+genreArray[i]+'" class="btn btn-success genre-button" value="'+genreArray[i]+'">'
			}
		}

		$('#genre-buttons').html(genreHTML);
		addGenreClicks();

		console.dir(genreArray);
	});


	//Now Playing is default on page load. Set up the URL
	var nowPlaying = baseURL + 'movie/now_playing' + apiKey;
	//Make an AJAX call to the now playing URL.
	$.getJSON(nowPlaying, function(movieData){
		// console.log(movieData);
		var newHTML = '';
		//Loop through all the results and set up an image url.
		for(i=0; i<movieData.results.length; i++){
			// console.log(movieData.results[i]);
			var currentPoster = imagePath + 'w300' + movieData.results[i].poster_path;
			var firstGenreID = movieData.results[i].genre_ids[0];
			var genreName = genreArray[firstGenreID];
			
			

			for(j=0; j<movieData.results.length; j++){
				if (genreArray[j] != undefined){
					var genreIdTotal = movieData.results[i].genre_ids[j];
					var genreNameTotal = genreArray[genreIdTotal];
					console.log(movieData.results[i].genre_ids);
					console.log(genreNameTotal);
				}
			}


			






			newHTML += '<div class="col-sm-3 now-playing ' + encodeURI(genreName) + genreNameTotal +'">';
			newHTML += '<img src="' + currentPoster + '">';
			newHTML += '</div>';
			// console.log(currentPoster);
		}
		$('#poster-grid').html(newHTML);

		getIsotope();
	});


	$('#movie-form').submit(function(event){
		// var userSearch = $('.typeahead').typeahead('val');
		// console.log(userSearch);

		//Value the user searched for
		var userSearch = $('#searchText').val();
		//Filter the user searched for (movie, actor, etc.)
		var searchFilter = $('#searchFilter').val();
		// console.log(searchFilter);

		//Setup the endpoing to use the value of the select box as the parameter after /search
		var searchURL = baseURL + 'search/' + searchFilter + apiKey + '&query=' + encodeURI(userSearch);

		//Set up a var with the search/movie endpoint. Make sure to include the query string
		//the query string needs to be encoded in case the user has some odd symbos or characters
		// -- FOR WHEN WE WERE ONLY SEARCHING FOR MOVIES - var movieSarch = baseURL + 'search/movie' + apiKey + '&query=' + encodeURI(userSearch);
		//Make an AJAX call to the now playing URL.q
		$.getJSON(searchURL, function(movieData){
			var newHTML = '';
			//Loop through all the results and set up an image url.
			for(i=0; i<movieData.results.length; i++){
				// console.log(movieData.results[i]);
				if ((searchFilter == 'person') || ((searchFilter == 'multi') && (movieData.results[i].media_type == 'person'))){
					var currentPoster = imagePath + 'w300' + movieData.results[i].profile_path;
				}else{
					var currentPoster = imagePath + 'w300' + movieData.results[i].poster_path;
				}

				// console.log(movieData.results[i]);

				newHTML += '<div class="col-sm-3">';
				newHTML += '<img src="' + currentPoster + '">';
				newHTML += '</div>';
				// console.log(currentPoster);
			}
			$('#poster-grid').html(newHTML);
			getIsotope();
		});		
		event.preventDefault();
	});
});

// $('#searchText').keyup(function(){
// 	$(this).val();
// });

var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};


var arrayToSearch = [];
for (i=1; i <= 6; i++) {
	var popularMovies = 'https://api.themoviedb.org/3/movie/popular?api_key=fec8b5ab27b292a68294261bb21b04a5&page=' + i;
	console.log(popularMovies);
	$.getJSON(popularMovies, function(popularM){
		for(j=0; j<popularM.results.length; j++){
			arrayToSearch.push(popularM.results[j].original_title);
		}
		// console.log(arrayToSearch);
	});
}





var actors = [
	'Brad Pitt',
	'Michael Douglas',
	'Al Pacino'
];

$('#movie-form .typeahead').typeahead(
	{
  		hint: true,
  		highlight: true,
  		minLength: 3
	},
	{
  		name: 'actors',
  		source: substringMatcher(actors)
	}
);

function getIsotope(){
	var theGrid = $('#poster-grid').isotope(
		{
	  		// options
	  		itemSelector: '.now-playing'
		});	

	// layout Isotope after each image loads
	theGrid.imagesLoaded().progress(function() {
  		theGrid.isotope('layout');
	});

}

function addGenreClicks(){
	$('.genre-button').click(function(){
		$('#poster-grid').isotope({ filter: '.'+ $(this).attr('id') });
	});
}
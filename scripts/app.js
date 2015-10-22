var artistList = {};
var artistName = 'ARH6W4X1187B99274F'; //A-trak
artistList.apiKey = "GPEMLQH0JMGAOKXZX ";

artistList.artistEndPoint = 'http://developer.echonest.com/api/v4/artist/profile?';

// ARTIST ARRAY
 artistList.artistChoices = ["A-Trak", "A.C. Newman", "Arkells", "Astrocolor", "Bear Mountain", "Boys Noize", "Chromeo", "Crystal Castles", "Dark Horses", "Datsik", "DCF", "Death From Above 1979", "Dirty Ghosts", "Dubmatix", "Egyptrixx", "Electric Youth", "Emily Haines", "Fan Death", "Fur Trade", "Gazelle Twin", "Harrison", "Hiawatha", "Hot As Sun", "Huoratron", "Jack Novak", "JOOJ", "k-os", "Kay", "Kinnie Starr", "Leisure Cruise", "Let’s Go To War", "Lights", "Lindi Ortega", "Magneta Lane", "Metric", "Mixhell", "Modern Superstitions", "Moon King", "Mother Mother", "MSTRKRFT", "O’Luge", "Ohbijou", "Operators", "Panurge", "Purity Ring",	"Rush Midnight", "Ryan Hemsworth", "Sebastien Grainger",
	"Seoul", "Sheldon Scott", "Silver Starling", "Terry Lynn", "The Burning Hell", "The New Pornographers", "Tiga", "Tre Mission", "We Are Enfant Terrible"]

// console.log(artistList.artistChoices.length - 1);

artistList.artistRequest = function(artname){
	$.ajax({
		// Change parameters to data
		url: 'http://developer.echonest.com/api/v4/artist/profile?api_key=OYWFRW7LLJ7MKCV9T&name='+artname+'&format=json&bucket=biographies&bucket=blogs&bucket=hotttnesss&bucket=images&bucket=news&bucket=urls&bucket=video&bucket=artist_location&bucket=songs&callback=jsonp',
		type: 'GET',
		dataType: 'json'

	}).then(function(res){
		console.log(res);
		artistList.artistInfo(res.response.artist);
	})
}

artistList.artistInfo = function(artistProfile){
	console.log('1. Name of band = ' + artistProfile.name);
	console.log('2. Artist Location = ' + artistProfile.artist_location.location);
	console.log('3. Artist Biography = ' + artistProfile.biographies[0]);
	console.log('4. Hotttnesss = ' + Math.floor(artistProfile.hotttnesss * 100));
	console.log('5. News = ' + artistProfile.news[0]);
	console.log('6. Blogs = ' + artistProfile.blog[0] + artistProfile.blog[1] + artistProfile.blog[2]);
	console.log('7. URL =' + artistProfile.urls);
};

// autocomplete
artistList.init = function(){
$('#search').autocomplete({
	source: artistList.artistChoices
});

	$('.btnSearch').on('click', function(e){
			e.preventDefault();
			// location.href = 'artistPage.html';
			var nameArtist = $('#search').val();
			$('#search').val('');
			console.log(nameArtist);
			artistList.artistRequest(nameArtist);
	});
};

$(function(){
	artistList.init();
});

var artistList = {};
var artistName = 'ARH6W4X1187B99274F'; //A-trak
artistList.apiKey = "GPEMLQH0JMGAOKXZX ";

artistList.artistEndPoint = 'http://developer.echonest.com/api/v4/artist/profile?';

// ARTIST ARRAY
 artistList.artistChoices = ["A-Trak", "A.C. Newman", "Arkells", "Astrocolor", "Bear Mountain", "Boys Noize", "Chromeo", "Crystal Castles", "Dark Horses", "Datsik", "DCF", "Death From Above 1979", "Dirty Ghosts", "Dubmatix", "Egyptrixx", "Electric Youth", "Emily Haines", "Fan Death", "Fur Trade", "Gazelle Twin", "Harrison", "Hiawatha", "Hot As Sun", "Huoratron", "Jack Novak", "JOOJ", "k-os", "Kay", "Kinnie Starr", "Leisure Cruise", "Let’s Go To War", "Lights", "Lindi Ortega", "Magneta Lane", "Metric", "Mixhell", "Modern Superstitions", "Moon King", "Mother Mother", "MSTRKRFT", "O’Luge", "Ohbijou", "Operators", "Panurge", "Purity Ring",	"Rush Midnight", "Ryan Hemsworth", "Sebastien Grainger",
	"Seoul", "Sheldon Scott", "Silver Starling", "Terry Lynn", "The Burning Hell", "The New Pornographers", "Tiga", "Tre Mission", "We Are Enfant Terrible"]

//

artistList.artistRequest = function(artname){
	$.ajax({
		// Change parameters to data
		url: 'http://developer.echonest.com/api/v4/artist/profile?api_key=OYWFRW7LLJ7MKCV9T&name='+artname+'&format=json&bucket=biographies&bucket=blogs&bucket=hotttnesss&bucket=images&bucket=news&bucket=urls&bucket=video&bucket=artist_location&bucket=songs&callback=jsonp',
		type: 'GET',
		dataType: 'json'

	}).then(function(res){
		console.log(res);
		artistList.artName(res.response.artist);
	})
}

// artistList.artistInfo = function(artistProfile){
// 	console.log('1. Name of band = ' , artistProfile.name);
// 	$('.artistName').html(artistProfile.name);

// 	console.log('4. Hotttnesss = ' , Math.floor(artistProfile.hotttnesss * 100));
// 	$('.artistHotness').html(Math.floor(artistProfile.hotttnesss * 100));

// 	console.log('2. Artist Location = ' , artistProfile.artist_location.location);
// 	$('.artistLocation').html(artistProfile.artist_location.location);

// 	console.log('7. URL =' , artistProfile.urls.lastfm_url);
// 	$('.artistUrl').html(artistProfile.urls.lastfm_url);

// 	console.log('3. Artist Biography = ' , artistProfile.biographies[0].site, artistProfile.biographies[0].text, artistProfile.biographies[0].url);
// 	$('.artistBio').html(artistProfile.biographies[0]);	

// 	console.log('5. News = ' , artistProfile.news[0].date_found, artistProfile.news[0].name, artistProfile.news[0].summary, artistProfile.news[0].url);
// 	$('.artistNews').html(artistProfile.news[0]);

// 	console.log('6. Blogs = ' , artistProfile.blogs[0].name, artistProfile.blogs[0].summary, artistProfile.blogs[0].date_posted, artistProfile.blogs[0].url);
// 	$('.artistBlog').html(artistProfile.blogs[0]);

// };
/* 
   tried making it fool proof but didnt work cos of call size
   ========================================================================== */

$('#wholeArtistContainer').hide();

artistList.artName = function(artistProfile){
	$('.artistName').html(artistProfile.name);
	artistList.artistHotness(artistProfile);
}

artistList.artistHotness = function(artistProfile){
	if(artistProfile.hotttnesss === undefined){
		$('.artistHotness').html('No hotness');
	}else{
		$('.artistHotness').html(Math.floor(artistProfile.hotttnesss * 100) + '%');
	};
	artistList.artistLocation(artistProfile);
	console.log(artistProfile.hotttnesss);

};

artistList.artistLocation = function(artistProfile){
	if(artistProfile.artist_location === undefined){
		$('.artistLocation').html('No Location registered');
	}else{
		$('.artistLocation').html(artistProfile.artist_location.location);
	};
	artistList.artistUrl(artistProfile);
	console.log(artistProfile.artist_location);

};

artistList.artistUrl = function(artistProfile){
	if(artistProfile.urls === undefined){
		$('.artistUrls').html('No External links found');
	}else{
		$('.artistUrl').html('<h4>Last Fm: </h4>'+artistProfile.urls.lastfm_url);
	};
	artistList.artistBio(artistProfile);
	console.log(artistProfile.urls);

};

artistList.artistBio = function(artistProfile){
	if(artistProfile.biographies === undefined){
		$('.artistBio').html('No bio found');
	}else{
		$('.artistBio').append('<h4>Bio Site: </h4>'+artistProfile.biographies[0].site);
		$('.artistBio').append('<h4>Bio Text: </h4>'+artistProfile.biographies[0].text);
		$('.artistBio').append('<h4>Bio Url: </h4>'+artistProfile.biographies[0].url);
	};
	artistList.artistNews(artistProfile);
	console.log(artistProfile.biographies[0]);

};

artistList.artistNews = function(artistProfile){
	if(artistProfile.news === undefined){
		$('.artistNews').html('No news found');
	}else{
		$('.artistNews').append('<h4>News Date Found: </h4>'+artistProfile.news[0].date_found);
		$('.artistNews').append('<h4>News Name: </h4>'+artistProfile.news[0].name);
		$('.artistNews').append('<h4>News Summary: </h4>'+artistProfile.news[0].summary);
		$('.artistNews').append('<h4>News Url: </h4>'+artistProfile.news[0].url);

	};
	artistList.artistBlog(artistProfile);
	console.log(artistProfile.news[0]);

};

artistList.artistBlog = function(artistProfile){
	if(artistProfile.blogs === undefined){
		$('.artistBlog').html('No blog found');
	}else{
		$('.artistBlog').html('<h4>Blog Name: </h4>'+artistProfile.blogs[0].name)
		$('.artistBlog').append('<h4>Blog Summary: </h4>'+artistProfile.blogs[0].summary)
		$('.artistBlog').append('<h4>Blog Profile: </h4>'+artistProfile.blogs[0].date_posted)
		$('.artistBlog').append('<h4>Blog Url: </h4>'+artistProfile.blogs[0].url)
	};
	artistList.artistVid(artistProfile);
	console.log(artistProfile.blogs[0]);

};



artistList.artistVid = function(artistProfile){
	if(artistProfile.video === undefined){
		$('.artistVideo').html('No video found');
	}
	else{
	$.each(artistProfile.video, function(key, value){
	var checkYoutube = artistProfile.video[key].site;
	if (checkYoutube === 'youtube.com'){
		var oriUrl = artistProfile.video[key].url;
		var youtubeId = oriUrl.slice(31, 42);
		
		$('.artistVideo').html('<iframe width="853" height="480" src=https://www.youtube-nocookie.com/embed/'+ youtubeId +'?controls=0&amp;showinfo=0" frameborder="0"></iframe>')
			};
		});
	};
};

/* 
   Ends here
   ========================================================================== */

// autocomplete
artistList.init = function(){
	$('#search').autocomplete({
		source: artistList.artistChoices
	});

	$('.btnSearch').on('click', function(e){
			e.preventDefault();
			var nameArtist = $('#search').val();
			$('#search').val('');
			console.log(nameArtist);
			artistList.artistRequest(nameArtist);
			$('#wholeArtistContainer').show();
			function submitform() {   
				document.myform.submit(); 
			} 

	});
};

// $(window).scroll(function () {
//     if ($(this).scrollTop() > 75) {
//         $('.nav').addClass('colour-change');
//         $('.nav a').addClass('appear');
//     } 
//     if ($(this).scrollTop() < 75) {
//         $('.nav').removeClass('colour-change');
//         $('.nav a').removeClass('appear');
//     } 
// });

$(function() {
		$('.gallery').flickity({
			wrapAround: true
	});		
});

$(function(){
	artistList.init();

	//smooth scroll
		$('a[href*=#]:not([href=#])').click(function() {
		    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
		      var target = $(this.hash);
		      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
		      if (target.length) {
		        $('html,body').animate({
		          scrollTop: target.offset().top
		        }, 1000);
		        return false;
		      }
		    }
	    });
});

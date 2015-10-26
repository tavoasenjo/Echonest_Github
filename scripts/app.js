var artistList = {};
var artistName = 'ARH6W4X1187B99274F'; //A-trak
artistList.apiKey = "GPEMLQH0JMGAOKXZX ";

artistList.artistEndPoint = 'http://developer.echonest.com/api/v4/artist/profile?';

// ARTIST ARRAY
 artistList.artistChoices = ["A-Trak", "A.C. Newman", "Arkells", "Astrocolor", "Bear Mountain", "Boys Noize", "Chromeo", "Crystal Castles", "Dark Horses", "Datsik", "DCF", "Death From Above 1979", "Dirty Ghosts", "Dubmatix", "Egyptrixx", "Electric Youth", "Emily Haines", "Fan Death", "Fur Trade", "Gazelle Twin", "Harrison", "Hiawatha", "Hot As Sun", "Huoratron", "Jack Novak", "JOOJ", "k-os", "Kay", "Kinnie Starr", "Leisure Cruise", "Let’s Go To War", "Lights", "Lindi Ortega", "Magneta Lane", "Metric", "Mixhell", "Modern Superstitions", "Moon King", "Mother Mother", "MSTRKRFT", "O’Luge", "Ohbijou", "Operators", "Panurge", "Purity Ring",	"Rush Midnight", "Ryan Hemsworth", "Sebastien Grainger", "Seoul", "Sheldon Scott", "Silver Starling", "Terry Lynn", "The Burning Hell", "The New Pornographers", "Tiga", "Tre Mission", "We Are Enfant Terrible", "Wolf &amp Cub"]

//ARTISTS PICS
var artistImage = {};
artistImage.imageUrl = {
	"A-Trak": "http://lastgang.com/wp-content/uploads/2015/06/atrak_feature_image_1800x9001.jpg",
	"A.C. Newman": "http://lastgang.com/wp-content/uploads/2015/06/AC-NEWMAN-web-image_hi.jpg",
	"Arkells": "http://lastgang.com/wp-content/uploads/2015/08/ARKELLS-588-1.jpg",
	"Astrocolor": "http://lastgang.com/wp-content/uploads/2015/08/Astrocolor_CircleHorizontal.jpeg",
	"Bear Mountain": "http://lastgang.com/wp-content/uploads/2015/06/BearMountain_2.jpg ",
	"Boys Noize": "http://lastgang.com/wp-content/uploads/2015/06/EDC2010_sat_1873.jpg",
	"Chromeo": "http://lastgang.com/wp-content/uploads/2015/06/CHROMEO-MAIN-PUB-PHOTO-4-TIMOTHY-SACCENTI.jpg",
	"Crystal Castles": "http://lastgang.com/wp-content/uploads/2015/06/Crystal-Castles1.jpg",
	"Dark Horses": "http://lastgang.com/wp-content/uploads/2015/06/Dark_Horses_Wembley_Ali_Tollervey-mid.jpg",
	"Datsik": "http://lastgang.com/wp-content/uploads/2015/06/datsikpressphoto1.jpg",
	"DCF": "http://lastgang.com/wp-content/uploads/2015/06/528120_10151125871803850_92611827_n.jpg",
	"Death From Above 1979": "http://lastgang.com/wp-content/uploads/2015/05/DeathFromAbove1979-1407440991871.jpg",
	"Dirty Ghosts": "http://lastgang.com/wp-content/uploads/2015/06/DirtyGhosts-lizcaruanaphotography047-Edit.jpg",
	"Dubmatix": "http://lastgang.com/wp-content/uploads/2015/06/dubmatix.jpg",
	"Egyptrixx": "http://lastgang.com/wp-content/uploads/2015/06/EGYPTRIXX.jpg",
	"Electric Youth": "http://lastgang.com/wp-content/uploads/2015/06/EY_04.jpg",
	"Emily Haines": "http://lastgang.com/wp-content/uploads/2015/06/EmilyHaines2.jpg",
	"Fan Death": "http://lastgang.com/wp-content/uploads/2015/06/fandeath.jpg",
	"Fur Trade": "http://lastgang.com/wp-content/uploads/2015/06/tumblr_mqm6jktcWg1qctz21o1_1280.jpg",
	"Gazelle Twin": "http://lastgang.com/wp-content/uploads/2015/06/a3932384061_10.jpg",
	"Harrison": "http://lastgang.com/wp-content/uploads/2015/06/1426704_370459743113314_5960789489279807978_n.jpg",
	"Hiawatha": "http://lastgang.com/wp-content/uploads/2015/06/hiawatha_song_titlesHIRES.jpeg",
	"Hot As Sun": "http://lastgang.com/wp-content/uploads/2015/06/hot-as-sun-11.jpg",
	"Huoratron": "http://lastgang.com/wp-content/uploads/2015/06/dsc0540.jpg",
	"Jack Novak": "http://lastgang.com/wp-content/uploads/2015/06/10987473_460587697424438_463122297388923428_o.jpg",
	"JOOJ": "http://lastgang.com/wp-content/uploads/2015/06/joojbyjbs.jpg",
	"k-os": "http://lastgang.com/wp-content/uploads/2015/06/k-os_cr_AndrewFrancisWallace_2013.jpg",
	"Kay": "http://lastgang.com/wp-content/uploads/2015/06/Kay-Alive-2013-1200x1200.png",
	"Kinnie Starr": "http://lastgang.com/wp-content/uploads/2015/06/KinnieStarr-Horizontal-creditRobinGartnerPhotography-1383x900.jpg",
    "Leisure Cruise": "http://lastgang.com/wp-content/uploads/2015/06/Leisure-Cruise-Press-Photo-1.5MB2-1358x900.jpg",
    "Let’s Go To War": "http://lastgang.com/wp-content/uploads/2015/06/lgtw-press-high-res-copy.jpg",
    "Lights": "http://lastgang.com/wp-content/uploads/2015/06/lights-extralarge_1413929979248.jpg",
    "Lindi Ortega": "http://lastgang.com/wp-content/uploads/2015/06/Lindi1_cred_Julie-Moe.jpg",
    "Magneta Lane": "http://lastgang.com/wp-content/uploads/2015/06/533338_10151336169985443_423325551_n.jpg",
    "Metric": "http://lastgang.com/wp-content/uploads/2015/06/MetricPress-Shot2015.06.02-1024x745.jpeg",
    "Mixhell": "http://lastgang.com/wp-content/uploads/2015/06/Mixhell-photo-1.jpg",
    "Modern Superstitions": "http://lastgang.com/wp-content/uploads/2015/06/ModernSuperstitionsEP3.jpg",
    "Moon King": "http://lastgang.com/wp-content/uploads/2015/06/MoonKing_PhotobyColinMedley_2.jpg",
    "Mother Mother": "http://lastgang.com/wp-content/uploads/2015/06/MMmedia11.jpg",
    "MSTRKRFT": "http://lastgang.com/wp-content/uploads/2015/06/mg_3979.jpeg",
    "O’Luge": "http://is3.mzstatic.com/image/thumb/Music4/v4/80/dd/04/80dd0425-9733-e9e3-5a1a-17b3b446d571/source/1440x1440sr.jpg",
    "Ohbijou": "http://lastgang.com/wp-content/uploads/2015/06/MUSIC-ohbijou-2012-11-11T16-39-09-186797.jpg",
    "Operators": "http://lastgang.com/wp-content/uploads/2015/06/operatorsbandphoto.jpg",
    "Panurge": "http://lastgang.com/wp-content/uploads/2015/06/Panurge_walking_300dpi-copy.jpg",
    "Purity Ring": "http://lastgang.com/wp-content/uploads/2015/06/Purity-Ring-Black-and-White-2015-1.7MB-2.jpg",
    "Rush Midnight": "http://lastgang.com/wp-content/uploads/2015/06/10996427_774170989357381_1987020610716165615_n.jpg",
	"Ryan Hemsworth": "http://lastgang.com/wp-content/uploads/2015/06/RH-banner-1600x900.jpg",
    "Sebastien Grainger": "http://lastgang.com/wp-content/uploads/2015/06/sebastiengrainger-yourstodiscover-1260x900.jpg",
    "Seoul": "http://lastgang.com/wp-content/uploads/2015/06/seoul_artist_image_940x948-892x900.jpg",
    "Sheldon Scott": "http://lastgang.com/wp-content/uploads/2015/06/Sheldon-Scott_banner-1600x900.jpg",
    "Silver Starling": "http://lastgang.com/wp-content/uploads/2015/06/1279655987SilverStarling-1600x800.jpg",
    "Terry Lynn": "http://lastgang.com/wp-content/uploads/2015/06/1281395433TerryLynnartistbackground1-1600x800.jpg",
    "The Burning Hell": "http://lastgang.com/wp-content/uploads/2015/06/burning-hell-watermelon-small.jpg",
    "The New Pornographers": "http://lastgang.com/wp-content/uploads/2015/06/1279648031TheNewPornographers-1600x800.jpg",
    "Tiga": "http://lastgang.com/wp-content/uploads/2015/06/1280521153Tigabackground3-1600x855.jpg",
    "Tre Mission": "http://lastgang.com/wp-content/uploads/2015/06/trebackground-1600x800.png",
	"We Are Enfant Terrible": "http://lastgang.com/wp-content/uploads/2015/06/1285438079WEAT10-1600x800.jpg",
	"Wolf &amp Cub": "http://lastgang.com/wp-content/uploads/2015/06/wolf_and_cub01_website_image_sdee_standard.jpg"
};

artistImage.imageMatch = function(name){
	$.each(artistImage.imageUrl, function(key, value){
		if(key === name){
			$('.artistImages').html($('<img>').attr('src', value));
		}
	});
}

artistList.artistRequest = function(artname){
	$.ajax({
		// Change parameters to data
		url: 'http://developer.echonest.com/api/v4/artist/profile?api_key=OYWFRW7LLJ7MKCV9T&name='+artname+'&format=json&bucket=biographies&bucket=blogs&bucket=hotttnesss&bucket=images&bucket=news&bucket=urls&bucket=video&bucket=artist_location&bucket=songs&callback=jsonp',
		type: 'GET',
		dataType: 'json'

	}).then(function(res){
		console.log(res);
		artistList.artName(res.response.artist);
		artistImage.imageMatch(res.response.artist.name);
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
   tried making it fool proof but didnt work cos of call size. Edit: It works!
   ========================================================================== */
$('#wholeArtistContainer').hide();


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
	// 	$('.artistBio').html('No bio found');
	}else{
		$.each(artistProfile.biographies, function(key, value){
		var trunkBio = artistProfile.biographies[key].truncated;
		console.log(trunkBio);
		if(trunkBio === undefined){
			console.log("There is no truncated text here");
		$('.artistBio').html('<h4>Bio Site: </h4>'+artistProfile.biographies[key].site);
		$('.artistBio').append('<h4>Bio Text: </h4>'+artistProfile.biographies[key].text.substring(0,500)+'...');
		$('.artistBio').append('<h4>Bio Url: </h4>'+artistProfile.biographies[key].url);
			};
		});
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
		$('.artistNews').append('<h4>News Summary: </h4>'+artistProfile.news[0].summary.substring(0,500)+'...');
		$('.artistNews').append('<h4>News Url: </h4>'+artistProfile.news[0].url);

	};
	artistList.artistBlog(artistProfile);
	console.log(artistProfile.news[0]);

};

artistList.artistBlog = function(artistProfile){
	if(artistProfile.blogs === undefined){
		$('.artistBlog').html('No blog found');
	}else{
		$('.artistBlog').html('<h4>Blog Name: </h4>'+artistProfile.blogs[0].name);
		$('.artistBlog').append('<h4>Blog Summary: </h4>'+artistProfile.blogs[0].summary.substring(0,500)+'...');
		$('.artistBlog').append('<h4>Blog Profile: </h4>'+artistProfile.blogs[0].date_posted);
		$('.artistBlog').append('<h4>Blog Url: </h4>'+artistProfile.blogs[0].url);
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
<<<<<<< HEAD
			$('#wholeArtistContainer').show();
			function submitform() {   
				document.myform.submit(); 
			} 

=======
			// location.href = 'artistPage.html';
			$('#wholeArtistContainer').show();
			function submitform(){
				document.myform.submit();
			}
>>>>>>> 5c704a580771974c04bc89e0c6004dafb5dea503
	});
};


$(function(){
	artistList.init();

<<<<<<< HEAD
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
=======
	//Smooth Scroll
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
>>>>>>> 5c704a580771974c04bc89e0c6004dafb5dea503
});

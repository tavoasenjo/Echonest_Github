/*
 * Ajax Load More - SEO
 * connekthq.com/plugins/ajax-load-more/seo/
 *
 * Copyright 2015 Connekt Media - http://connekthq.com
 * Free to use under the GPLv2 license.
 * http://www.gnu.org/licenses/gpl-2.0.html
 *
 * Author: Darren Cooney
 * Twitter: @KaptonKaos
*/
 
var almSEO = {};

jQuery(document).ready(function ($) {   
   
   if (typeof window.history.pushState == 'function') { 
      // Wrap entire function is a browser support function
      
      almSEO.init = true;   
      almSEO.paging = false;
      almSEO.previousPagingUrl = window.location.href;
      almSEO.setPushstate = true;
      
      
      // $.fn.almSEO
      // triggered from core ajax-load-more.js file.
      $.fn.almSEO = function(alm){
         
         if (alm.seo_scroll === undefined) {
            alm.seo_scroll = true;
         }
         
         almSEO.speed = 1000;   
         almSEO.permalink = alm.permalink; // Get permalink type
         almSEO.pageview = alm.pageview; // Send Google Analytics pageviews
         almSEO.postsPerPage = alm.posts_per_page; // Get posts_per_page value
         almSEO.preloaded = alm.preloaded; // Get preload value
         almSEO.scroll = alm.seo_scroll;  // Scrolling enabled 
         almSEO.speed = alm.seo_scroll_speed;  // Get scroll speed value
         almSEO.scrolltop = alm.seo_scrolltop; // Get the scrolltop value
         almSEO.newPath = ''; // New URL variable    
         almSEO.paging = alm.paging;
         
         
         var page = alm.page + 1,
             start = 1;
         
         // If preload, then start on page 0 
         if(almSEO.preloaded === 'true'){ 
            start = 0;
            page = page + 1;
         }
                
         
         // Default Permalinks
         // - http://example.com/?p=N
         
         if(almSEO.permalink === 'default'){
         
            var querystring = window.location.search, // Get querysting value
                url = almSEO.cleanURL(window.location.toString()); // Get Full URL 
            
            if(querystring !== '' && page > start){            
               // Does URL have a 'paged' value?
               if(!almSEO.getQueryVariable('paged')){ // No $paged value
                  almSEO.newPath = url + '&paged=' + page;               
               }else{ // Has $paged value, let's replace it
                  almSEO.newPath = url.replace(/(paged=)[^\&]+/, '$1' + page);               
               }    
            
            }else{ // Empty querystring  
               if(page > 1){       
                  almSEO.newPath = url + '?paged=' + page;   
               }          
            }
                     
         }
         
         // Pretty Permalinks
         // - http://example.com/2012/post-name/
         else
         {
            // Get current URLS
            var urlProtocol = window.location.protocol,
                hash = window.location.hash,
            	 hostName = window.location.host, // Get path after .com
            	 pathName = window.location.pathname, // Get path after .com
            	 url = almSEO.cleanURL(window.location.toString()); // Get Full URL
            	   	 
            // Parse URL	  
            var urlPieces = url.split('/'), // Split URL into array
                currPageNumber = urlPieces[urlPieces.length-2]; // Get value
            
            
            //console.log(page, currPageNumber);
            // Is currPageNumber number?
            if(almSEO.isNumeric(currPageNumber)){ // Is numeric
      	      almSEO.newPath = url.replace('/'+currPageNumber+'/', '/'+page+'/'); // Replace current page # with new page      	      
      	      if(page === 1){
         	      almSEO.newPath = url.replace('/page/'+currPageNumber+'/', '/');
      	      }
            }else{ // NO
               if(page > start){ // Do NOT page for page 1
                  almSEO.newPath = url + 'page/' + page + '/';
               }
            }         
         }
         
         
         /* Slide screen to current page
            - If page is greater than 1 and is init. 
            - Don't scroll page if init and page = 1 
            - Don't scroll if pagination is enabled
         */
         
         if((almSEO.init && page > 1) || page > 1){
            if(!almSEO.paging){
               almSEO.getCurrentPageTop(page);  
            }               
         }
         
         
         // Set our pushState URL and variables
          	      
         var stateObj = {page: page},
             updateTitle = document.title,
             updateURL = almSEO.newPath;      
             
              
         // Don't update pushState if old url is equal to new url       
         if(updateURL !== almSEO.previousPagingUrl && almSEO.setPushstate){
            history.pushState(stateObj, updateTitle, updateURL);
         }
         almSEO.previousPagingUrl = updateURL; // Set previousPagingUrl         
         almSEO.setPushstate = true;
         
         
         // Google Analytics - send pageview
         if (page > 0) {
	         if(almSEO.pageview === 'true'){ // Send pageviews to Google Analytics
            	var location = window.location.protocol + '//' + window.location.hostname + window.location.pathname;
            	if (typeof ga !== 'undefined' && $.isFunction(ga)) { // Check that func exists
					   ga('send', 'pageview', location);
					}
				}
         }
         
         almSEO.init = false; // Reset almSEO.init
      }
      
      
      
      
      /*
         popstate
         Fires when user click back or fwd btn
         
         @return null
      */
      
      window.addEventListener('popstate', function(event) {        

         if(!almSEO.paging){
            
            almSEO.getPageState(event.state);
            
         }else{
            
            // Paging
            if($.isFunction($.fn.almSetCurrentPage) && $.isFunction($.fn.almGetObj)){ 
               
               var current = event.state.page,
                   almBtnWrap = $.fn.almGetParentContainer(),
                   almObj = $.fn.almGetObj();
                   
               almSEO.setPushstate = false;    
               $.fn.almSetCurrentPage(current, almBtnWrap, almObj);
               
            }
         }
         
      });
      
      
      
      /*
         almSEO.getPageState()
         Get the current page number
         
         @return null
      */
      
      almSEO.getPageState = function(data){	      
	      if($('#ajax-load-more').length){
         	almSEO.getCurrentPageTop(data.page);
         }
      }
      
      
      
      /*
         almSEO.getCurrentPageTop()
         Get the offset().top of the current page
         
         @return null
      */
      
      almSEO.getCurrentPageTop = function(page){
      
          // Get children
         var objs = $('.alm-reveal').eq(0).children() ? $('.alm-reveal').eq(0).children() : '';   
         
         if(objs.length){
            var objType = objs[0].nodeName.toLowerCase(),
                obj = page * almSEO.postsPerPage - almSEO.postsPerPage;                  
            
            // If is preloaded then subtract 2 from obj
            if(almSEO.preloaded === 'true'){
	            obj = obj - almSEO.postsPerPage; 
	         }
               
            var objSelected = $('.alm-listing .alm-reveal > ' + objType).eq(obj); 
             
            if(almSEO.scroll === 'true') {
               almSEO.scrollToPage(objSelected);
            }
            
         }
      }
      
      
      
      /*
         almSEO.scrollToPage()
         Scroll page to element using jQuery .animate()
         
         @return null
      */
      
      almSEO.scrollToPage = function(obj){
         var top = $(obj).offset().top - almSEO.scrolltop + 'px';
         $('html, body').delay(250).animate({ scrollTop: top }, almSEO.speed, "alm_easeInOutQuad");
      }
      
      
      
      /*
         almSEO.isNumeric()
         Is value a number?
         
         @return true|false
      */
      
      almSEO.isNumeric = function(n) {
   		return !isNaN(parseFloat(n)) && isFinite(n);
   	}
      
      
      
      /*
         almSEO.cleanURL()
         Removes hash from url
         
         @return path
      */
      
      almSEO.cleanURL = function(path){
         var loc = path,
             index = loc.indexOf('#');      
                
         if (index > 0) {
           path = loc.substring(0, index); 
         }
         return path;
      }
      
      
      
      /* 
         almSEO.getQueryVariable()
         Get querysting value
         
         @return true|false
      */
      
      almSEO.getQueryVariable = function(variable) {
   		var query = window.location.search.substring(1);
   		var vars = query.split('&');
   		for (var i = 0; i < vars.length; i++) {
   			var pair = vars[i].split('=');
   			if (decodeURIComponent(pair[0]) == variable) {
   				return decodeURIComponent(pair[1]);
   			}
   		}
   		return false;
   	}
      
      
      
      /*
         alm_easeInOutQuad()
         Custom easing function
         
         @return easing
      */
      
      $.easing.alm_easeInOutQuad = function (x, t, b, c, d) {
         if ((t /= d / 2) < 1) return c / 2 * t * t + b;
         return -c / 2 * ((--t) * (t - 2) - 1) + b;
      };
   
   }
   
});
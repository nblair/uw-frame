'use strict';

define(['angular'], function(angular) {


  var app = angular.module('portal.misc.services', []);
  
  app.factory('PortalGroupService', function($http, miscService, SERVICE_LOC){
    
    var getGroups = function(){
      var groupPromise = $http.get(SERVICE_LOC.groupURL, {cache : true}).then (
                                    function(result){
                                      return result.data.groups;
                                    },function(reason){
                                      miscService.redirectUser(reason.status, 'group json feed call');
                                    });
      return groupPromise;
    }
    
    var groupsServiceEnabled = function() {
      if(SERVICE_LOC.groupURL) {
        return true;
      } else {
        return false;
      }
    }
    
    return {
      getGroups : getGroups,
      groupsServiceEnabled : groupsServiceEnabled
    }
  });

  app.factory('PortalAddToHomeService', function($http, filterFilter, NAMES, MISC_URLS){

    var canAddToHome = function(){
      if (MISC_URLS.addToHomeURLS && MISC_URLS.addToHomeURLS.addToHomeActionURL) {
            return true;
      } else {
        return false;
      }
    };

    var inHome = function(fname){
      return $http.get(MISC_URLS.addToHomeURLS.layoutURL).then(function(result){
        var layout = result.data.layout;
        if(layout) {
          var theFname = (fname ? fname : NAMES.fname);
          var filteredLayout = filterFilter(layout, {fname : theFname});
          return filteredLayout && filteredLayout.length > 0;
        } else {
          return false;
        }
      }, function(){
        //failed
        console.warn('could not reach portal server to get layout, portal down?');
        return true; //returning it is in the layout by default since portal is down
      });
    };

    var addToHome = function(fname){
      return $http.post(MISC_URLS.addToHomeURLS.addToHomeActionURL + (fname ? fname : NAMES.fname));
    };

    return {
      canAddToHome : canAddToHome,
      inHome : inHome,
      addToHome : addToHome
    };
  });

  app.factory('miscService', function($http, $window, $location, MISC_URLS) {

    /**
     Used to redirect users to login screen iff result code is 0 (yay shib) or 302

     Setup MISC_URLS.loginURL in js/app-config.js to have redirects happen
    **/
    var redirectUser = function(status, caller) {
      if(status === 0 || status === 302) {
        console.log("redirect happening due to " + status);
        if(MISC_URLS.loginURL) {
          window.location.replace(MISC_URLS.loginURL);
        } else {
          console.warn("MISC_URLS.loginURL was not set, cannot redirect");
        }
      } else {
        console.warn("Strange behavior from " + caller +". Returned status code : " + status);
      }
    };

    /**
     Google Analytics page view
     - searchTerm : Optional parameter to say "this is a search page".
                    This is the actual search term used.
    **/
    var pushPageview = function (searchTerm) {
      var path = $location.path();
      if(searchTerm) {
        path += "?q=" + searchTerm;
      }
      console.log('ga pageview logged ' + path);
      $window._gaq.push(['_trackPageview', path]);
    };

    /**
     Google Analytics event push
     - category : e.g.: beta header
     - action   : e.g.: beta buttons
     - label    : e.g.: back to classic

     See https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide for more info
    **/
    var pushGAEvent = function(category, action, label) {
      console.log('ga event logged c:' + category + " a:" + action + " l:" + label);
      $window._gaq.push(['_trackEvent', category, action, label]);
    };

    return {
      redirectUser: redirectUser,
      pushPageview: pushPageview,
      pushGAEvent : pushGAEvent
    };

  });

  return app;

});

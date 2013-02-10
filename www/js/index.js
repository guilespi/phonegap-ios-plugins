
var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        window.addEventListener('resize', function() {
                                            plugins.navigationBar.resize();
                                            plugins.tabBar.resize();
                                }, false);
        
    },
    loadNews: function (){
        $.mobile.changePage("#portada-observador", {transition:"slide"});
        var $newslist = $("#noticias");
        $newslist.children().remove();
        var loadData = function() {
            var jqXHR = $.ajax("http://www.elobservador.com.uy/rss/portada/", {dataType: "xml"});
            jqXHR.done(function(data, textStatus, jqXHR) {
                       var $news = $(data).find("item");
                       for (var i = 0; i < $news.length; i++) {
                            var $title = $($news[i]).find("title");
                            $newslist.append('<li><a href="#">' + $title.text() + '</a></li>');
                       }
                       $newslist.listview('refresh');
                       });
        };
        $(window).unbind("scrollstop");
        $(window).bind("scrollstop",function() {
                        var scrolledPercentage = Math.round((window.pageYOffset / $newslist.height()) * 100);
                        if (scrolledPercentage < 70) {
                            console.log("Scroll exit " + scrolledPercentage);
                            return;
                        }
                        console.log("Reloading scrolled percentage: " + scrolledPercentage +  ", total items: " + $newslist.children().length);
                        loadData();
                       });
        loadData();
    },
    onDeviceReady: function() {
        console.log("Device is ready");
        
        plugins.navigationBar.init();
        plugins.tabBar.init();
        
        plugins.navigationBar.create();
        plugins.tabBar.create()
        
        plugins.navigationBar.setTitle("Navigation Bar")
        plugins.navigationBar.showLeftButton()
        plugins.navigationBar.showRightButton()
        plugins.navigationBar.setupLeftButton("Back",
                                              "",
                                              function() {
                                                if (app.locatorInterval) {
                                                    console.log("clearing interval");
                                                    clearInterval(app.locatorInterval);
                                                    app.locatorInterval = null;
                                                }
                                                $("#noticias").children().remove();
                                                $(window).unbind("scrollstop");
                                                history.back();
                                                return false;
                                              });
        plugins.navigationBar.setupRightButton(
                                               "Alert",
                                               "barButton:Bookmarks", // or your own file like "/www/stylesheets/images/ajax-loader.png",
                                               function() {
                                                alert("right nav button tapped")
                                               }
                                               )
        
        plugins.navigationBar.show()
        
        
        
        plugins.tabBar.createItem("contacts", "", "tabButton:Contacts", {onSelect: app.loadNews});
        plugins.tabBar.createItem("recents", "", "tabButton:Recents")
    
        plugins.tabBar.createItem("another", "Branches", "www/images/map-marker.png", {
                                  onSelect: function() {
                                  app.loadMap();
                                  }
                                  })
        plugins.tabBar.show()
        plugins.tabBar.showItems("contacts", "recents", "another")
        
        console.log('finished');
    },
    findStore: function() {
        if (app.map && app.lastPosition) {
            app.lastPosition.coords.latitude += (Math.random()*2 - 1)/50;
            app.lastPosition.coords.longitude += (Math.random()*2 - 1)/50;
            console.log("New store at: " + app.lastPosition.coords.latitude + "," + app.lastPosition.coords.longitude);
            var newLoc = new google.maps.LatLng(app.lastPosition.coords.latitude, app.lastPosition.coords.longitude);
            var marker = new google.maps.Marker({position: newLoc,
                                                map: app.map,
                                                icon: "images/towerbank.png",
                                                animation: google.maps.Animation.DROP,
                                                title: 'Sucursal'});
            app.map.setCenter(newLoc);
        }
    },
    loadMap: function() {
        if (app.map) {
            app.locatorInterval = setInterval(function() {
                                              app.findStore();
                                              }, 3000);
        }
        var mapOptions = {
            zoom: 14,
            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        app.map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
        
        $.mobile.changePage("#map-page", {transition:"flip"});
        navigator.geolocation.getCurrentPosition(function(position) {
                                                    app.lastPosition = position;  
                                                    var myLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                                                    console.log("Location found at: " + position.coords.latitude + "," + position.coords.longitude);
                                                    var marker = new google.maps.Marker({
                                                                                     position: myLocation,
                                                                                     map: app.map,
                                                                                     title: 'You are here!'
                                                                                     });
                                                 
                                                    app.map.setCenter(myLocation);
                                                    app.locatorInterval = setInterval(function() {
                                                                                        app.findStore();
                                                                                      }, 3000);
                                                 },
                                                 function(error) {
                                                 alert(error.message);
                                                 });
    }
};

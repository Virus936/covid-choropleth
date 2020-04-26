function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature,
    })
}

function zoomToFeature(e) {
    mymap.fitBounds(e.target.getBounds());
}

// Comportement au survol de la souris
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties)
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update()
}


//var csv is the CSV file with headers
function getData4map(csv,date){

    var lines=csv.split("\r\n"); 
    var result = {};
    var headers=lines[0].split(";");

    for(var i=lines.length - 304;i<lines.length;i++){

        var obj = {};
        var currentline=lines[i].split(";");
        if ( (currentline[1] == 0) && (date = Date(currentline[2])) ) {

            for(var j=0;j<headers.length;j++){
                obj[headers[j]] = currentline[j];
            }

            result[currentline[0]]=obj;
        }
    }
    
    // On injecte les données dans le geojson data 
    for(let i = 0 ; i< data.features.length; i++){
        code = data.features[i].properties['code']
        data.features[i].properties['hosp'] = result[code]['hosp']
        data.features[i].properties['dc'] = result[code]['dc']
        data.features[i].properties['rea'] = result[code]['rea']
        data.features[i].properties['rad'] = result[code]['rad']
    }
    //return result; //JavaScript object
    return result; //JSON
}

function loadDoc() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            csv = xhttp.response.replace(/"/g,'')
            datacovid =  getData4map(csv, Date())

            // Mise en place des polygone departement
            geojson = L.geoJson(data, {
                onEachFeature : onEachFeature,
                style : {
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 1,
                    fillColor:'lightblue',
                },
            }).addTo(mymap);

        }
    };
    xhttp.open("GET", donnees_link, true);
    xhttp.send();
}

// Création de la map 
var mymap = L.map('mapid').setView([46.89040 , 2.79290],15 );
var bounds = new L.LatLngBounds([[40.31583 , -5.43097], [51.59686 , 9.23169]]);
mymap.fitBounds(bounds);


L.tileLayer('', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors,',
    minZoom: 6,
    maxZoom: 10,
    tileSize: 512,
    zoomOffset: -1,
    accessToken: ''
}).addTo(mymap);




var info = L.control();

info.onAdd = function (mymap) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4> Statistiques</h4>' +  (props ?
        '<b>' + props.nom + '('+ props.code+')'+'</b><br />' 
        + props.hosp + ' hospitalisés <br/>'
        + props.dc + ' décès <br/>'
        + props.rea + ' réanimation <br/>'
        + props.rad + ' à domicile <br/>'
        : 'Hover over a state');
};

info.addTo(mymap);
donnees_link = 'https://www.data.gouv.fr/fr/datasets/r/63352e38-d353-4b54-bfd1-f1b3ee1cabd7'
loadDoc()



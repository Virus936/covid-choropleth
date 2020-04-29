var datedispo = []
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
    today = new Date()
    if(date.getDate() == today.getDate() && date.getMonth() == today.getMonth()){
        
        for(var i= 0;i<lines.length;i++){

            var obj = {};
            var currentline=lines[i].split(";");
            if(i%303 == 4){
                datedispo.push(currentline[2])
            }
            if ( (currentline[1] == 0) ) {
                for(var j=0;j<headers.length;j++){
                    obj[headers[j]] = currentline[j];
                }

                result[currentline[0]]=obj;
            }
        }
    }
    else {
        for(var i= 0;i<lines.length;i++){

            var obj = {};
            var currentline=lines[i].split(";");
            if(i%303 == 4){
                datedispo.push(currentline[2])
            }
            datedesire = new Date( currentline[2])
            if ( (currentline[1] == 0)  && (date.getDate()== datedesire.getDate()) && date.getMonth() == datedesire.getMonth()) {
                for(var j=0;j<headers.length;j++){
                    obj[headers[j]] = currentline[j];
                }

                result[currentline[0]]=obj;
            }
        }
    }
    // On injecte les données dans le geojson data 
    for(let i = 0 ; i< data.features.length; i++){
        code = data.features[i].properties['code']
        data.features[i].properties['hosp'] = result[code]['hosp']
        data.features[i].properties['dc'] = result[code]['dc']
        data.features[i].properties['rea'] = result[code]['rea']
        data.features[i].properties['rad'] = result[code]['rad']
        data.features[i].properties['jour'] = result[code]['jour']
    }
    //return result; //JavaScript object
    return result; //JSON
}

function style(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 1,
        fillColor: getColor(feature.properties.hosp),
    } 
}
 
function getColor(d, min = 0, max = 2000) {
    return d > 2000 ? '#800026' :
        d > 1900  ? '#860c2c' :
        d > 1800  ? '#8d1832' :
        d > 1700  ? '#932438' :
        d > 1600  ? '#992f3e' :
        d > 1500  ? '#a03b44' :
        d > 1400  ? '#a6474b' :
        d > 1300  ? '#ac5351' :
        d > 1200  ? '#b35f57' :
        d > 1100  ? '#b96b5d' :
        d > 1000  ? '#c07663' :
        d > 900  ? '#c68269' :
        d > 800  ? '#cc8e6f' :
        d > 700  ? '#d39a75' :
        d > 600  ? '#d9a67b' :
        d > 500  ? '#dfb282' :
        d > 400   ? '#e6be88' :
        d > 300   ? '#ecc98e' :
        d > 200   ? '#f2d594' :
        d > 100   ? '#f9e19a' :
        '#FFEDA0';
}

function loadDoc() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            csv = xhttp.response.replace(/"/g,'')
            datacovid =  getData4map(csv, new Date())

            // Mise en place des polygone departement
            geojson = L.geoJson(data, {
                onEachFeature : onEachFeature,
                style : style,
            }).addTo(mymap);

            selectDate.addTo(mymap)
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
    minZoom: 4,
    maxZoom: 10,
    tileSize: 512,
    zoomOffset: -1,
    accessToken: ''
}).addTo(mymap);


var legend = L.control({position: 'bottomright'})

legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'legend'),
        grades = [0, 300, 600, 900, 1200, 1500, 1800, 2000];

    div.innerHTML += '<h6>Nombre de personne hospitalisé</h6>';
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor((grades[i] + 1) ) + '"></i> ' +
            grades[i] + (grades[i + 1] ? ' - ' + grades[i + 1] + ' <br>' : '+');
    }

    return div;
}

legend.addTo(mymap)

var info = L.control();

info.onAdd = function (mymap) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4> Statistiques</h4>' +  (props ?
        '<b>' + props.nom + '('+ props.code+') le '+ props.jour +'</b><br />' 
        + props.hosp + ' hospitalisés <br/>'
        + props.dc + ' décès <br/>'
        + props.rea + ' réanimation <br/>'
        + props.rad + ' à domicile <br/>'
        : 'Hover over a state');
};

info.addTo(mymap);


var selectDate = L.control();
selectDate.onAdd = function(mymap) {
    this._div = L.DomUtil.create('div', 'infqweo'); // create a div with a class "info"
    var form = document.createElement("form")
    var select = document.createElement("select")
    for(let i = 0 ; i < datedispo.length ; i++){
        option = document.createElement('option')
        d = datedispo[datedispo.length- i-2 ]
        option.innerHTML =  option.value = d 
        select.appendChild(option)

    }
    form.appendChild(select)
    select.onchange = function(){
        getData4map(csv, new Date(select.value))
        geojson.resetStyle()
    }
    this._div.appendChild(form)
    return this._div
}
donnees_link = 'https://www.data.gouv.fr/fr/datasets/r/63352e38-d353-4b54-bfd1-f1b3ee1cabd7'
loadDoc()



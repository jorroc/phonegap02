var app = {

    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        
    },
    onDeviceReady: function() {
        console.log('Dispositivo listo');
        var boton=document.getElementById('button1')
        boton.addEventListener('click',app.pulsar,false);
        
        //Accedemos a la geolocalizacion
        navigator.geolocation.getCurrentPosition(app.pintaCoordenadas,app.errorAlSolicitarLocalizacion);
        //navigator.geolocation.
    },
    pulsar: function(){
        alert ("pulsado el boton");
        var parentElement = document.getElementById('button1');
        parentElement.innerHTML="Pulsado";        
    },
    
    pintaCoordenadas: function (position) {
    var coordenadas = document.querySelector('#coordenadas');
    coordenadas.innerHTML="Latitud: "+position.coords.latitude+"|Longitud:"+position.coords.longitude;
    
    //Pinto coordenadas
    var miMapa = L.map('map').setView([position.coords.latitude, position.coords.longitude], 13);
    L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGFsaW1wIiwiYSI6ImNqYWh5bTBlYzJvN3gzMnE4aHZuM2N6ZGQifQ.a7n9Fyvw4OowydvBe-BvCA', {attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',maxZoom: 18}).addTo(miMapa);
    
    //Pinto marcador
    app.pintaMarcador([position.coords.latitude, position.coords.longitude], '¡Estoy aqui!', miMapa);

    
    //Se pintará un marcador cuando pinchemos en cualquier parte del mapa.
    miMapa.on('click', function (evento) {
        var texto = 'Marcador en l(' + evento.latlng.lat.toFixed(2) + ') y L(' + evento.latlng.lng.toFixed(2) + ')';
        app.pintaMarcador(evento.latlng, texto, miMapa);
    });

    },
    
    errorAlSolicitarLocalizacion: function (error) {
        var message='Jordi:'+error.code+':'+error.message;
        console.log(message);
        coordenadas.innerHTML=message;
    },

    pintaMarcador: function (latlng, texto, mapa) {
        var marcador = L.marker(latlng).addTo(mapa);
        marcador.bindPopup(texto).openPopup();
    }
};

app.initialize();
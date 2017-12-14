var app = {
    umbral: 10,
    inicio: function () {
        app.vigilaSensores();
    },
    logText: function (text,div) {
        div = div || 'log';
        var log = document.querySelector("#"+div);
        log.innerHTML = text;
    },
    vigilaSensores: function () {
        function onError() {
            app.logText('Error');
        }
        function onSuccess(datosAceleracion) {
            app.logText(datosAceleracion.x.toFixed(2) + "|" + datosAceleracion.y.toFixed(2) + "|" + datosAceleracion.z.toFixed(2));
            app.detectaAgitacion(datosAceleracion);
        }
        navigator.accelerometer.watchAcceleration(onSuccess, onError, {frequency: 1000});
    },
    detectaAgitacion: function (datosAceleracion) {
        var acX = datosAceleracion.x > app.umbral;
        var acY = datosAceleracion.y > app.umbral;
        if (acX || acY) {
            app.logText('agitación','agitado');
            setTimeout(function () { app.logText('', 'agitado'); }, 2000);
            navigator.vibrate(2000);
        }
    }
}
if ('addEventListener' in document) {
    document.addEventListener('deviceready', function () {
        app.inicio();
    }, false);
}
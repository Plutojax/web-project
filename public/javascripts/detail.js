const Sighting = require("../../model/Sighting");

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}
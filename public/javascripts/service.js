if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('ServiceWorker registered: ', registration.scope);
            })
            .catch((error) => {
                console.error('ServiceWorker registration failed: ', error);
            });
    });
}





/**
 * This code registers the service worker file "service-worker.js" if the browser supports service workers.
 * */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}

// eslint-disable-next-line no-unused-vars
/**
 * This function is triggered when an image is uploaded by the user.
 * It reads the file data using FileReader API and converts it into a base64-encoded string
 * that is stored in the dataset of the HTML element with ID 'bird_image'.
 */

function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;

    let idd = form.elements['identification'].value;
    if (idd.toString().trim().length <= 0) {
        idd = "NotGiven"
    }

    const dataBody = {
        image: document.getElementById('imageInput').dataset.base64,
        Identification: idd,
        Description: form.elements['description'].value,
        DateSeen: form.elements['dateSeen'].value,
        location: form.elements['location'].value,
        latitude: form.elements['latitude'].value,
        longitude: form.elements['longitude'].value,
    };
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    fetch('/insert-post', {
        method: 'POST',
        headers,
        body: JSON.stringify(dataBody),
        // eslint-disable-next-line consistent-return
    }).then((response) => {
        if (response.status === 200) {
            alert('Data saved successfully');
        }
    }).catch((error) => {
        console.log('error in insert-post fetch', error);
    });
}
function imageUploaded() {
    const file = document.getElementById('imageInput').files[0];
    const reader = new FileReader();

    reader.onload = function () {
        const base64String = reader.result;
        document.getElementById('imageInput').dataset.base64 = base64String;
    };
    console.log("run iamge upload")
    reader.readAsDataURL(file);
}

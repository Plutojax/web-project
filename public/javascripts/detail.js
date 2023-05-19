

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}
const postId = window.location.pathname.split('/').pop();
// This variable will be used to store the post details.
let post = null;

function handSubmit(event) {
    event.preventDefault();
    const form = event.target;
    let idd = form.elements['sighting-identification'].value;
    let iddd=form.elements['sighting-id'].value;
    console.log("iddd",iddd);
    if (idd.toString().trim().length <= 0) {
        alert('Identification can not be empty');
    }

    const dataBody = {
        Identification: idd,
        _id:iddd
    };
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    fetch('/update-id', {
        method: 'POST',
        headers,
        body: JSON.stringify(dataBody),
        // eslint-disable-next-line consistent-return
    }).then((response) => {
        if (response.status === 200) {
            alert('Data updated successfully');
        }
    }).catch((error) => {
        console.log('error in update data', error);
    });
}

fetch('/sighting-detail', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId }),
})
    .then((res) => res.json())
    .then((postData) => {
        post = postData;
        console.log("detail post",post);
        document.getElementById('sighting-identification').innerHTML = postData.Identification;
        document.getElementById('sighting-description').innerHTML=`<strong>Description: </strong>${postData.Description}`;
        document.getElementById('Date Seen').innerHTML=`<strong>Date Seen: </strong>${new Date(postData.DateSeen).toISOString()}`;
        document.getElementById('sighting-location').innerHTML=postData.location;
        document.getElementById('lightbox-image').src=postData.image;
        document.getElementById('sighting-id').innerHTML=postData._id;
    })
    .catch((err) => console.error(err));
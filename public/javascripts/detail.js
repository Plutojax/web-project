

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}
const postId = window.location.pathname.split('/').pop();
// This variable will be used to store the post details.
let post = null;

async function modifyIdentification() {
    const newIdentification = document.getElementById('sighting-identification').value;
    console.log(newIdentification);
    if (newIdentification.trim() === '') {
        alert('Identification cannot be empty.');
        return;
    }

    try {
        const response = await axios.post('/updatedIdentification', {
            sightingId: '<%= sighting._id %>',
            newIdentification: newIdentification
        });

        if (response.status === 200) {
            // document.getElementById('sighting-identification').value = response.data.updatedIdentification;
            location.reload();
            alert('Identification updated successfully.');
        } else {
            location.reload();
            throw new Error('Failed to update identification.');
        }
    } catch (error) {
        console.error(error);
    }
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
    })
    .catch((err) => console.error(err));
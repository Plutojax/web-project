/*
* Check if the user's browser supports Service Workers and,
* if it does, registers the service worker located at 'service-worker.js'.
* */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}

const container =document.getElementById('container');

/*
* Handle the upgrade event for the indexedDB database.
* Creates object stores for the postRequests and SavedPosts,
* with keyPath 'id' and autoIncrement set to true.
* Also creates an index for the SavedPosts object store on the '_id' property.
* This index will help in getting filtered data based on _id as key
* @param {Event} event - The upgrade event object.
* */

const handleUpgrade = (event) => {
    const db = event.target.result;
    db.createObjectStore('postRequests', { keyPath: 'id', autoIncrement: true });
    const savedPostObjectStore = db.createObjectStore('SavedPosts', { keyPath: 'id', autoIncrement: true });
    savedPostObjectStore.createIndex('_id', '_id');
};

/**
 Handles the success event of the indexedDB connection.
 */
const handleSuccess = (event) => {
    console.log('indexedDB connection successful: Home Page');
};

/**
 * Handles errors that occur when attempting to connect to IndexedDB in the context of the Home Page.
 */
const handleError = (error) => {
    console.log('indexedDB connection failed: Home Page');
};

/**
 * Initializes the IndexedDB database for the bird sighting app.
 * This function is invoked on page load to open the IndexedDB database and attach the necessary event listeners for
 * creating and upgrading object stores.
 * The IDBOpenDBRequest type object is returned and stored into requestIDB.
 * And this requestIDB object is available globally to access the indexedDB
 */
const requestIDB = (() => {
        const rdb = indexedDB.open('bird-sighting-app-DB', 1);
        rdb.addEventListener('upgradeneeded', handleUpgrade);
        rdb.addEventListener('success', handleSuccess);
        rdb.addEventListener('error', handleError);

        return rdb;
    }
)();

/**
 * Saves up to 5 posts into the SavedPosts object store in indexedDB.
 * Also, previously saved posts are cleared.
 * @param {Array} posts - The array of posts to be saved.
 */
async function savePostsToIndexedDB(posts) {
    try {
        const simplifiedPosts = posts.slice(0, 5).map(({ _id, image,DateSeen,Identification }) => ({ _id, image,DateSeen,Identification }));

        // save the new array of objects to indexedDB
        // eslint-disable-next-line no-use-before-define
        const db = requestIDB.result;
        const transaction = db.transaction(['SavedPosts'], 'readwrite');
        const savedPostsStore = transaction.objectStore('SavedPosts');

        const deleteAllRequest = savedPostsStore.clear();
        await new Promise((resolve) => {
            deleteAllRequest.onsuccess = resolve;
            deleteAllRequest.onerror = resolve;
        });
        simplifiedPosts.forEach((post) => {
            savedPostsStore.add(post);
        });
        console.log("save to indexDB successfully");
    } catch (error) {
        console.log(error);
    }
}

/**
 * This code block fetches all the posts from the server or cache on page load
 * saves them into IndexedDB for offline use, and creates an HTML image element
 * for each post to display it on the page.
 * @param {string} '/get-posts' - The server endpoint to fetch the posts from
 */
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');

    fetch('/get-posts')
        .then((response) => {
            console.log('HELLO', response);
            return response.json();
        })
        .then((posts) => {
            console.log('.then posts CHECK', posts);
            savePostsToIndexedDB(posts);
            posts.forEach((sighting) => {
                const div = document.createElement('div');
                div.classList.add('col-2');

                const div2 = document.createElement('div');
                div2.classList.add('card', 'p-2', 'mt-4');

                const img = document.createElement('img');
                img.src = sighting.image;
                img.onload = function () {
                    DrawImage(this);
                };
                img.classList.add('img-thumbnail');
                img.alt = '';

                const caption = document.createElement('div');
                caption.classList.add('card-body', 'text-truncate');

                const title = document.createElement('a');
                title.textContent = sighting.Identification;

                const dateSeen = document.createElement('p');
                dateSeen.classList.add('text-truncate');
                dateSeen.textContent = 'Seen on: ' + sighting.DateSeen.split("T")[0];

                caption.appendChild(title);
                caption.appendChild(dateSeen);

                div2.appendChild(img);
                div2.appendChild(caption);

                div.appendChild(div2);

                container.appendChild(div);
            });
        })
        .catch((error) => console.log(error));
});


/*
* click event listener for images.
* data-id is fetched from the event and pass it to Sighting post detail page
* */
container.addEventListener('click', (event) => {
    const clickedImageId = event.target.getAttribute('data-id');
    console.log('Clicked image ID: ', clickedImageId);
    if (clickedImageId !== null) {
        window.location.href = `/sighting/?id=${clickedImageId}`;
    }
});
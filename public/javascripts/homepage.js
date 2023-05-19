if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}



/**
 This function handles the upgrade event for the indexedDB database. It performs the following tasks:
 Creates object stores for 'postRequests' and 'SavedPosts' with a keyPath of 'id' and autoIncrement set to true.
 Sets up an index for the 'SavedPosts' object store on the '_id' property.
 The index on the '_id' property facilitates retrieving filtered data based on the '_id' key.
 @param {Event} event - The upgrade event object.
 */
const handleUpgrade = (event) => {
    const db = event.target.result;
    db.createObjectStore('postRequests', { keyPath: 'id', autoIncrement: true });
    db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });
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
 * Handles errors that occur when attempting to connect to IndexedDB.
 */
const handleError = (error) => {
    console.log('indexedDB connection failed: Home Page');
};

/**
 This function initializes the IndexedDB database for the bird sighting app. It performs the following tasks:
 Opens the IndexedDB database.
 Attaches necessary event listeners for creating and upgrading object stores.
 The function returns an IDBOpenDBRequest object (stored in the 'requestIDB' variable) which provides global access
 to the indexedDB.
 This function is invoked on page load to set up the database and enable access to the IndexedDB features.
 */
const reIndexDB = (() => {
        const rdb = indexedDB.open('bird-sighting', 1);
        rdb.addEventListener('upgradeneeded', handleUpgrade);
        rdb.addEventListener('success', handleSuccess);
        rdb.addEventListener('error', handleError);

        return rdb;
    }
)();

/**

 This function saves up to 5 posts into the 'SavedPosts' object store in IndexedDB. It performs the following tasks:
 Clears previously saved posts from the object store.
 Saves the provided array of posts into the object store.
 @param {Array} posts - The array of posts to be saved.
 */
async function savePostsToIndexedDB(posts) {
    try {
        const simplifiedPosts = posts.slice(0, 5).map(({ _id, image,Identification,Description,DateSeen,location }) => ({ _id, image,Identification,Description,DateSeen,location  }));
        console.log("save to POst",simplifiedPosts);
        // save the new array of objects to indexedDB
        const db = reIndexDB.result;
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
    } catch (error) {
        console.log(error);
    }
}

/**

 This code block performs the following tasks on page load:
 Fetches all the posts from the server or cache using the specified endpoint ('/get-posts').
 Saves the fetched posts into IndexedDB for offline use.
 Creates an HTML image element for each post to display it on the page.
 @param {string} endpoint - The server endpoint to fetch the posts from.
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

                const link = document.createElement('a'); // Create an 'a' element
                link.href = `/sightingDetail/${sighting._id}`; // Set the href attribute to the desired URL

                const img = document.createElement('img');
                img.src = sighting.image;
                img.onload = function () {
                    DrawImage(this);
                };
                img.classList.add('img-thumbnail');
                img.alt = '';

                link.appendChild(img); // Add the img element as a child of the 'a' element

                const caption = document.createElement('div');
                caption.classList.add('card-body', 'text-truncate');

                const title = document.createElement('a');
                title.textContent = sighting.Identification;


                caption.appendChild(title);

                div2.appendChild(link); // Add the 'a' element as a child of the div2 element
                div2.appendChild(caption);

                div.appendChild(div2);

                container.appendChild(div);
            });
        })
        .catch((error) => console.log(error));
});


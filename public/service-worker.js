const cacheName = 'bird-watching-app-cache';
const assets = [
    '/javascripts/homepage.js',
    '/javascripts/upload.js',
    '/javascripts/jqthumb.js',
    '/stylesheets/style.css',
    '/home',
    '/login',
    '/upload'
];

/**
 * This code registers a service worker and caches the assets defined in the assets array using the cacheName.
 * The waitUntil method ensures that the installation process does not finish until the caching is complete.
 * The caches.open() method returns a promise that resolves to a cache object.
 * Then the cache.addAll() method is called to add all the assets to the cache.
 * If there is an error in the caching process, it is caught and logged to the console.
 * Once the assets are cached successfully, a success message is logged to the console.
 */
// eslint-disable-next-line no-restricted-globals
self.addEventListener('install', (event) => {
  event.waitUntil(
      caches.open(cacheName)
          .then((cache) => {
            return cache.addAll(assets);
          })
          .then(() => {
            console.log('Assets cached successfully');
          })
          .catch((error) => {
            console.log('Error while caching assets:', error);
          })
  );
});

/**
* This code registers an event listener for 'activate' events on the Service Worker.
* It removes all caches that are not the current cacheName by iterating through all the caches keys,
* and deleting the ones that do not match the current cacheName.
* */
// service worker "activate" event listener
// eslint-disable-next-line no-restricted-globals
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key !== cacheName)
        .map((key) => caches.delete(key)))),
  );
});

/**
 * A function that retrieves data from an object store in indexedDB using either the getAll or get method,
 * depending on the parameters passed to it.
 * @param {IDBObjectStore} store - The object store from which to retrieve data.
 * @param {string} method - The method to use for retrieving data, either 'getAll' or 'get'.
 * @param {number|string} id - The ID of the data to retrieve. Required if method is 'get'.
 * @param {string} index - The index to use for retrieving data. Required if method is 'get' and the data is indexed.
 * @returns {Promise} - A promise that resolves with the retrieved data or rejects with an error.
 * */
function getFromStore(store, method, id, index) {
  return new Promise((resolve, reject) => {
    let request;
    if (method === 'getAll') {
      request = store.getAll();
    } else if (method === 'get') {
      if (index) {
        // eslint-disable-next-line no-underscore-dangle
        const _idIndex = store.index(index);
        request = _idIndex.get(id);
      } else {
        request = store.get(id);
      }
    }

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * This function handles the GET request for the sighting detail and returns the data associated with the post ID.
 * It first gets the ID from the URL, and then retrieves the post detail from the appropriate object store in IndexedDB,
 * depending on whether the post is saved or it was newly created while offline.
 * @param {Request} eventRequest - The Request object representing the incoming request.
 * @returns {Response} - The Response object containing the post detail data as JSON.
 * */
async function handleGetSightingDetailRequest(eventRequest) {
  const db = requestIDB.result;
  const transaction = db.transaction(['postRequests', 'SavedPosts'], 'readwrite');
  const postRequestsStore = transaction.objectStore('postRequests');
  const savedRequestsStore = transaction.objectStore('SavedPosts');

  const url = eventRequest.referrer;
  const id = url.substring(url.indexOf('=') + 1);

  let postDetail = null;
  if (id.includes('offid:')) {
    let postId = id.replace(/^offid:/, '');
    postId = parseInt(postId);
    postDetail = await getFromStore(postRequestsStore, 'get', postId);
  } else {
    postDetail = await getFromStore(savedRequestsStore, 'get', id, '_id');
  }
  return new Response(JSON.stringify(postDetail), {
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * This function is responsible for handling the request to retrieve all the posts.
 * It first opens the indexedDB database and creates a transaction to access the 'postRequests'
 * and 'SavedPosts' object stores.
 * Then, it retrieves all the saved posts and new offline posts from these object stores.
 * It concatenates these posts and maps them to a new array with each post containing an '_id' and 'image' property.
 * Finally, it returns a Response object with the array of posts as a JSON string and a 'Content-Type' header of 'application/json'.
 * */
async function handleGetPostsRequest(eventRequest) {
  // eslint-disable-next-line no-use-before-define
  const db = requestIDB.result;
  const transaction = db.transaction(['postRequests', 'SavedPosts'], 'readwrite');
  const postRequestsStore = transaction.objectStore('postRequests');
  const savedRequestsStore = transaction.objectStore('SavedPosts');
  const [savedPosts, newOfflinePosts] = await Promise.all([
    getFromStore(savedRequestsStore, 'getAll'),
    getFromStore(postRequestsStore, 'getAll'),
  ]);
  console.log('Saved Posts:', savedPosts);
  console.log('New Offline Posts:', newOfflinePosts);

  const sightings = [...savedPosts, ...newOfflinePosts].map((post) => ({
    _id: post._id || `offid:${post.id}`,
    image: post.image,
  }));

  return new Response(JSON.stringify(sightings), {
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * This function saves a new post request into IndexedDB.
 * It first gets the request body from the passed request object,
 * opens a transaction on the "postRequests" object store of IndexedDB,
 * and then adds the request body to the object store using the add() method.
 * It returns a promise that resolves with the result of the add() method.
 * */
async function saveRequestToIndexedDB(request) {
  const requestBody = await request.json();
  // eslint-disable-next-line no-use-before-define
  const postInsertRequestDB = requestIDB.result;
  const transaction = postInsertRequestDB.transaction(['postRequests'], 'readwrite');
  const postRequestsStore = transaction.objectStore('postRequests');
  const addRequest = postRequestsStore.add(requestBody);

  await new Promise((resolve, reject) => {
    addRequest.onsuccess = function (event) {
      resolve(event.target.result);
    };

    addRequest.onerror = function (event) {
      console.error('Error saving post in indexedDB', event.target.error);
      reject(event.target.error);
    };
  });

  return addRequest.result;
}

/**
 * This code implements a network first cache fallback approach for handling requests.
 * It listens to fetch events and attempts to fetch the resource from the network.
 * If the network fetch is successful, it is returned, otherwise it is fetched from the cache.
 * If the requested URL matches certain conditions, such as containing "insert-post", "get-posts", or "sighting-detail", different handling methods are employed.
 * The .then block is used for the network-first approach, while the .catch block is used for the cache fallback.
 * If the request fails to fetch from the network, it is handled by the .catch block.
 * In this block, if the URL contains "insert-post", the request is saved to IndexedDB and a sync event is registered.
 * If the URL contains "get-posts" or "sighting-detail", the request is handled by the respective functions.
 * If the request is not for "insert-post", "get-posts", or "sighting-detail", the response is fetched from the cache.
 * */
// fetch event with traditional .then() chain implementation
// eslint-disable-next-line no-restricted-globals
// fetch event listener
// eslint-disable-next-line no-restricted-globals
self.addEventListener('fetch', (event) => {
  const eventRequest = event.request.clone();

  event.respondWith(
    fetch(event.request)
      .then(async (networkResponse) => {
        if (eventRequest.url.indexOf('insert-post') > -1) {
          return networkResponse;
        }
        if (eventRequest.url.indexOf('get-posts') > -1) {
          console.log("get post from mongoodb");
          return networkResponse;
        } if (eventRequest.url.indexOf('sighting-detail') > -1) {
          console.log('DEBUG...', networkResponse.clone().json().then((res) => {
            console.log('Real check', res);
          }));
          return networkResponse;
        }
        return caches.open(cacheName).then((cache) => {
          cache.put(eventRequest, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(async () => {
        if (eventRequest.url.indexOf('insert-post') > -1) {
          const postIndexedDBID = await saveRequestToIndexedDB(eventRequest);
          // eslint-disable-next-line no-use-before-define
          registerSyncEvent(`insert-post-sync-${postIndexedDBID}`)
            .then(() => {
              console.log('sync event registered successfully');
            })
            .catch((error) => {
              console.log('sync event registration failed: ', error);
            });
          return new Response(JSON.stringify({ message: 'success' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
          });
        } if (eventRequest.url.indexOf('get-posts') > -1) {
          const response = await handleGetPostsRequest(eventRequest);
          console.log("get post from index DB");
          return Promise.resolve(response);
        } if (eventRequest.url.indexOf('sighting-detail') > -1) {
          const response = await handleGetSightingDetailRequest(eventRequest);
          return Promise.resolve(response);
        }
        return caches.open(cacheName)
          .then(async (cache) => {
            return cache.match(eventRequest);
          })
          .then((response) => {
            if (response) {
              return response;
            }
            return new Response('Network unavailable', { status: 503 });
          });
      }),
  );
});

/**
 * Registers a synchronization event with the given tag.
 * If the browser supports the SyncManager, it will return a promise that resolves when the synchronization event is registered.
 * Otherwise, it will return a rejected promise with an error message indicating that sync events are not supported.
 * */
function registerSyncEvent(tag) {
  if ('SyncManager' in self) {
    return self.registration.sync.register(tag);
  }
  return Promise.reject(new Error('Sync events are not supported'));
}

const handleUpgrade = () => {
  console.log('indexedDB upgraded');
};

// handle success event on indexedDB connection
const handleSuccess = () => {
  console.log('indexedDB connection successful');
};

const handleError = () => {
  console.log('indexedDB connection failed');
};

// Open a connection to an IndexedDB database called "birdSightingAppDB" with version number 1
const requestIDB = (() => {
  const birdSightingAppDB = indexedDB.open('bird-sighting-app-DB', 1);
  console.log('indexedDB launched');
  // eslint-disable-next-line max-len
  // Attach event listeners to the IndexedDB open request to handle the upgrade, success, and error events
  birdSightingAppDB.addEventListener('upgradeneeded', handleUpgrade);
  birdSightingAppDB.addEventListener('success', handleSuccess);
  birdSightingAppDB.addEventListener('error', handleError);

  // Return the IndexedDB open request
  return birdSightingAppDB;
})();

/**
 * This function deletes a record from an indexedDB object store given the key.
 * It first obtains a reference to the object store, then calls the delete() method with the key to remove the record from the store.
 * */
function deleteRecordFromIndexDB(objectStore, key) {
  const postInsertRequestDB = requestIDB.result;
  const transaction = postInsertRequestDB.transaction([objectStore, 'readwrite']);
  const postRequestsStore = transaction.objectStore(objectStore);
  postRequestsStore.delete(key);
}

/**
 * This code handles the 'sync' event which is triggered when the user regains internet connectivity after going offline.
 * If the event tag includes 'insert-post-sync', it retrieves the post from IndexedDB and sends a POST request to the server to insert the post data.
 * If the server response has a status of 200, the post is deleted from IndexedDB.
 * */
// eslint-disable-next-line no-restricted-globals
self.addEventListener('sync', (event) => {
  if (event.tag.indexOf('insert-post-sync') > -1) {
    // eslint-disable-next-line no-debugger
    console.log("sync successfully 2.0")
    const postInsertRequestDB = requestIDB.result;
    const transaction = postInsertRequestDB.transaction(['postRequests'], 'readwrite');
    const postRequestsStore = transaction.objectStore('postRequests');
    const postKey = parseInt(event.tag.substring(event.tag.lastIndexOf('-') + 1), 10);
    const postIdRequest = postRequestsStore.get(postKey);

    postIdRequest.onsuccess = (evt) => {
      const post = evt.target.result;

      const dataBody = {
        image:post.image,
        Identification: post.Identification,
        Description: post.Description,
        DateSeen: post.DateSeen,
        location: post.location,
      };
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');

      fetch('/insert-post', {
        method: 'POST',
        headers,
        body: JSON.stringify(dataBody),
        // eslint-disable-next-line consistent-return
      }).then((response) => {
        console.log("sync successfully")
        if (response.status === 200) {
          const transaction2 = postInsertRequestDB.transaction(['postRequests'], 'readwrite');
          const postRequestsStore2 = transaction2.objectStore('postRequests');
          postRequestsStore2.delete(post.id);
          return response.json();
        }
      }).catch((error) => {
        console.log('Error occurred while saving offline posts', error);
      });
    };
  }
});



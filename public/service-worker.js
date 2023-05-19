const cacheName = 'bird-watching-app-cache';
const assets = [
    '/javascripts/homepage.js',
    '/javascripts/upload.js',
    '/javascripts/detail.js',
    '/javascripts/jqthumb.js',
    '/stylesheets/style.css',
    '/',
    '/login',
    '/upload',
    '/sightingDetail/'
];

/**
 * installation event: it adds all the files to be cached
 */
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
 * activation of service worker: it removes all cashed files if necessary
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key !== cacheName)
        .map((key) => caches.delete(key)))),
  );
});

// This function retrieves data from a specified store in an indexedDB database.
// It takes in the store object, a method name, an optional ID, and an optional index.
// Returns a promise that resolves with the retrieved data or rejects with an error.
function getFromStore(store, method, id, index) {
  return new Promise((resolve, reject) => {
    let request;
    if (method === 'getAll') {
      request = store.getAll();
    } else if (method === 'get') {
      if (index) {
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

// This asynchronous function handles a request to retrieve a specific sighting detail.
// It receives an eventRequest object as a parameter.
// The function performs the following steps:
// 1. Retrieves the indexedDB database instance from the global `requestIDB` object.
// 2. Starts a read-write transaction on the 'postRequests' and 'SavedPosts' object stores.
// 3. Retrieves the object stores from the transaction.
// 4. Extracts the URL from the eventRequest referrer.
// 5. Parses the ID from the URL by splitting the URL and taking the last segment.
// 6. Based on the ID, it determines whether the request is for a post request or a saved request.
// 7. If the ID includes 'offid:', it removes the prefix and converts it to an integer postId.
//    Then, it uses the getFromStore function to retrieve the post detail from the 'postRequests' store.
// 8. If the ID does not include 'offid:', it directly uses the getFromStore function to retrieve the post detail
//    from the 'SavedPosts' store, using the ID and the '_id' index.
// 9. Returns a response containing the retrieved post detail as a JSON string.
async function handleGetSightingDetailRequest(eventRequest) {
  const db = requestIDB.result;
  const transaction = db.transaction(['postRequests', 'SavedPosts'], 'readwrite');
  const postRequestsStore = transaction.objectStore('postRequests');
  const savedRequestsStore = transaction.objectStore('SavedPosts');

  const url = eventRequest.referrer;
  const id = url.split('/').pop();

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

// This asynchronous function handles a request to retrieve all posts.
// It receives an eventRequest object as a parameter.
// The function performs the following steps:
// 1. Retrieves the indexedDB database instance from the global `requestIDB` object.
// 2. Starts a read-write transaction on the 'postRequests' and 'SavedPosts' object stores.
// 3. Retrieves the object stores from the transaction.
// 4. Uses the getFromStore function to asynchronously retrieve all saved posts and new offline posts.
// 5. Consolidates the retrieved saved posts and new offline posts into a single array called 'sightings'.
// 6. Maps each post in the 'sightings' array to a new object with selected properties, including '_id',
//    'image', 'Identification', 'Description', 'DateSeen', and 'location'.
// 7. Returns a response containing the 'sightings' array as a JSON string.
//    The response has the 'Content-Type' header set to 'application/json'.
async function handleGetPostsRequest(eventRequest) {
  const db = requestIDB.result;
  const transaction = db.transaction(['SavedPosts'], 'readwrite');
  const savedRequestsStore = transaction.objectStore('SavedPosts');
  const [savedPosts] = await Promise.all([
    getFromStore(savedRequestsStore, 'getAll'),
  ]);


  const sightings = [...savedPosts].map((post) => ({
    _id: post._id ,
    image: post.image,
    Identification:post.Identification,
    Description:post.Description,
    DateSeen:post.DateSeen,
    location:post.location
  }));

  return new Response(JSON.stringify(sightings), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// This asynchronous function saves a request body to the 'postRequests' object store in indexedDB.
// It receives a request object as a parameter.
// The function performs the following steps:
// 1. Parses the request body from the provided request object by calling the `json()` method.
// 2. Retrieves the indexedDB database instance from the global `requestIDB` object.
// 3. Starts a read-write transaction on the 'postRequests' object store.
// 4. Retrieves the object store from the transaction.
// 5. Adds the parsed request body to the 'postRequests' store by calling the `add()` method.
// 6. Returns a promise that resolves when the addition is successful or rejects if an error occurs.
//    The promise handles the `onsuccess` and `onerror` events of the `addRequest`.
//    On success, it resolves with the result of the `addRequest`.
//    On error, it logs an error message and rejects with the corresponding error.
async function saveRequestToIndexedDB(request) {
  const requestBody = await request.json();
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


// This asynchronous function saves a request body to the 'user' object store in indexedDB.
// It receives a request object as a parameter.
// The function performs the following steps:
// 1. Parses the request body from the provided request object by calling the `json()` method.
// 2. Retrieves the indexedDB database instance from the global `requestIDB` object.
// 3. Starts a read-write transaction on the 'user' object store.
// 4. Retrieves the object store from the transaction.
// 5. Adds the parsed request body to the 'user' store by calling the `add()` method.
// 6. Returns a promise that resolves when the addition is successful or rejects if an error occurs.
//    The promise handles the `onsuccess` and `onerror` events of the `addRequest`.
//    On success, it resolves with the result of the `addRequest`.
//    On error, it logs an error message and rejects with the corresponding error.
async function saveIdToIndexedDB(request) {
  const requestBody = await request.json();
  const postInsertRequestDB = requestIDB.result;
  const transaction = postInsertRequestDB.transaction(['user'], 'readwrite');
  const postRequestsStore = transaction.objectStore('user');
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

// This event listener is responsible for intercepting and handling fetch requests made by the service worker.
// It listens for the 'fetch' event and performs the following steps:
// 1. Clones the original request using `clone()` method to ensure the event request is not modified.
// 2. Uses `respondWith()` to override the default fetch behavior and provide a custom response.
// 3. Makes a fetch request to the original event request using `fetch(event.request)`.
// 4. Handles different scenarios based on the URL of the event request:
//    - If the URL includes 'insert-post', it returns the network response without any modifications.
//    - If the URL includes 'get-posts', it logs a message indicating fetching posts from MongoDB
//      and returns the network response without any modifications.
//    - If the URL includes 'sighting-detail', it returns the network response without any modifications.
//    - If the URL includes 'update-id', it returns the network response without any modifications.
//    - For other URLs, it caches the network response using the specified cache name.
// 5. If an error occurs during the fetch request, it handles different scenarios based on the URL of the event request:
//    - If the URL includes 'insert-post', it saves the request to the 'postRequests' object store in indexedDB,
//      registers a sync event for later synchronization, and returns a JSON response with a success message.
//    - If the URL includes 'update-id', it saves the request to the 'user' object store in indexedDB,
//      registers a sync event for later synchronization, and returns a JSON response with a success message.
//    - If the URL includes 'get-posts', it handles the request by calling the 'handleGetPostsRequest' function,
//      which retrieves and returns the posts from the indexedDB and network.
//    - If the URL includes 'sighting-detail', it handles the request by calling the 'handleGetSightingDetailRequest' function,
//      which retrieves and returns the post detail from the indexedDB and network.
//    - For other URLs, it attempts to fetch the response from the cache using the specified cache name.
//      If a matching response is found, it returns the response; otherwise, it returns a response indicating
//      that the network is unavailable.
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
        }
        if (eventRequest.url.indexOf('sighting-detail') > -1) {
          return networkResponse;
        }
        if (eventRequest.url.indexOf('update-id') > -1) {
          return networkResponse;
        }
        return caches.open(cacheName).then((cache) => {
          if (eventRequest.url.includes('/sightingDetail/')) {
            cache.put('/sightingDetail/', networkResponse.clone());
            return networkResponse;
          }
          cache.put(eventRequest, networkResponse.clone());
          return networkResponse;
        });
      })
        .catch(async () => {
          if (eventRequest.url.indexOf('insert-post') > -1) {
            const postIndexedDBID = await saveRequestToIndexedDB(eventRequest);
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
          }if (eventRequest.url.indexOf('update-id') > -1) {
            const postIndexedDBID = await saveIdToIndexedDB(eventRequest);
            registerSyncEvent(`update-id-sync-${postIndexedDBID}`)
                .then(() => {
                  console.log('sync event registered successfully');
                })
                .catch((error) => {
                  console.log('sync event registration failed: ', error);
                });
            return new Response(JSON.stringify({message: 'success'}), {
              headers: {'Content-Type': 'application/json'},
              status: 200,
            });
          }
          if (eventRequest.url.indexOf('get-posts') > -1) {
            const response = await handleGetPostsRequest(eventRequest);
            return Promise.resolve(response);
          } if (eventRequest.url.indexOf('sighting-detail') > -1) {
            const response = await handleGetSightingDetailRequest(eventRequest);
            return Promise.resolve(response);
          }
          return caches.open(cacheName)
              .then(async (cache) => {
                if (eventRequest.url.includes('/sightingDetail/')) {
                  return cache.match('/sightingDetail/');
                }
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

// This function is responsible for registering a sync event with a specified tag.
// It receives a tag as a parameter.
// The function performs the following steps:
// 1. Checks if the 'SyncManager' is supported in the current environment.
// 2. If supported, it uses the `register()` method of the `self.registration.sync` object to register the sync event with the provided tag.
// 3. Returns a promise that resolves with the result of the registration if successful or rejects with an error if sync events are not supported.
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
  // Attach event listeners to the IndexedDB open request to handle the upgrade, success, and error events
  birdSightingAppDB.addEventListener('upgradeneeded', handleUpgrade);
  birdSightingAppDB.addEventListener('success', handleSuccess);
  birdSightingAppDB.addEventListener('error', handleError);

  // Return the IndexedDB open request
  return birdSightingAppDB;
})();



// This event listener is responsible for handling sync events triggered by the browser.
// It listens for the 'sync' event and performs specific actions based on the event tag.
// The function performs the following steps:
// 1. Checks if the event tag contains 'insert-post-sync'.
// 2. If true, it retrieves the corresponding post from the indexedDB, constructs the data body, and sends a POST request to '/insert-post' endpoint.
//    - If the response status is 200, it deletes the post from the indexedDB.
// 3. Checks if the event tag contains 'update-id-sync'.
// 4. If true, it retrieves the corresponding post from the indexedDB, constructs the data body, and sends a POST request to '/update-id' endpoint.
//    - If the response status is 200, it deletes the post from the indexedDB.
self.addEventListener('sync', (event) => {
  if (event.tag.indexOf('insert-post-sync') > -1) {
    console.log("sync successfully 2.0")
    const postInsertRequestDB = requestIDB.result;
    const transaction = postInsertRequestDB.transaction(['postRequests'], 'readwrite');
    const postRequestsStore = transaction.objectStore('postRequests');
    const postKey = parseInt(event.tag.substring(event.tag.lastIndexOf('-') + 1), 10);
    const postIdRequest = postRequestsStore.get(postKey);

    postIdRequest.onsuccess = (evt) => {
      const post = evt.target.result;
      console.log("post get from index DB",post);
      const dataBody = {
        image:post.image,
        Identification: post.Identification,
        Description: post.Description,
        DateSeen: post.DateSeen,
        location: post.location,
      };
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      console.log("ready to sync to Mongoo DB");
      fetch('/insert-post', {
        method: 'POST',
        headers,
        body: JSON.stringify(dataBody),
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
  if (event.tag.indexOf('update-id-sync') > -1) {
    console.log("sync successfully 2.0");
    const postInsertRequestDB = requestIDB.result;
    const transaction = postInsertRequestDB.transaction(['user'], 'readwrite');
    const postRequestsStore = transaction.objectStore('user');
    const postKey = parseInt(event.tag.substring(event.tag.lastIndexOf('-') + 1), 10);
    const postIdRequest = postRequestsStore.get(postKey);

    postIdRequest.onsuccess = (evt) => {
      const post = evt.target.result;
      console.log("post get from index DB",post);
      const dataBody = {
        Identification: post.Identification,
        _id:post._id
      };
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      console.log("ready to sync to Mongoo DB");
      fetch('/update-id', {
        method: 'POST',
        headers,
        body: JSON.stringify(dataBody),
      }).then((response) => {
        console.log("sync successfully")
        if (response.status === 200) {
          const transaction2 = postInsertRequestDB.transaction(['user'], 'readwrite');
          const postRequestsStore2 = transaction2.objectStore('user');
          postRequestsStore2.delete(post.id);
          return response.json();
        }
      }).catch((error) => {
        console.log('Error occurred while update id', error);
      });
    };
  }
});



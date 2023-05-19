const express = require('express');
const router = express.Router();
const Sighting = require('../model/Sighting');

/**
 * GET route for retrieving a specific sighting by id.
 * Sends back the retrieved sighting.
 * @name get/sighting-location/:sightingId
 * @param {string} req.params.sightingId - The id of the sighting to retrieve.
 * @return {object} sighting - The sighting retrieved from the database.
 * @throws {Error} If there is an error, it will be passed to the next error middleware.
 */
router.get('/sighting-location/:sightingId', async (req, res, next) => {
    // Extract the `sightingId` from the request parameters
    const sightingId = req.params.sightingId;
    console.log(sightingId);
    // Fetch the sighting with the given `sightingId` and send it as the response
    const sighting = await Sighting.getSightingById(sightingId);
    res.send(sighting);
});

/**
 * GET route for retrieving sighting details and related bird information from DBpedia by id.
 * Renders a detail view of the sighting and bird information.
 * @name get/sightingDetail/:sightingId
 * @param {string} req.params.sightingId - The id of the sighting to retrieve.
 * @return {object} Renders the sighting detail view with the sighting and bird information.
 * @throws {Error} Will send 404 if sighting is not found or pass error to the next error middleware.
 */
router.get('/sightingDetail/:sightingId', async (req, res, next) => {
    try {
        const sightingId = req.params.sightingId;
        console.log(sightingId)
        const sighting = await Sighting.getSightingById(sightingId);
        if (sighting) {
            // get the identification of bird from mongoDB
            const query = sighting.Identification.toString().trim();
            console.log(query);

            // if the identification is given when create
            if (!(query === "NotGiven"))
            {
                //The DBpedia resource to retrieve data from
                const resource = 'http://dbpedia.org';
                // The DBpedia SPARQL endpoint URL
                const endpointUrl = 'https://dbpedia.org/sparql';

                // The SPARQL query to retrieve data for the given resource
                const sparqlQuery = `PREFIX dbprop:<http://dbpedia.org/property/>` +
                    `select distinct ?Animal ?name ?abstract ` +
                    `where {` +
                    `?Animal rdf:type dbo:Bird; dbprop:name ?name; dbo:abstract ?abstract.` +
                    `OPTIONAL {?Animal dbprop:abstract ?abstract .}` +
                    `FILTER((?abstract) LIKE \"%` +
                    query +
                    `%\" && (langMatches(lang(?abstract), \"en\")))` +
                    `} `
                // Encode the query as a URL parameter
                const encodedQuery = encodeURIComponent(sparqlQuery);
                // Build the URL for the SPARQL query
                const url = `${endpointUrl}?query=${encodedQuery}&format=json`;
                // Use fetch to retrieve the data
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        // The results are in the 'data' object
                        var binding = data.results.bindings;
                        if (binding.length>0)
                            res.render('sightingDetail',{sightingId:sightingId,birdname:binding[0].name.value,abstracts:binding[0].abstract.value,link:binding[0].Animal.value})
                        else
                        {
                            res.render('sightingDetail',{sightingId:sightingId,birdname:"Sorry",abstracts:"did not find any bird via identification",link:"error!!"})
                        }
                    });
            }
            else
            {
                res.render('sightingDetail',{sightingId:sightingId,birdname:"Sorry",abstracts:"No identification of this sighting",link:"error!!"})
            }

            // res.render('sightingDetail', { sighting:sighting,username:coo });
        } else {
            res.status(404).send('sighting not found');
        }
    } catch (error) {
        next(error);
    }
});





module.exports = router;

const express = require('express');
const router = express.Router();
const Sighting = require('../model/Sighting');


router.get('/sighting-location/:sightingId', async (req, res, next) => {
    // Extract the `sightingId` from the request parameters
    const sightingId = req.params.sightingId;
    console.log(sightingId)
    // Fetch the sighting with the given `sightingId` and send it as the response
    const sighting = await Sighting.getSightingById(sightingId);
    res.send(sighting)
});

router.get('/sighting-detail/:sightingId', async (req, res, next) => {
    try {
        const coo=req.cookies.username;
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
                            res.render('sightingDetail',{sighting:sighting,username:coo,birdname:binding[0].name.value,abstracts:binding[0].abstract.value,link:binding[0].Animal.value})
                        else
                        {
                            res.render('sightingDetail',{sighting:sighting,username:coo,birdname:"Sorry",abstracts:"did not find any bird via identification",link:"error!!"})
                        }
                    });
            }
            else
            {
                res.render('sightingDetail',{sighting:sighting,username:coo,birdname:"Sorry",abstracts:"No identification of this sighting",link:"error!!"})
            }

            // res.render('sightingDetail', { sighting:sighting,username:coo });
        } else {
            res.status(404).send('sighting not found');
        }
    } catch (error) {
        next(error);
    }
});

router.post('/updatedIdentification', async (req, res) => {
    const { sightingId, newIdentification } = req.body;
    console.log(sightingId)
    try {
        const updatedSighting = await Sighting.findByIdAndUpdate(sightingId, { Identification: newIdentification }, { new: true });
        if (updatedSighting) {
            res.status(200).json({ updatedIdentification: updatedSighting.Identification });
        } else {
            res.status(404).json({ error: 'Sighting not found.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update identification.' });
    }
});



module.exports = router;

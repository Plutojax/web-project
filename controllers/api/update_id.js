const SightingPost = require("../../model/Sighting");

// This function handles updating the identification field of a SightingPost object.
// It receives a request containing the new identification data and the post ID to be updated.
// After finding the post, it updates the identification field with the new value and saves the changes.
// Finally, it redirects the user to a success page or an error page, depending on the outcome.
const updateId = (req, res) => {
    const { Identification, _id } = req.body;

    SightingPost.findById(_id)
        .then((post) => {
            if (!post) {
                // Handle case when post is not found
                return res.status(404).json({ error: 'Post not found' });
            }

            // Update the identification field
            post.Identification = Identification;

            return post.save();
        })
        .then(() => {
            // Redirect to success page
            res.redirect('/success');
        })
        .catch((err) => {
            // Handle errors and show error page
            console.error(err);
            res.redirect('/error');
        });
};

module.exports = { updateId };
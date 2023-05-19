const SightingPost = require("../../model/Sighting");
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
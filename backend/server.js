// web framework for building the REST API
const express = require('express');
// allows the Angular app to call this server from another port
const cors = require('cors');

// the three route files, one per work package
const plantsRouter = require('./routes/plants');
const bedsRouter = require('./routes/beds');
const authRouter = require('./routes/auth');

// create the server
const app = express();
const PORT = 3000;

// allow requests coming from the Angular dev server
app.use(cors());
// read JSON from request bodies and put it into req.body
app.use(express.json());

// hand requests over to the matching router
app.use('/api/plants', plantsRouter);
app.use('/api/beds', bedsRouter);
app.use('/api/auth', authRouter);

// start listening for requests
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
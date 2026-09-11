const express = require('express');
const cors = require('cors');

// one router file per work package (F-11)
const plantsRouter = require('./routes/plants');
const bedsRouter = require('./routes/beds');
const authRouter = require('./routes/auth');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/plants', plantsRouter);
app.use('/api/beds', bedsRouter);
app.use('/api/auth', authRouter);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
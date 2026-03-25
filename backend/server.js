require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

const jobRoutes = require('./routes/jobRoutes');

app.get('/', (req, res) => {
  res.send('Job Finder API is running...');
});

app.use('/api', jobRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

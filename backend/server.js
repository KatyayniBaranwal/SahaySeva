require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/providers', require('./routes/providerRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/organizations', require('./routes/organizationRoutes'));
app.use('/api/opportunities', require('./routes/opportunityRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/institutes', require('./routes/instituteRoutes'));
app.use('/api/programs', require('./routes/programRoutes'));
app.use('/api/participations', require('./routes/participationRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

app.get('/', (req, res) => {
  res.json({ name: 'SahaySeva API', status: 'running', docs: '/api' });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SahaySeva API running on port ${PORT}`));

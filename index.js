const app = require('./src/app');
const dotenv = require('dotenv');

dotenv.config();
const host = process.env.APP_IP || '0.0.0.0';
const PORT = process.env.PORT || 3000;

app.listen(PORT, host, () => {
  console.log(`Server running on http://${host}:${PORT}`);
});

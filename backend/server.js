const express = require('express');
const authRoute = require('./routes/auth_route');
const authMiddleware = require('./middleware/auth_middleware');
const dataRoute = require('./routes/data_route');
const dashboardRoute = require('./routes/dashboard_route');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());


// for login and register routes
app.use('/auth', authRoute);


// fetch stock data 
app.use('/stocks', authMiddleware, dataRoute);


// fetch all stocks registered for the authenticated user
app.use('/dashboard', authMiddleware, dashboardRoute);

    



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

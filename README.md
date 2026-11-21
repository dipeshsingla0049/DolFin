# Dolfin

Dolfin is a personal stock research workspace. Users can register, look up a ticker,
review its market and company fundamentals, and revisit stocks saved to their watchlist.
Stocks are cached globally; each lookup also links that stock to the signed-in user.

## Backend setup

Create `backend/.env` with:

```env
DATABASE_URL=your-postgresql-connection-string
SECRET_KEY=your-long-random-jwt-secret
DATA_KEY=your-twelve-data-api-key
```

Install dependencies and apply the Prisma migrations:

```sh
cd backend
npm install
npx prisma migrate deploy
npm start
```

The API listens on port `3000` by default.

## Frontend setup

In another terminal:

```sh
cd frontend
npm install
npm start
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The
development server proxies `/auth`, `/dashboard`, and `/stocks` to the backend at
`http://localhost:3000`. To use another backend URL, set `BACKEND_URL` before starting
Vite.

## Features

- Register and sign in with an email and password.
- Look up a stock ticker and view its saved market, valuation, income, balance-sheet,
  and reporting-period fields.
- Return to any previously researched stock in the account watchlist.
- Export all stocks linked to the account as an `.xlsx` workbook.

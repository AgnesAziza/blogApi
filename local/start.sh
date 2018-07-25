#!/bin/sh
export PORT=3000
export MONGODB_URI="mongodb://127.0.0.1:27017/agnesapi";
export JWT_TIME="7d"
export JWT_SECRET="AZEAZEADDFEvervebazeuzaeo23213"

export MAIL_FROM='"Agnes API MAIL" <agnes@angnesapi.com>'

concurrently 'nodemon --inspect index.js' 'cd client && export PORT=4000 && npm run start'

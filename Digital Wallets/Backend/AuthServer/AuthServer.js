import Provider from 'oidc-provider';
import Express from 'express';
import cors from 'cors';
import {join} from 'node:path';
import Routes from './Routes.js'
import Account from './Accounts.js'
import Config from './Config.js'

const app = Express();
app.set('views', join('./Backend/AuthServer', 'views')); //Sets the file path of views
app.set('view engine', 'ejs'); //Tells express what types of files to load for views
app.set('cache-control', 'no-store'); //Deals with caching (need to research more)

const oidc = new Provider('http://localhost:3000', Config); //Sets the domain name and imports the config
await Account.InputData()
Routes(app, oidc)
app.use('/oidc', oidc.callback(), cors({origin: ['http://127.0.0.1:5500', 'http://localhost:8080']})); //Sets all the endpoints after /oidc
app.listen(3000, () => {console.log('Running!');});
import openid from 'openid-client';
import Express, { response } from 'express';
import Request from 'request';
import fs from 'fs'
import cors from 'cors';

fs.writeFileSync('./backend/RelyingParty/data.json', "{}")

const issuer ='http://localhost:3000'

const code_verifier = openid.generators.codeVerifier()
const code_challenge = openid.generators.codeChallenge(code_verifier)
const nonce = openid.generators.nonce() //Generates all extra info

const params = { //Full list of parameters that might need to be passed
    client_id: 'foo',
    redirect_uri: 'http://127.0.0.1:5500/Frontend/get_verified.html',
    response_type: 'code',
    scope: 'openid',
    code_challenge,
    code_challenge_method: 'S256',
    nonce,
    iss: 'http://localhost:3000'
}

const app = Express();
app.use(cors({origin: ['http://127.0.0.1:5500']}))
app.listen(8080, () => {console.log('Running!');});

app.get('/getparams', async (req, res) => {
    Request.get({ //Sends HTTP request to auth server
        url: issuer + '/params',
        json: true
    },
    (error, response) => {
        if (error) {res.send(error); return}
        let ReqParams = {}
        for (const [key, value] of Object.entries(response.body)) {
            ReqParams[value] = params[value] //Sets the full list of parameters in a proper format
        }
        ReqParams.redirect_uri = 'http://127.0.0.1:5500/Frontend/get_verified.html'
        ReqParams.issuer = issuer
        res.send(ReqParams);
    })
})

app.get('/transfercode', async(req, res) => {
    const code = JSON.stringify({StaffsUni: {code: req.query.code}})
    fs.writeFileSync('./backend/RelyingParty/data.json', code)

    res.send('complete')
})

app.get('/existingcredentials', async(req, res) => {
    let data = fs.readFileSync('./backend/RelyingParty/data.json', "utf-8"); data = JSON.parse(data)
    let responsedata = ""
    Object.entries(data).forEach(([key]) => {
        //responsedata.push(key)
        responsedata += ' ' + key + '/'
    })
    res.send(responsedata)
})

app.get('/fetchtoken', async(req, res) => {
    let data = fs.readFileSync('./backend/RelyingParty/data.json', "utf-8"); data = JSON.parse(data)
    Request.get({
        url: issuer + `/token?code=${data.StaffsUni.code}`,
        json: true
    },
    (error, response) => {
        if (error) {res.send(error); return}
        console.log(response.body)
        res.send(response.body)
    })
})

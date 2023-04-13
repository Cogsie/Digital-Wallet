import Account from './Accounts.js'
import Request from 'request';
import { SignJWT, generateSecret } from 'jose';
import { urlencoded } from 'express'; const body = urlencoded({ extended: false }); //Needed to get body information
export default(app, oidc) => {

app.get('/params', async (req, res) => { //Sends back a list of required parameters 
  const params = ['client_id','scope','response_type','code_challenge_method','code_challenge','nonce']
  res.send(params)
})

app.get('/interaction/:uid', async (req, res) => {LoginRender(false, req, res)});
  
  app.post('/interaction/:uid/auth', body, async (req, res) => { //Called after login page    
    var account = await Account.findAccount(req.body.login, req.body.password);  
    if (account==undefined) {
      LoginRender(true, req, res)
    }
    const {uid, prompt, params} = await oidc.interactionDetails(req, res);
    const client = await oidc.Client.find(params.client_id);
    res.render('interaction', { //Renders the user conformation page
      client,
      uid,
      details: prompt.details,
      params,
      title: 'Authorize',
      login: req.body.login
    })
  });
  
  app.post('/interaction/:uid/confirm', body, async (req, res) => { //Called after user confirms login
    const {params} = await oidc.interactionDetails(req, res);  
    const url = new URL('https://localhost:3000'+req.url);
    const account = await Account.findAccount(url.searchParams.get("login"))
    const grant = new oidc.Grant({accountId: account.accountID, client_id: params.client_id})
    const grantId = await grant.save();

    Request.get({ //Sends code to RelyingParty via HTTP
      url: `http://localhost:8080/transfercode?code=${grantId}`,
      json: false,
    },
    (error, response) => {
      if (error) {console.log(error); return}
      res.redirect(params.redirect_uri + `?auth_interaction=complete&code=${grantId}`) //Redirect back to the redirect_uri that was passed to gain access to the auth page
    })
  })

app.get('/token', async (req, res) => {
  
  const code = await oidc.Grant.find(req.query.code)
  if (code == undefined) {res.send('Code is not valid!'); return}
  let date = new Date()
  if (code.exp < Math.round((date.setSeconds(date.getSeconds())) / 1000)) {res.send('Code has expired!'); return;}

  const OAccount = await Account.findAccountID(code.accountId)
  
  //const CAccount = {}
  //for (key in OAccount) {CAccount[key] = OAccount[key]}

  const CAccount = Object.assign({}, OAccount)

  const AToken = new oidc.AccessToken({accountId: CAccount.accountID})
  const accessToken = await AToken.save();
  delete CAccount.Password
  const JWT = await signJwt(CAccount)

  const TokenSet = {access_token: accessToken, token_type: "Bearer", id_token: JWT}
  console.log(TokenSet)
  res.send(TokenSet)
})

async function LoginRender(error, req, res) {
  const {uid, prompt, params} = await oidc.interactionDetails(req, res);
  const client = await oidc.Client.find(params.client_id);
  res.render('login', { //Renders the login page
    client,
    uid,
    details: prompt.details,
    params,
    title: 'Sign-in',
    error
  }); 
}

const signJwt = async (subject) => { //id_token
  let date = new Date()
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(subject)
    .setIssuedAt(Math.round((date.setSeconds(date.getSeconds())) / 1000))
    .setIssuer("http://localhost:3000")
    .setAudience("https://example.com/test") //Change to relying party ID
    .setExpirationTime(Math.round((date.setSeconds(date.getSeconds() + 3600)) / 1000))
    .sign(await generateSecret('HS256'))
};

}
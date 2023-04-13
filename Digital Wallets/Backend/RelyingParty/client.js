async function GetParams() {
    const Http = new XMLHttpRequest();
    const url='http://localhost:8080/getparams';
    Http.open("GET", url);
    Http.send(); //Handles sending http request

    Http.onreadystatechange = async (e) => {
    if (Http.readyState==4) { //Stops from executing the code multiple times
     const HttpResponse = JSON.parse(Http.response) //Http response comes in string, we want an object

     window.location.replace(`${HttpResponse.issuer}/oidc/auth?client_id=${HttpResponse.client_id}&redirect_uri=${HttpResponse.redirect_uri}&scope=${HttpResponse.scope}&response_type=${HttpResponse.response_type}&code_challenge_method=${HttpResponse.code_challenge_method}&code_challenge=${HttpResponse.code_challenge}&nonce=${HttpResponse.nonce}`) //im sure there's a better way to do this
    }}
}

function loadevent() { //Checks what credentials exist from RelyingParty
    const Http = new XMLHttpRequest();
    const url='http://localhost:8080/existingcredentials';
    Http.open("GET", url);
    Http.send(); //Handles sending http request

    Http.onreadystatechange = async (e) => {
    if (Http.readyState==4) { //Stops from executing the code multiple times
        const CredentialsArray = Http.response.split('/ ')
        CredentialsArray.forEach(element => {
            let button = document.createElement("button")
            element = element.replace('/', '').trimLeft()
            button.innerHTML = element

            let body = document.getElementsByTagName("body")[0];
            body.appendChild(button);

            button.onclick = function OnClick() {FetchToken(element)}
        })
    }}
}

function FetchToken(CodeName) {
    console.log(CodeName)
    const Http = new XMLHttpRequest();
    const url='http://localhost:8080/fetchtoken';
    Http.open("GET", url);
    Http.send();

    Http.onreadystatechange = async (e) => {
        if (Http.readyState==4) {
            console.log(Http.response)
        }
    }
}
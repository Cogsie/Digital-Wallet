// Nav-Bar
const toggleButton = document.getElementsByClassName('toggle-button')[0]
const navbarLinks = document.getElementsByClassName('navbar-links')[0]

toggleButton.addEventListener('click', () => {
  navbarLinks.classList.toggle('active')
})


// Show form on click of add button

  function showForm() {
    if(document.getElementById("add-btn").click) {
        document.getElementById("cred-form").style.display="block";
        document.getElementById("add-btn").style.display="none";
        document.getElementById("exit-btn").style.display="table-column";
        document.getElementById("sub-btn").style.display="table-column";
        document.getElementById("wallet-p").style.display="none";
        document.getElementById("details-p").style.display="block";
    } else {
        document.getElementById("cred-form").style.display="none";
    }
}


// Exit Form on clik of exit button

function exitForm() {
  if(document.getElementById("exit-btn").click) {
      document.getElementById("cred-form").style.display="none";
      document.getElementById("add-btn").style.display="table-column";
      document.getElementById("details-p").style.display="none";
      document.getElementById("wallet-p").style.display="block";
  } else {
      document.getElementById("cred-form").style.display="none";
  }
}

// Show qr container on click of add button

function showQr() {
  if(document.getElementById("gen-btn").click) {
      document.getElementById("qr-container").style.display="block";
      document.getElementById("gen-btn").style.display="none";
      document.getElementById("wallet-p-qr").style.display="none";
      document.getElementById("show-qr-btn").style.display="none";
     
  }
}

// Exit qr on clik of exit button

function exitQr() {
  if(document.getElementById("qr-exit-btn").click) {
      document.getElementById("qr-container").style.display="none";
      document.getElementById("gen-btn").style.display="table-column";
      document.getElementById("wallet-p-qr").style.display="block";
      document.getElementById("show-qr-btn").style.display="table-column";
  }
}



function showCred() {
  if(document.getElementById("gen-btn").click) {
      document.getElementById("qr-container").style.display="block";
  }
}

// On button click, redirect user to another webpage

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

      if (CredentialsArray[0] == "") {return}
      CredentialsArray.forEach(element => {

        let article = document.createElement("article")
        article.classList.add("wallet-info-2")
        let h1 = document.createElement("h1")
        h1.id = "wallet-qr"
        //h1.innerHTML = "View Credential"

        let button = document.createElement("button")
        button.id = "gen-btn"
        element = element.replace('/', '').trimLeft()
        button.innerHTML = element

        h1.appendChild(button)
        article.appendChild(h1)
        let Pagewrite = document.getElementById("Pagewrite")
        Pagewrite.appendChild(article)
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
          const info = JSON.parse(Http.response)

          console.log(info.id_token)
          window.location.href = "viewcred.html?id_token=" + info.id_token + "&access_token=" + info.access_token;
      }
  }
}

function LoadDetails() {
  const params = new URL(document.location).searchParams

  let CI = document.getElementById("CredentialInfo")
  let QRCode = document.createElement("img")
  QRCode.src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + params.get("access_token")
  CI.appendChild(QRCode)

  const id_token = params.get("id_token")
  const info = JSON.parse(atob(id_token.split('.')[1]));
  console.log(info.sub)

  document.getElementById("StudentID").innerText = info.sub.Profile.StudentID
  document.getElementById("StudentFName").innerText = info.sub.Profile.StudentFName
  document.getElementById("StudentLName").innerText = info.sub.Profile.StudentLName
  document.getElementById("Email").innerText = info.sub.Email
  document.getElementById("Course").innerText = info.sub.Profile.Course
  document.getElementById("Grade").innerText = info.sub.Profile.Grade
}
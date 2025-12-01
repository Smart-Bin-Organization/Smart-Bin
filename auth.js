function signupUser(name,email,pass){
  if(!name || !email || !pass){ alert("All fields required!"); return; }
  if(pass.length<6){ alert("Password must be 6+ chars"); return; }

  const users=JSON.parse(localStorage.getItem("users"))||[];
  if(users.some(u=>u.email===email)){ alert("Email already registered!"); return; }

  users.push({name,email,pass});
  localStorage.setItem("users",JSON.stringify(users));
  alert("Account created!"); window.location.href="index.html";
}

function loginUser(email,pass){
  const users=JSON.parse(localStorage.getItem("users"))||[];
  const match=users.find(u=>u.email===email && u.pass===pass);
  if(match){ localStorage.setItem("loggedInUser",JSON.stringify(match)); window.location.href="dashboard.html"; }
  else alert("Incorrect email/password!");
}

function logoutUser(){
  localStorage.removeItem("loggedInUser"); window.location.href="index.html";
}

function login() {
    let user = localStorage.getItem("user");
    let pass = localStorage.getItem("pass");

    let u = document.getElementById("loginUser").value;
    let p = document.getElementById("loginPass").value;

    if (u === user && p === pass) {
        alert("Login successful!");
        window.location.href = "dashboard.html";
    } else {
        alert("Incorrect login details!");
    }
}

function cancelLogin() {
    document.getElementById("loginUser").value = "";
    document.getElementById("loginPass").value = "";
}

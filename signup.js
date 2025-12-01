function signup() {
    let u = document.getElementById("newUser").value;
    let p = document.getElementById("newPass").value;

    if (u.trim() === "" || p.trim() === "") {
        alert("Fill all fields!");
        return;
    }

    localStorage.setItem("user", u);
    localStorage.setItem("pass", p);

    alert("Account created! Redirecting to login...");
    window.location.href = "index.html";
}

function cancelSignup() {
    document.getElementById("newUser").value = "";
    document.getElementById("newPass").value = "";
}

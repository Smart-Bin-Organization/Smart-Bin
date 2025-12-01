// Load simulated bin data
fetch("data.json")
    .then(res => res.json())
    .then(data => {
        let level = data.bin_fill_level;
        let fill = document.getElementById("fillLevel");
        let status = document.getElementById("statusText");

        fill.style.height = level + "%";

        if (level >= 80) {
            status.textContent = "STATUS: FULL ❌";
            status.style.color = "red";
        } else {
            status.textContent = "STATUS: NOT FULL ✅";
            status.style.color = "green";
        }
    });

// Contact garbage collector
document.getElementById("alertBtn").addEventListener("click", () => {
    alert("📩 Garbage collector contacted successfully!");
});

// Rating stars
let stars = document.getElementById("ratingStars");
let rating = 0;

stars.addEventListener("click", e => {
    let index = [...stars.textContent].indexOf(e.target.textContent) + 1;
    rating = index;
    let newStars = "";

    for (let i = 1; i <= 5; i++) {
        newStars += (i <= rating) ? "★" : "☆";
    }
    stars.textContent = newStars;
});

// Comments
document.getElementById("submitComment").addEventListener("click", () => {
    let comment = document.getElementById("commentBox").value;

    if (comment.trim() === "") return;

    let li = document.createElement("li");
    li.textContent = `⭐ ${rating} – ${comment}`;
    document.getElementById("commentList").appendChild(li);

    document.getElementById("commentBox").value = "";
});

// Logout
function logout() {
    alert("Logged out!");
    window.location.href = "index.html";
}

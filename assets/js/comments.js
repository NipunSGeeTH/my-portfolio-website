import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
    projectId: "nipun-sgeeth"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const usernameInput = document.getElementById("username-input");
const commentInput = document.getElementById("comment-input");
const submitComment = document.getElementById("submit-comment");
const commentsDiv = document.getElementById("comments");
const avatarPreview = document.getElementById("avatar-preview");
const emojiBtn = document.getElementById("emoji-btn");
const emojiPicker = document.getElementById("emoji-picker");

// Update avatar preview as user types their name
usernameInput.addEventListener("input", (e) => {
    const initials = getInitials(e.target.value);
    avatarPreview.textContent = initials || "?";
    avatarPreview.style.transform = "scale(1.1)";
    setTimeout(() => {
        avatarPreview.style.transform = "scale(1)";
    }, 200);
});

// Emoji picker functionality
emojiBtn.addEventListener("click", (e) => {
    const rect = emojiBtn.getBoundingClientRect();
    emojiPicker.style.top = `${rect.bottom + 5}px`;
    emojiPicker.style.left = `${rect.left}px`;
    emojiPicker.classList.toggle("active");
    e.stopPropagation();
});

document.addEventListener("click", () => {
    emojiPicker.classList.remove("active");
});

// Add emoji to comment
document.querySelectorAll(".emoji-list").forEach(list => {
    list.addEventListener("click", (e) => {
        if (e.target.tagName !== "DIV") {
            commentInput.value += e.target.textContent;
            emojiPicker.classList.remove("active");
        }
    });
});

// Submit Comment Animation
submitComment.addEventListener("mouseenter", () => {
    submitComment.querySelector(".button-icon").style.transform = "translateX(5px)";
});

submitComment.addEventListener("mouseleave", () => {
    submitComment.querySelector(".button-icon").style.transform = "translateX(0)";
});

// Submit Comment to Firestore
submitComment.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    const text = commentInput.value.trim();
    
    if (username && text) {
        // Disable button and show loading state
        submitComment.disabled = true;
        submitComment.querySelector(".button-text").textContent = "Posting...";
        
        try {
            await addDoc(collection(db, "comments"), {
                username,
                text,
                timestamp: new Date()
            });
            
            // Clear inputs and reset button
            commentInput.value = "";
            submitComment.querySelector(".button-text").textContent = "Posted!";
            
            // Show success animation
            submitComment.style.background = "#4CAF50";
            setTimeout(() => {
                submitComment.style.background = "#764ba2";
                submitComment.querySelector(".button-text").textContent = "Post Comment";
                submitComment.disabled = false;
            }, 2000);
        } catch (error) {
            console.error("Error posting comment:", error);
            submitComment.querySelector(".button-text").textContent = "Error! Try Again";
            submitComment.style.background = "#f44336";
            setTimeout(() => {
                submitComment.style.background = "#764ba2";
                submitComment.querySelector(".button-text").textContent = "Post Comment";
                submitComment.disabled = false;
            }, 2000);
        }
    }
});

// Format date
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Get user initials for avatar
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Fetch and Display Comments
const q = query(collection(db, "comments"), orderBy("timestamp", "desc"));
onSnapshot(q, (snapshot) => {
    commentsDiv.innerHTML = "";
    snapshot.forEach((doc, index) => {
        const data = doc.data();
        const commentEl = document.createElement("div");
        commentEl.classList.add("comment");
        commentEl.style.animationDelay = `${index * 0.1}s`;
        
        const timestamp = data.timestamp.toDate();
        
        commentEl.innerHTML = `
            <div class="comment-header">
                <div class="comment-avatar">${getInitials(data.username)}</div>
                <div class="comment-info">
                    <div class="username">${data.username}</div>
                    <div class="timestamp">${formatDate(timestamp)}</div>
                </div>
            </div>
            <div class="comment-text">${data.text}</div>
        `;
        
        commentsDiv.appendChild(commentEl);
    });
});










// Capitalize letters when user type comments

document.getElementById("comment-input").addEventListener("input", function () {
    this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1);
});

document.getElementById("username-input").addEventListener("input", function () {
    this.value = this.value
        .toLowerCase() // Convert the whole input to lowercase first
        .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
});


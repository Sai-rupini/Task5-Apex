// script.js

// --- DOM Element Selections ---
const homepageSection = document.getElementById('homepage');
const dashboardSection = document.getElementById('dashboard');
const showLoginBtn = document.getElementById('show-login-btn');
const showRegisterBtn = document.getElementById('show-register-btn');
const loginFormContainer = document.getElementById('login-form-container');
const registerFormContainer = document.getElementById('register-form-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const cancelLoginBtn = document.getElementById('cancel-login-btn');
const cancelRegisterBtn = document.getElementById('cancel-register-btn');
const logoutBtn = document.getElementById('logout-btn');
const loggedInUserDisplay = document.getElementById('logged-in-user-display');
const toastContainer = document.getElementById('toast-container');

// Dashboard Navigation Buttons
const navBrowsePosts = document.getElementById('nav-browse-posts');
const navCreatePost = document.getElementById('nav-create-post');
const navProfile = document.getElementById('nav-profile');
const navNotifications = document.getElementById('nav-notifications');

// Dashboard Content Sections
const browsePostsSection = document.getElementById('browse-posts-section');
const createPostSection = document.getElementById('create-post-section');
const profileSection = document.getElementById('profile-section');
const notificationsSection = document.getElementById('notifications-section');

const postsContainer = document.getElementById('posts-container');
const createPostForm = document.getElementById('create-post-form');
const postTitleInput = document.getElementById('post-title');
const postContentInput = document.getElementById('post-content');
const notificationsList = document.getElementById('notifications-list');
const notificationCountSpan = document.getElementById('notification-count');
const noNotificationsMessage = document.getElementById('no-notifications-message');

// Profile Management Elements
const updateProfileForm = document.getElementById('update-profile-form');
const currentPasswordInput = document.getElementById('current-password');
const newPasswordInput = document.getElementById('new-password');
const confirmNewPasswordInput = document.getElementById('confirm-new-password');


// --- Global State (Simulated Backend Data) ---
// Users now store their own notifications
let users = JSON.parse(localStorage.getItem('blogUsers')) || [];
let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
let loggedInUser = localStorage.getItem('loggedInUser');

// --- Utility Functions ---

/**
 * Displays a toast notification message.
 * @param {string} message - The message to display.
 * @param {'success'|'error'|'info'} type - The type of notification (influences color).
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast p-4 rounded-lg shadow-lg text-white font-medium flex items-center space-x-2`;

    let bgColor = '';
    let iconClass = '';

    switch (type) {
        case 'success':
            bgColor = 'bg-green-500';
            iconClass = 'fas fa-check-circle';
            break;
        case 'error':
            bgColor = 'bg-red-500';
            iconClass = 'fas fa-times-circle';
            break;
        case 'info':
        default:
            bgColor = 'bg-blue-500';
            iconClass = 'fas fa-info-circle';
            break;
    }

    toast.classList.add(bgColor);
    toast.innerHTML = `<i class="${iconClass}"></i><span>${message}</span>`;
    toastContainer.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * Shows a specific section and hides others.
 * @param {HTMLElement} sectionToShow - The section to make visible.
 * @param {HTMLElement} [activeNavButton] - The navigation button corresponding to the active section.
 */
function showSection(sectionToShow, activeNavButton = null) {
    // Hide all dashboard sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.add('hidden');
    });
    // Show the desired section
    sectionToShow.classList.remove('hidden');

    // Remove active class from all nav buttons
    document.querySelectorAll('aside button').forEach(button => {
        button.classList.remove('active-nav-link');
    });
    // Add active class to the clicked nav button
    if (activeNavButton) {
        activeNavButton.classList.add('active-nav-link');
    }
}

/**
 * Updates the notification count display for the logged-in user.
 */
function updateNotificationCount() {
    const currentUser = users.find(user => user.username === loggedInUser);
    if (!currentUser) {
        notificationCountSpan.classList.add('hidden');
        return;
    }

    const unreadNotifications = currentUser.notifications.filter(n => !n.read).length;
    if (unreadNotifications > 0) {
        notificationCountSpan.textContent = unreadNotifications;
        notificationCountSpan.classList.remove('hidden');
    } else {
        notificationCountSpan.classList.add('hidden');
    }
}

/**
 * Renders the list of notifications for the logged-in user.
 */
function renderNotifications() {
    notificationsList.innerHTML = ''; // Clear existing notifications

    const currentUser = users.find(user => user.username === loggedInUser);
    if (!currentUser || currentUser.notifications.length === 0) {
        notificationsList.appendChild(noNotificationsMessage);
        noNotificationsMessage.classList.remove('hidden');
        return;
    } else {
        noNotificationsMessage.classList.add('hidden');
    }

    // Sort notifications by date, newest first
    const sortedNotifications = [...currentUser.notifications].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedNotifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = `p-4 rounded-lg shadow-sm flex items-center space-x-3 ${notification.read ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-800 font-semibold'}`;
        notificationItem.innerHTML = `
            <i class="fas fa-info-circle ${notification.read ? 'text-gray-400' : 'text-blue-500'}"></i>
            <div class="flex-grow">
                <p>${notification.message}</p>
                <span class="text-xs text-gray-500">${new Date(notification.date).toLocaleString()}</span>
            </div>
            ${!notification.read ? `<button class="mark-as-read-btn bg-blue-200 hover:bg-blue-300 text-blue-800 text-sm py-1 px-3 rounded-full" data-id="${notification.id}">Mark as Read</button>` : ''}
        `;
        notificationsList.appendChild(notificationItem);
    });

    // Add event listeners to "Mark as Read" buttons
    document.querySelectorAll('.mark-as-read-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const notificationId = e.target.dataset.id;
            const currentUserIndex = users.findIndex(user => user.username === loggedInUser);
            if (currentUserIndex !== -1) {
                const notificationIndex = users[currentUserIndex].notifications.findIndex(n => n.id === notificationId);
                if (notificationIndex !== -1) {
                    users[currentUserIndex].notifications[notificationIndex].read = true;
                    localStorage.setItem('blogUsers', JSON.stringify(users)); // Save updated users array
                    renderNotifications(); // Re-render to update UI
                    updateNotificationCount(); // Update badge
                }
            }
        });
    });
}

/**
 * Adds a new notification to a specific user.
 * @param {string} targetUsername - The username of the user to notify.
 * @param {string} message - The notification message.
 */
function addNotification(targetUsername, message) {
    const targetUserIndex = users.findIndex(user => user.username === targetUsername);

    if (targetUserIndex !== -1) {
        const newNotification = {
            id: crypto.randomUUID(), // Unique ID for notification
            message: message,
            date: new Date().toISOString(),
            read: false
        };
        users[targetUserIndex].notifications.unshift(newNotification); // Add to the beginning
        localStorage.setItem('blogUsers', JSON.stringify(users)); // Save updated users array

        // Only show toast and update count if the notification is for the currently logged-in user
        if (targetUsername === loggedInUser) {
            updateNotificationCount();
            if (notificationsSection.classList.contains('hidden')) {
                showToast('New Notification!', 'info');
            }
        }
    }
}

// --- Authentication Functions ---

/**
 * Handles user registration.
 * @param {Event} e - The form submission event.
 */
function handleRegister(e) {
    e.preventDefault();
    const username = e.target['register-username'].value.trim();
    const password = e.target['register-password'].value.trim();

    if (!username || !password) {
        showToast('Please enter both username and password.', 'error');
        return;
    }

    if (users.some(user => user.username === username)) {
        showToast('Username already exists. Please choose another.', 'error');
        return;
    }

    const newUser = { username, password, notifications: [] }; // Initialize notifications array for new user
    users.push(newUser);
    localStorage.setItem('blogUsers', JSON.stringify(users));
    showToast('Registration successful! You can now log in.', 'success');
    e.target.reset(); // Clear form
    loginFormContainer.classList.remove('hidden'); // Show login form
    registerFormContainer.classList.add('hidden'); // Hide register form
}

/**
 * Handles user login.
 * @param {Event} e - The form submission event.
 */
function handleLogin(e) {
    e.preventDefault();
    const username = e.target['login-username'].value.trim();
    const password = e.target['login-password'].value.trim();

    if (!username || !password) {
        showToast('Please enter both username and password.', 'error');
        return;
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        loggedInUser = user.username;
        localStorage.setItem('loggedInUser', loggedInUser);
        showToast(`Welcome back, ${loggedInUser}!`, 'success');
        initApp(); // Re-initialize app to show dashboard
    } else {
        showToast('Invalid username or password.', 'error');
    }
}

/**
 * Handles user logout.
 */
function handleLogout() {
    loggedInUser = null;
    localStorage.removeItem('loggedInUser');
    showToast('You have been logged out.', 'info');
    initApp(); // Re-initialize app to show homepage
}

// --- Post Management Functions ---

/**
 * Renders all posts to the UI.
 */
function renderPosts() {
    postsContainer.innerHTML = ''; // Clear existing posts

    if (posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="col-span-full text-center py-10 text-gray-500 text-lg">
                No posts yet. Be the first to create one!
            </div>
        `;
        return;
    }

    // Sort posts by date, newest first
    const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedPosts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'post-card bg-white rounded-xl shadow-md p-6 flex flex-col justify-between';
        postCard.innerHTML = `
            <div>
                <h3 class="text-2xl font-bold text-indigo-700 mb-2">${post.title}</h3>
                <p class="text-gray-600 text-sm mb-4">By <span class="font-semibold text-indigo-500">${post.author}</span> on ${new Date(post.date).toLocaleDateString()}</p>
                <p class="text-gray-700 leading-relaxed mb-4 line-clamp-4">${post.content}</p>
            </div>
            <div class="flex items-center justify-between mt-4">
                <div class="flex items-center space-x-4">
                    <button class="like-btn text-gray-500 hover:text-red-500 transition-colors duration-200" data-id="${post.id}">
                        <i class="fas fa-heart ${post.likes.includes(loggedInUser) ? 'text-red-500' : ''}"></i>
                        <span class="ml-1">${post.likes.length}</span>
                    </button>
                    <button class="comment-btn text-gray-500 hover:text-blue-500 transition-colors duration-200" data-id="${post.id}">
                        <i class="fas fa-comment"></i>
                        <span class="ml-1">${post.comments.length}</span>
                    </button>
                </div>
                ${post.author === loggedInUser ? `
                    <button class="delete-post-btn bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded-full" data-id="${post.id}">
                        Delete
                    </button>
                ` : ''}
            </div>
            <div class="comments-section mt-4 border-t border-gray-200 pt-4 hidden">
                <h4 class="text-lg font-semibold text-gray-700 mb-3">Comments:</h4>
                <div class="comments-list space-y-3">
                    ${post.comments.map(comment => `
                        <div class="bg-gray-50 p-3 rounded-lg text-sm">
                            <p class="font-medium text-gray-800">${comment.author}:</p>
                            <p class="text-gray-700">${comment.text}</p>
                            <span class="text-xs text-gray-500">${new Date(comment.date).toLocaleString()}</span>
                        </div>
                    `).join('')}
                </div>
                <form class="add-comment-form mt-4" data-id="${post.id}">
                    <input type="text" placeholder="Add a comment..." class="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-400">
                    <button type="submit" class="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded-md">Comment</button>
                </form>
            </div>
        `;
        postsContainer.appendChild(postCard);
    });

    // Add event listeners for like, comment, and delete buttons
    document.querySelectorAll('.like-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const postId = e.currentTarget.dataset.id;
            const postIndex = posts.findIndex(p => p.id === postId);
            if (postIndex !== -1) {
                const post = posts[postIndex];
                if (post.likes.includes(loggedInUser)) {
                    // Unlike
                    post.likes = post.likes.filter(user => user !== loggedInUser);
                    showToast('Post unliked.', 'info');
                } else {
                    // Like
                    post.likes.push(loggedInUser);
                    showToast('Post liked!', 'success');
                    // Send notification to post author if not self-liking
                    if (post.author !== loggedInUser) {
                        addNotification(post.author, `${loggedInUser} liked your post: "${post.title.substring(0, 20)}..."`);
                    }
                }
                localStorage.setItem('blogPosts', JSON.stringify(posts));
                renderPosts(); // Re-render to update like count and icon
            }
        });
    });

    document.querySelectorAll('.comment-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const commentsSection = e.currentTarget.closest('.post-card').querySelector('.comments-section');
            commentsSection.classList.toggle('hidden'); // Toggle visibility of comments
        });
    });

    document.querySelectorAll('.add-comment-form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const postId = e.target.dataset.id;
            const commentInput = e.target.querySelector('input');
            const commentText = commentInput.value.trim();

            if (commentText) {
                const postIndex = posts.findIndex(p => p.id === postId);
                if (postIndex !== -1) {
                    const post = posts[postIndex];
                    post.comments.push({
                        author: loggedInUser,
                        text: commentText,
                        date: new Date().toISOString()
                    });
                    localStorage.setItem('blogPosts', JSON.stringify(posts));
                    showToast('Comment added!', 'success');
                    commentInput.value = ''; // Clear input
                    renderPosts(); // Re-render to show new comment
                    // Send notification to post author if not self-commenting
                    if (post.author !== loggedInUser) {
                        addNotification(post.author, `${loggedInUser} commented on your post: "${post.title.substring(0, 20)}..."`);
                    }
                }
            } else {
                showToast('Comment cannot be empty.', 'error');
            }
        });
    });

    document.querySelectorAll('.delete-post-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const postId = e.currentTarget.dataset.id;
            // Using a simple confirm for demonstration; in a real app, use a custom modal
            if (confirm('Are you sure you want to delete this post?')) {
                posts = posts.filter(post => post.id !== postId);
                localStorage.setItem('blogPosts', JSON.stringify(posts));
                showToast('Post deleted successfully!', 'success');
                renderPosts(); // Re-render to remove the deleted post
            }
        });
    });
}

/**
 * Handles creation of a new post.
 * @param {Event} e - The form submission event.
 */
function handleCreatePost(e) {
    e.preventDefault();
    const title = postTitleInput.value.trim();
    const content = postContentInput.value.trim();

    if (!title || !content) {
        showToast('Please fill in both title and content for your post.', 'error');
        return;
    }

    const newPost = {
        id: crypto.randomUUID(), // Generate a unique ID for the post
        title: title,
        content: content,
        author: loggedInUser,
        date: new Date().toISOString(),
        likes: [],
        comments: []
    };

    posts.push(newPost);
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    showToast('Post published successfully!', 'success');
    e.target.reset(); // Clear form
    renderPosts(); // Re-render posts to show the new one
    showSection(browsePostsSection, navBrowsePosts); // Navigate to browse posts
}

/**
 * Handles updating the user's profile (password change).
 * @param {Event} e - The form submission event.
 */
function handleUpdateProfile(e) {
    e.preventDefault();
    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmNewPassword = confirmNewPasswordInput.value.trim();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        showToast('Please fill in all password fields.', 'error');
        return;
    }

    if (newPassword !== confirmNewPassword) {
        showToast('New password and confirm password do not match.', 'error');
        return;
    }

    if (newPassword.length < 3) { // Simple password strength check
        showToast('New password must be at least 3 characters long.', 'error');
        return;
    }

    const currentUserIndex = users.findIndex(user => user.username === loggedInUser);

    if (currentUserIndex === -1) {
        showToast('User not found. Please log in again.', 'error');
        handleLogout(); // Force logout if user somehow not found
        return;
    }

    const currentUser = users[currentUserIndex];

    if (currentUser.password !== currentPassword) {
        showToast('Incorrect current password.', 'error');
        return;
    }

    // Update password
    currentUser.password = newPassword;
    localStorage.setItem('blogUsers', JSON.stringify(users));
    showToast('Password updated successfully!', 'success');
    e.target.reset(); // Clear form
}


// --- Initial App Load & Event Listeners ---

/**
 * Initializes the application state based on login status.
 */
function initApp() {
    // Ensure all users have a notifications array for backward compatibility
    users = users.map(user => ({
        ...user,
        notifications: user.notifications || []
    }));
    localStorage.setItem('blogUsers', JSON.stringify(users)); // Save updated structure

    if (loggedInUser) {
        homepageSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        loggedInUserDisplay.textContent = `Logged in as: ${loggedInUser}`;
        renderPosts(); // Load posts when logged in
        updateNotificationCount(); // Update notification badge
        renderNotifications(); // Render notifications initially
        showSection(browsePostsSection, navBrowsePosts); // Default to browse posts
    } else {
        homepageSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
        loginFormContainer.classList.add('hidden');
        registerFormContainer.classList.add('hidden');
    }
}

// Homepage Button Event Listeners
showLoginBtn.addEventListener('click', () => {
    loginFormContainer.classList.remove('hidden');
    registerFormContainer.classList.add('hidden');
});

showRegisterBtn.addEventListener('click', () => {
    registerFormContainer.classList.remove('hidden');
    loginFormContainer.classList.add('hidden');
});

cancelLoginBtn.addEventListener('click', () => {
    loginFormContainer.classList.add('hidden');
});

cancelRegisterBtn.addEventListener('click', () => {
    registerFormContainer.classList.add('hidden');
});

// Authentication Form Event Listeners
registerForm.addEventListener('submit', handleRegister);
loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);

// Dashboard Navigation Event Listeners
navBrowsePosts.addEventListener('click', () => showSection(browsePostsSection, navBrowsePosts));
navCreatePost.addEventListener('click', () => showSection(createPostSection, navCreatePost));
navProfile.addEventListener('click', () => {
    showSection(profileSection, navProfile);
    updateProfileForm.reset(); // Clear form fields when navigating to profile
});
navNotifications.addEventListener('click', () => {
    showSection(notificationsSection, navNotifications);
    renderNotifications(); // Re-render notifications to ensure they are up-to-date and mark as read buttons are active
});

// Create Post Form Event Listener
createPostForm.addEventListener('submit', handleCreatePost);

// Profile Update Form Event Listener
updateProfileForm.addEventListener('submit', handleUpdateProfile);


// --- Run on page load ---
document.addEventListener('DOMContentLoaded', initApp);

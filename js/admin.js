// Admin initialization
function initializeAdmin() {
    // Check if the user is logged in
    const currentUserData = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUserData) {
        document.getElementById('admin-content').style.display = 'none';
        document.getElementById('admin-error').style.display = 'block';
        return;
    }
    
    // Check if user is an admin
    if (currentUserData.isAdmin) {
        // Show admin content
        document.getElementById('admin-content').style.display = 'block';
        document.getElementById('admin-error').style.display = 'none';
        
        // Load admin data
        loadVideosForAdmin();
        loadUsersForAdmin();
        setupEventListeners();
    } else {
        // Not an admin
        document.getElementById('admin-content').style.display = 'none';
        document.getElementById('admin-error').style.display = 'block';
    }
}

// Extract YouTube video ID from URL
function extractYouTubeId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

// Get YouTube thumbnail URL from video ID
function getYouTubeThumbnail(videoId) {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

// Load videos for admin
function loadVideosForAdmin() {
    const videosList = document.getElementById('videos-list-admin');
    videosList.innerHTML = '<p>Loading videos...</p>';
    
    const videos = getAllVideos();
    
    if (Object.keys(videos).length === 0) {
        videosList.innerHTML = '<p>No videos available. Add your first video!</p>';
        return;
    }
    
    // Clear the list
    videosList.innerHTML = '';
    
    // Create table for videos
    const table = document.createElement('table');
    table.className = 'admin-videos-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Title</th>
                <th>Category</th>
                <th>YouTube</th>
                <th>Access</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    // Add each video
    Object.entries(videos).forEach(([videoId, video]) => {
        const tr = document.createElement('tr');
        
        // Get access count
        const accessList = getVideoAccessList(videoId);
        const accessCount = accessList.length;
        
        tr.innerHTML = `
            <td>${video.title}</td>
            <td>${video.category || 'Uncategorized'}</td>
            <td>
                <a href="${video.youtubeUrl}" target="_blank" rel="noopener noreferrer">
                    <img src="${video.thumbnail || getYouTubeThumbnail(video.youtubeId)}" 
                         alt="${video.title}" width="120" class="video-thumbnail">
                </a>
            </td>
            <td>${accessCount} user${accessCount !== 1 ? 's' : ''}</td>
            <td>
                <button class="btn manage-access-btn" data-video-id="${videoId}">Manage Access</button>
                <button class="btn edit-video-btn" data-video-id="${videoId}">Edit</button>
                <button class="btn delete-video-btn" data-video-id="${videoId}">Delete</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    videosList.appendChild(table);
    
    // Add event listeners to video buttons
    addVideoButtonListeners();
}

// Add event listeners to video buttons
function addVideoButtonListeners() {
    // Manage Access buttons
    document.querySelectorAll('.manage-access-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const videoId = e.target.getAttribute('data-video-id');
            openManageAccessModal(videoId);
        });
    });
    
    // Edit Video buttons
    document.querySelectorAll('.edit-video-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const videoId = e.target.getAttribute('data-video-id');
            openEditVideoModal(videoId);
        });
    });
    
    // Delete Video buttons
    document.querySelectorAll('.delete-video-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const videoId = e.target.getAttribute('data-video-id');
            deleteVideoWithConfirmation(videoId);
        });
    });
}

// Open the manage access modal
function openManageAccessModal(videoId) {
    const modal = document.getElementById('manage-access-modal');
    const video = getVideo(videoId);
    
    if (!video) {
        alert("Video not found!");
        return;
    }
    
    // Set video info
    document.getElementById('access-video-title').textContent = video.title;
    document.getElementById('access-video-description').textContent = video.description;
    document.getElementById('current-video-id').value = videoId;
    
    // Load access list
    loadAccessList(videoId);
    
    // Show the modal
    modal.style.display = 'block';
}

// Load access list for a video
function loadAccessList(videoId) {
    const userList = document.getElementById('user-access-list');
    userList.innerHTML = '';
    
    const accessList = getVideoAccessList(videoId);
    
    if (accessList.length === 0) {
        userList.innerHTML = '<li>No users have access yet.</li>';
        return;
    }
    
    accessList.forEach(email => {
        const li = document.createElement('li');
        li.className = 'user-access-item';
        li.innerHTML = `
            <span class="user-email">${email}</span>
            <button class="btn remove-access-btn" data-email="${email}">Remove</button>
        `;
        userList.appendChild(li);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-access-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const email = e.target.getAttribute('data-email');
            const videoId = document.getElementById('current-video-id').value;
            
            if (revokeVideoAccess(videoId, email)) {
                // Reload access list
                loadAccessList(videoId);
            }
        });
    });
}

// Open the edit video modal
function openEditVideoModal(videoId) {
    const modal = document.getElementById('edit-video-modal');
    const video = getVideo(videoId);
    
    if (!video) {
        alert("Video not found!");
        return;
    }
    
    // Set form values
    document.getElementById('edit-video-id').value = videoId;
    document.getElementById('edit-video-title').value = video.title;
    document.getElementById('edit-video-description').value = video.description;
    document.getElementById('edit-youtube-url').value = video.youtubeUrl;
    document.getElementById('edit-video-thumbnail').value = video.thumbnail || '';
    document.getElementById('edit-video-category').value = video.category || '';
    
    // Show the modal
    modal.style.display = 'block';
}

// Delete video with confirmation
function deleteVideoWithConfirmation(videoId) {
    const video = getVideo(videoId);
    
    if (!video) {
        alert("Video not found!");
        return;
    }
    
    if (confirm(`Are you sure you want to delete the video "${video.title}"? This cannot be undone.`)) {
        if (deleteVideo(videoId)) {
            alert("Video deleted successfully!");
            loadVideosForAdmin();
        } else {
            alert("Error deleting video. Please try again.");
        }
    }
}

// Load users for admin
function loadUsersForAdmin() {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '<p>Loading users...</p>';
    
    const allUsers = getAllUsers();
    
    if (Object.keys(allUsers).length === 0) {
        usersList.innerHTML = '<p>No users registered yet.</p>';
        return;
    }
    
    // Clear the list
    usersList.innerHTML = '';
    
    // Create table for users
    const table = document.createElement('table');
    table.className = 'admin-users-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Last Login</th>
                <th>Role</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    // Add each user
    Object.entries(allUsers).forEach(([email, userData]) => {
        const tr = document.createElement('tr');
        
        // Format last login date
        let lastLoginDisplay = 'Never';
        if (userData.lastLogin) {
            const lastLogin = new Date(userData.lastLogin);
            lastLoginDisplay = lastLogin.toLocaleString();
        }
        
        tr.innerHTML = `
            <td>${userData.name || 'Unknown'}</td>
            <td>${email}</td>
            <td>${lastLoginDisplay}</td>
            <td>${userData.isAdmin ? 'Admin' : 'User'}</td>
        `;
        
        tbody.appendChild(tr);
    });
    
    usersList.appendChild(table);
}

// Setup all event listeners
function setupEventListeners() {
    // Add Video button
    document.getElementById('add-video-btn').addEventListener('click', () => {
        document.getElementById('add-video-modal').style.display = 'block';
    });
    
    // Close buttons for modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Add Video form submission
    document.getElementById('add-video-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('video-title').value;
        const description = document.getElementById('video-description').value;
        const youtubeUrl = document.getElementById('youtube-url').value;
        const thumbnail = document.getElementById('video-thumbnail').value;
        const category = document.getElementById('video-category').value;
        
        // Extract YouTube ID
        const youtubeId = extractYouTubeId(youtubeUrl);
        
        if (!youtubeId) {
            alert("Invalid YouTube URL. Please enter a valid YouTube video URL.");
            return;
        }
        
        // Add video to storage
        const videoData = {
            title,
            description,
            youtubeUrl,
            youtubeId,
            thumbnail: thumbnail || getYouTubeThumbnail(youtubeId),
            category,
            createdAt: new Date().toISOString()
        };
        
        const videoId = saveVideo(videoData);
        
        // Close modal and reset form
        document.getElementById('add-video-modal').style.display = 'none';
        document.getElementById('add-video-form').reset();
        alert("Video added successfully!");
        
        // Refresh videos list
        loadVideosForAdmin();
    });
    
    // Edit Video form submission
    document.getElementById('edit-video-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const videoId = document.getElementById('edit-video-id').value;
        const title = document.getElementById('edit-video-title').value;
        const description = document.getElementById('edit-video-description').value;
        const youtubeUrl = document.getElementById('edit-youtube-url').value;
        const thumbnail = document.getElementById('edit-video-thumbnail').value;
        const category = document.getElementById('edit-video-category').value;
        
        // Extract YouTube ID
        const youtubeId = extractYouTubeId(youtubeUrl);
        
        if (!youtubeId) {
            alert("Invalid YouTube URL. Please enter a valid YouTube video URL.");
            return;
        }
        
        // Update video in storage
        const videoData = {
            id: videoId,
            title,
            description,
            youtubeUrl,
            youtubeId,
            thumbnail: thumbnail || getYouTubeThumbnail(youtubeId),
            category,
            updatedAt: new Date().toISOString()
        };
        
        saveVideo(videoData);
        
        // Close modal
        document.getElementById('edit-video-modal').style.display = 'none';
        alert("Video updated successfully!");
        
        // Refresh videos list
        loadVideosForAdmin();
    });
    
    // Add User Access button
    document.getElementById('add-user-access-btn').addEventListener('click', () => {
        const email = document.getElementById('new-user-email').value.trim();
        const videoId = document.getElementById('current-video-id').value;
        
        if (!email) {
            alert("Please enter a valid email address.");
            return;
        }
        
        if (grantVideoAccess(videoId, email)) {
            document.getElementById('new-user-email').value = '';
            alert(`Access granted to ${email}`);
            
            // Reload access list
            loadAccessList(videoId);
        } else {
            alert("User already has access to this video.");
        }
    });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check login status and admin rights
    initializeAdmin();
});
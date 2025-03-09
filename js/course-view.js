// YouTube player instance
let player;

// Course data
let currentCourse = null;
let currentVideoId = null;
let courseModules = [];

// Get the course ID from the URL
function getCourseId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load course data
function loadCourseData() {
    const courseId = getCourseId();
    
    if (!courseId) {
        window.location.href = 'courses.html';
        return;
    }
    
    // Get course data from Firestore
    db.collection('courses').doc(courseId).get().then((doc) => {
        if (!doc.exists) {
            console.error("Course not found");
            window.location.href = 'courses.html';
            return;
        }
        
        currentCourse = doc.data();
        currentCourse.id = doc.id;
        
        // Check if user has access to this course
        checkCourseAccess(courseId);
    }).catch(error => {
        console.error("Error loading course:", error);
    });
}

// Check if the user has access to the course
function checkCourseAccess(courseId) {
    // If not authenticated, show access error
    if (!firebase.auth().currentUser) {
        document.getElementById('course-access-error').style.display = 'block';
        document.getElementById('course-content').style.display = 'none';
        
        // Show purchase options
        document.getElementById('purchase-options').innerHTML = `
            <p>Please log in to purchase this course.</p>
        `;
        return;
    }
    
    // Check user's course access
    const userId = firebase.auth().currentUser.uid;
    
    db.collection('users').doc(userId).get().then((doc) => {
        if (doc.exists) {
            const userData = doc.data();
            const userCourses = userData.courses || [];
            
            // If user has access to the course
            if (userCourses.includes(courseId)) {
                // Display course content
                displayCourseContent();
                
                // Load course modules
                loadCourseModules();
            } else {
                // Show access error and purchase option
                document.getElementById('course-access-error').style.display = 'block';
                document.getElementById('course-content').style.display = 'none';
                
                // Show purchase options
                document.getElementById('purchase-options').innerHTML = `
                    <p>Price: $${currentCourse.price}</p>
                    <button id="purchase-btn" class="btn">Purchase Course</button>
                `;
                
                // Add purchase button event listener
                document.getElementById('purchase-btn').addEventListener('click', () => {
                    purchaseCourse(courseId);
                });
            }
        }
    }).catch(error => {
        console.error("Error checking course access:", error);
    });
}

// Display course content
function displayCourseContent() {
    document.getElementById('course-access-error').style.display = 'none';
    document.getElementById('course-content').style.display = 'block';
    
    // Set course title and description
    document.getElementById('course-title').textContent = currentCourse.title;
    document.getElementById('course-description').textContent = currentCourse.description;
}

// Load course modules (videos)
function loadCourseModules() {
    db.collection('courses').doc(currentCourse.id)
      .collection('modules').orderBy('order').get().then((snapshot) => {
        if (snapshot.empty) {
            document.getElementById('module-list').innerHTML = '<p>No content available for this course yet.</p>';
            return;
        }
        
        courseModules = [];
        snapshot.forEach(doc => {
            const module = doc.data();
            module.id = doc.id;
            courseModules.push(module);
        });
        
        // Display modules list
        displayModules();
        
        // Load the first video
        if (courseModules.length > 0) {
            loadVideo(courseModules[0].youtubeId);
            currentVideoId = courseModules[0].id;
        }
    }).catch(error => {
        console.error("Error loading modules:", error);
    });
}

// Display modules list
function displayModules() {
    const moduleList = document.getElementById('module-list');
    moduleList.innerHTML = '';
    
    courseModules.forEach((module, index) => {
        const li = document.createElement('li');
        li.className = 'module-item';
        li.innerHTML = `
            <div class="module-title">${module.title}</div>
            <button class="btn play-btn" data-youtube-id="${module.youtubeId}" data-module-id="${module.id}">Play</button>
        `;
        moduleList.appendChild(li);
        
        // Add event listener
        const playBtn = li.querySelector('.play-btn');
        playBtn.addEventListener('click', () => {
            loadVideo(module.youtubeId);
            currentVideoId = module.id;
            
            // Update active module styling
            updateActiveModule(module.id);
        });
    });
}

// Update active module styling
function updateActiveModule(moduleId) {
    const moduleItems = document.querySelectorAll('.module-item');
    moduleItems.forEach(item => {
        const playBtn = item.querySelector('.play-btn');
        const itemModuleId = playBtn.getAttribute('data-module-id');
        
        if (itemModuleId === moduleId) {
            item.querySelector('.module-title').classList.add('active-module');
        } else {
            item.querySelector('.module-title').classList.remove('active-module');
        }
    });
}

// Initialize YouTube player
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: '', // Will be set later
        playerVars: {
            'playsinline': 1,
            'rel': 0,
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

// YouTube player ready event
function onPlayerReady(event) {
    // Player is ready, load the course data
    loadCourseData();
}

// Load a YouTube video
function loadVideo(youtubeId) {
    if (player && player.loadVideoById) {
        player.loadVideoById(youtubeId);
    }
}

// Purchase course (simulated)
function purchaseCourse(courseId) {
    // In a real application, you would integrate with a payment processor here
    // For this demo, we'll simulate a successful purchase
    
    const userId = firebase.auth().currentUser.uid;
    
    // Add the course to the user's purchased courses
    db.collection('users').doc(userId).update({
        courses: firebase.firestore.FieldValue.arrayUnion(courseId)
    }).then(() => {
        // Show success message
        alert('Course purchased successfully!');
        
        // Refresh the page to show course content
        location.reload();
    }).catch(error => {
        console.error("Error purchasing course:", error);
        alert('Error purchasing course. Please try again.');
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // YouTube API will call onYouTubeIframeAPIReady when loaded
    // The function will then initialize the player and load course data
});
// General app functions

// Function to detect DevTools (console) opening
function detectDevTools() {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    
    if (widthThreshold || heightThreshold) {
        // DevTools is likely open
        alert("Developer tools detected. This is not allowed for security reasons.");
        
        // Redirect or take other actions as needed
        window.location.href = 'index.html';
    }
}

// Add DevTools detection
setInterval(detectDevTools, 1000);

// Add additional security measures
document.addEventListener('DOMContentLoaded', function() {
    // Disable drag and drop
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable cut/copy
    document.addEventListener('cut', function(e) {
        e.preventDefault();
        return false;
    });
    
    document.addEventListener('copy', function(e) {
        // Allow copy in specific elements like textareas or inputs
        if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            return false;
        }
    });
});
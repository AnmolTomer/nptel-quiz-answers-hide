document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleBtn');
    const status = document.getElementById('status');
    const container = document.querySelector('.container');
    
    // Check if we're on an assessment page
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const url = tabs[0].url;
        const urlParams = new URLSearchParams(new URL(url).search);
        
        if (!url.includes('onlinecourses.nptel.ac.in') || !urlParams.has('assessment')) {
            container.classList.add('inactive');
            status.textContent = 'Not on NPTEL quiz page';
            toggleBtn.disabled = true;
            return;
        }
        
        // Get current state
        chrome.tabs.sendMessage(tabs[0].id, {action: 'getState'}, (response) => {
            if (chrome.runtime.lastError) {
                console.warn('Error getting state:', chrome.runtime.lastError);
                status.textContent = 'Extension not loaded';
                return;
            }
            if (response && !response.error) {
                updateUI(response.hidden);
            } else {
                status.textContent = 'Extension not active';
            }
        });
    });
    
    toggleBtn.addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleAnswers'}, (response) => {
                if (chrome.runtime.lastError) {
                    console.warn('Error toggling answers:', chrome.runtime.lastError);
                    status.textContent = 'Failed to toggle';
                    return;
                }
                if (response && !response.error) {
                    updateUI(response.hidden);
                } else {
                    status.textContent = 'Toggle failed';
                }
            });
        });
    });
    
    function updateUI(hidden) {
        if (hidden) {
            toggleBtn.textContent = '👁️ Show Answers';
            status.textContent = 'Answers hidden';
            toggleBtn.style.backgroundColor = '#4CAF50';
        } else {
            toggleBtn.textContent = '🙈 Hide Answers';
            status.textContent = 'Answers visible';
            toggleBtn.style.backgroundColor = '#f44336';
        }
    }
});
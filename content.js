(function() {
    'use strict';
    
    // Check if this is an assessment page
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('assessment')) {
        return;
    }
    
    let isHidden = false;
    let toggleButton;
    
    function toggleFeedback() {
        // Multiple selectors for better coverage
        const selectors = [
            '.qt-feedback',
            '.feedback',
            '.answer-feedback',
            '.quiz-feedback',
            '[class*="feedback"]',
            '.correct-answer',
            '.wrong-answer',
            '.quiz-result'
        ];
        
        let elementsFound = 0;
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.display = isHidden ? 'none' : 'block';
                elementsFound++;
            });
        });
        
        if (toggleButton) {
            toggleButton.textContent = isHidden ? '👁️ Show Answers' : '🙈 Hide Answers';
            toggleButton.style.backgroundColor = isHidden ? '#4CAF50' : '#f44336';
        }
        
        // Store state
        try {
            chrome.storage.local.set({answersHidden: isHidden});
        } catch (error) {
            console.warn('Failed to save state:', error);
        }
        
        console.log(`Toggled ${elementsFound} feedback elements`);
    }
    
    function createToggleButton() {
        toggleButton = document.createElement('button');
        toggleButton.textContent = '🙈 Hide Answers';
        toggleButton.id = 'nptel-answer-toggle';
        toggleButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            background-color: #f44336;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;
        
        toggleButton.addEventListener('click', () => {
            isHidden = !isHidden;
            toggleFeedback();
        });
        
        toggleButton.addEventListener('mouseenter', () => {
            toggleButton.style.transform = 'scale(1.05)';
            toggleButton.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
        });
        
        toggleButton.addEventListener('mouseleave', () => {
            toggleButton.style.transform = 'scale(1)';
            toggleButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        });
        
        document.body.appendChild(toggleButton);
    }
    
    function init() {
        // Check if button already exists
        if (document.getElementById('nptel-answer-toggle')) {
            return;
        }
        
        createToggleButton();
        
        // Get stored state
        try {
            chrome.storage.local.get(['answersHidden'], (result) => {
                if (chrome.runtime.lastError) {
                    console.warn('Failed to get stored state:', chrome.runtime.lastError);
                    isHidden = false;
                } else {
                    isHidden = result.answersHidden || false;
                }
                toggleFeedback();
            });
        } catch (error) {
            console.warn('Storage API not available:', error);
            isHidden = false;
            toggleFeedback();
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        try {
            if (request.action === 'toggleAnswers') {
                isHidden = !isHidden;
                toggleFeedback();
                sendResponse({hidden: isHidden});
            } else if (request.action === 'getState') {
                sendResponse({hidden: isHidden});
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({error: error.message});
        }
        return true; // Indicate that the response is sent asynchronously
    });
})();
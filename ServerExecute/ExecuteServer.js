console.log('Server Client Loaded');

let stats = {
    requests: 0,
    errors: 0,
    memoryUsage: 0,
    activeBlocks: 0,
    poolCapacity: 0
};

const elements = {
    memoryUsage: document.getElementById('memory-usage'),
    activeBlocks: document.getElementById('active-blocks'),
    poolCapacity: document.getElementById('pool-capacity'),
    requestCount: document.getElementById('request-count'),
    errorCount: document.getElementById('error-count'),
    lastCheck: document.getElementById('last-check'),
    reloadStatus: document.getElementById('reload-status'),
    resultsContent: document.getElementById('results-content'),
    demoBox: document.getElementById('demo-box')
};

// Utility functions
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function logResult(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}\n`;
    elements.resultsContent.textContent += logEntry;
    elements.resultsContent.scrollTop = elements.resultsContent.scrollHeight;
    
    console.log(`%c${logEntry}`, `color: ${type === 'error' ? 'red' : type === 'success' ? 'green' : 'blue'}`);
}

async function fetchMemoryStats() {
    try {
        const startTime = performance.now();
        const response = await fetch('/memory-stats');
        const data = await response.json();
        const endTime = performance.now();
        
        stats.memoryUsage = data.total_allocated;
        stats.activeBlocks = data.active_blocks;
        stats.poolCapacity = data.pool_capacity;
        
        updateStatsDisplay();
        logResult(`Memory stats fetched in ${(endTime - startTime).toFixed(2)}ms`, 'success');
        
        return data;
    } catch (error) {
        stats.errors++;
        updateStatsDisplay();
        logResult(`Failed to fetch memory stats: ${error.message}`, 'error');
        return null;
    }
}

async function fetchReloadStatus() {
    try {
        const startTime = performance.now();
        const response = await fetch('/reload');
        const data = await response.json();
        const endTime = performance.now();
        
        stats.requests++;
        elements.lastCheck.textContent = `${(endTime - startTime).toFixed(2)}ms`;
        
        if (data.memory_usage) {
            stats.memoryUsage = data.memory_usage;
        }
        
        updateStatsDisplay();
        return data;
    } catch (error) {
        stats.errors++;
        updateStatsDisplay();
        logResult(`Reload check failed: ${error.message}`, 'error');
        return null;
    }
}

function updateStatsDisplay() {
    if (elements.memoryUsage) {
        elements.memoryUsage.textContent = formatBytes(stats.memoryUsage);
    }
    if (elements.activeBlocks) {
        elements.activeBlocks.textContent = stats.activeBlocks.toString();
    }
    if (elements.poolCapacity) {
        elements.poolCapacity.textContent = stats.poolCapacity.toString();
    }
    if (elements.requestCount) {
        elements.requestCount.textContent = stats.requests.toString();
    }
    if (elements.errorCount) {
        elements.errorCount.textContent = stats.errors.toString();
    }
}

async function testMemoryStats() {
    logResult('Testing memory statistics...', 'info');
    elements.memoryUsage.innerHTML = '<div class="loading"></div>';
    
    const data = await fetchMemoryStats();
    if (data) {
        logResult(`Memory: ${formatBytes(data.total_allocated)}, Blocks: ${data.active_blocks}, Capacity: ${data.pool_capacity}`, 'success');
    }
}

async function testReload() {
    logResult('Testing reload endpoint...', 'info');
    const data = await fetchReloadStatus();
    if (data) {
        logResult(`Reload status: ${data.reload}, Timestamp: ${data.timestamp}`, 'success');
    }
}

async function stressTest() {
    logResult('Starting stress test (10 concurrent requests)...', 'info');
    const startTime = performance.now();
    
    const promises = [];
    for (let i = 0; i < 10; i++) {
        promises.push(fetchReloadStatus());
    }
    
    try {
        const results = await Promise.all(promises);
        const endTime = performance.now();
        const successCount = results.filter(r => r !== null).length;
        
        logResult(`Stress test completed: ${successCount}/10 successful in ${(endTime - startTime).toFixed(2)}ms`, 'success');
    } catch (error) {
        logResult(`Stress test failed: ${error.message}`, 'error');
    }
}

function clearStats() {
    stats.requests = 0;
    stats.errors = 0;
    elements.resultsContent.textContent = 'Stats cleared. Ready for testing...\n';
    updateStatsDisplay();
    logResult('Statistics cleared', 'info');
}

// Demo box animations
function animateDemoBox() {
    const colors = [
        'linear-gradient(45deg, #ff6b6b, #feca57)',
        'linear-gradient(45deg, #4ecdc4, #44a08d)',
        'linear-gradient(45deg, #667eea, #764ba2)',
        'linear-gradient(45deg, #f093fb, #f5576c)',
        'linear-gradient(45deg, #4facfe, #00f2fe)'
    ];
    
    let currentColor = 0;
    setInterval(() => {
        if (elements.demoBox) {
            elements.demoBox.style.background = colors[currentColor];
            currentColor = (currentColor + 1) % colors.length;
        }
    }, 3000);
}

// Performance monitoring
function startPerformanceMonitoring() {
    setInterval(async () => {
        if (stats.requests > 0) { 
            await fetchMemoryStats();
        }
    }, 5000);
    
    setInterval(updateStatsDisplay, 1000);
}

function enhanceLiveReload() {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        if (typeof url === 'string' && url.includes('/reload')) {
            const startTime = performance.now();
            return originalFetch.apply(this, args).then(response => {
                const endTime = performance.now();
                elements.lastCheck.textContent = `${(endTime - startTime).toFixed(2)}ms`;
                
                // Update status indicator
                if (elements.reloadStatus) {
                    elements.reloadStatus.classList.add('active');
                    setTimeout(() => {
                        if (elements.reloadStatus) {
                            elements.reloadStatus.classList.remove('active');
                            setTimeout(() => {
                                if (elements.reloadStatus) {
                                    elements.reloadStatus.classList.add('active');
                                }
                            }, 100);
                        }
                    }, 200);
                }
                
                return response;
            });
        }
        return originalFetch.apply(this, args);
    };
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    testMemoryStats();
                    break;
                case '2':
                    e.preventDefault();
                    testReload();
                    break;
                case '3':
                    e.preventDefault();
                    stressTest();
                    break;
                case '0':
                    e.preventDefault();
                    clearStats();
                    break;
            }
        }
    });
    
    logResult('Keyboard shortcuts enabled: Ctrl+1 (Memory), Ctrl+2 (Reload), Ctrl+3 (Stress), Ctrl+0 (Clear)', 'info');
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    logResult('Advanced Live Server Client initialized', 'success');
    
    fetchMemoryStats();
    startPerformanceMonitoring();
    enhanceLiveReload();
    setupKeyboardShortcuts();
    animateDemoBox();
    
    setTimeout(() => {
        logResult('Try editing index.html, style.css, or script.js to see live reload in action!', 'info');
        logResult('Use Ctrl+1,2,3,0 for quick testing', 'info');
    }, 1000);
});

// Export functions for global access
window.testMemoryStats = testMemoryStats;
window.testReload = testReload;
window.stressTest = stressTest;
window.clearStats = clearStats;
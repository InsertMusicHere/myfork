// Enhanced custom-integration.js for draw.io
(function() {
    'use strict';
    
    let sessionId = '';
    let autoSave = false;
    let parentOrigin = '';
    let hasUnsavedChanges = false;
    
    // Wait for draw.io to be fully loaded
    function waitForDrawio() {
        if (typeof EditorUi !== 'undefined' && window.ui) {
            initCustomIntegration();
        } else {
            setTimeout(waitForDrawio, 100);
        }
    }
    
    function initCustomIntegration() {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        sessionId = urlParams.get('sessionId') || '';
        autoSave = urlParams.get('autoSave') === 'true';
        parentOrigin = urlParams.get('origin') || '';
        const mode = urlParams.get('mode');
        const existingDiagram = urlParams.get('existingDiagram');
        
        console.log('Draw.io integration initialized:', { sessionId, autoSave, mode });
        
        // Load existing diagram if provided
        if (existingDiagram && mode === 'edit') {
            try {
                const diagramData = atob(existingDiagram);
                const doc = mxUtils.parseXml(diagramData);
                window.ui.editor.setGraphXml(doc.documentElement);
                console.log('Existing diagram loaded successfully');
            } catch (error) {
                console.error('Failed to load existing diagram:', error);
            }
        }
        
        // Set up change tracking
        setupChangeTracking();
        
        // Override existing save actions
        overrideSaveActions();
        
        // Add custom UI elements
        addCustomUIElements();
        
        // Set up keyboard shortcuts
        setupKeyboardShortcuts();
        
        // Listen for messages from parent window
        setupMessageListeners();
        
        // Set up auto-save if enabled
        if (autoSave) {
            setupAutoSave();
        }
    }
    
    function setupChangeTracking() {
        const graph = window.ui.editor.graph;
        const model = graph.getModel();
        
        // Track model changes
        model.addListener(mxEvent.CHANGE, function() {
            hasUnsavedChanges = true;
        });
        
        // Track when changes are saved
        window.addEventListener('diagram-saved', function() {
            hasUnsavedChanges = false;
        });
    }
    
    function overrideSaveActions() {
        // Override the default save action
        if (window.ui.actions && window.ui.actions.actions.save) {
            const originalSave = window.ui.actions.actions.save.funct;
            window.ui.actions.actions.save.funct = function() {
                handleSaveAndPublish();
            };
        }
        
        // Override saveAs if needed
        if (window.ui.actions && window.ui.actions.actions.saveAs) {
            const originalSaveAs = window.ui.actions.actions.saveAs.funct;
            window.ui.actions.actions.saveAs.funct = function() {
                handleSaveAndPublish();
            };
        }
    }
    
    function addCustomUIElements() {
        // Add custom save button to toolbar
        const toolbar = document.querySelector('.geMenubar');
        if (toolbar) {
            // Create save button
            const saveBtn = document.createElement('button');
            saveBtn.innerHTML = '💾 Save & Publish';
            saveBtn.className = 'geBtn gePrimaryBtn';
            saveBtn.style.cssText = `
                margin-left: 10px;
                background: #4CAF50;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
            `;
            saveBtn.onclick = handleSaveAndPublish;
            toolbar.appendChild(saveBtn);
            
            // Add auto-save button if enabled
            if (autoSave) {
                const autoSaveBtn = document.createElement('button');
                autoSaveBtn.innerHTML = '📄 Quick Save';
                autoSaveBtn.className = 'geBtn';
                autoSaveBtn.style.cssText = `
                    margin-left: 5px;
                    background: #2196F3;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                `;
                autoSaveBtn.onclick = handleAutoSave;
                toolbar.appendChild(autoSaveBtn);
            }
        }
        
        // Add status indicator
        addStatusIndicator();
    }
    
    function addStatusIndicator() {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'custom-status';
        statusDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 5px 10px;
            font-size: 12px;
            z-index: 1000;
        `;
        statusDiv.innerHTML = '✅ Ready';
        document.body.appendChild(statusDiv);
    }
    
    function updateStatus(message, type = 'info') {
        const statusDiv = document.getElementById('custom-status');
        if (statusDiv) {
            const icons = {
                info: '📝',
                success: '✅',
                error: '❌',
                warning: '⚠️'
            };
            statusDiv.innerHTML = `${icons[type]} ${message}`;
            statusDiv.style.background = {
                info: '#e3f2fd',
                success: '#e8f5e8',
                error: '#ffebee',
                warning: '#fff3e0'
            }[type];
        }
    }
    
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSaveAndPublish();
            }
            
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                handleAutoSave();
            }
        });
    }
    
    function setupMessageListeners() {
        window.addEventListener('message', function(event) {
            if (event.origin !== parentOrigin) return;
            
            try {
                const data = JSON.parse(event.data);
                
                if (data.action === 'trigger_save' && data.sessionId === sessionId) {
                    handleSaveAndPublish();
                } else if (data.action === 'trigger_auto_save' && data.sessionId === sessionId) {
                    handleAutoSave();
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });
    }
    
    function setupAutoSave() {
        // Auto-save every 30 seconds if there are unsaved changes
        setInterval(function() {
            if (hasUnsavedChanges) {
                console.log('Auto-saving diagram...');
                handleAutoSave();
            }
        }, 30000);
    }
    
    function handleSaveAndPublish() {
        updateStatus('Saving diagram...', 'info');
        
        try {
            const { imageData, diagramData } = exportDiagram();
            
            // Send to parent window
            sendToParent({
                action: 'diagram_saved',
                imageData: imageData,
                diagramData: diagramData,
                sessionId: sessionId
            });
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('diagram-saved'));
            
            updateStatus('Saved & Published!', 'success');
            
            // Close window after a short delay
            setTimeout(() => {
                window.close();
            }, 1000);
            
        } catch (error) {
            console.error('Save failed:', error);
            updateStatus('Save failed!', 'error');
            alert('Failed to save diagram. Please try again.');
        }
    }
    
    function handleAutoSave() {
        updateStatus('Auto-saving...', 'info');
        
        try {
            const { imageData, diagramData } = exportDiagram();
            
            // Send to parent window
            sendToParent({
                action: 'diagram_auto_saved',
                imageData: imageData,
                diagramData: diagramData,
                sessionId: sessionId
            });
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('diagram-saved'));
            
            updateStatus('Auto-saved!', 'success');
            
            // Reset status after 3 seconds
            setTimeout(() => {
                updateStatus('Ready', 'info');
            }, 3000);
            
        } catch (error) {
            console.error('Auto-save failed:', error);
            updateStatus('Auto-save failed!', 'error');
        }
    }
    
    function exportDiagram() {
        const graph = window.ui.editor.graph;
        const xmlData = mxUtils.getXml(window.ui.editor.getGraphXml());
        
        // Use draw.io's built-in export functionality
        const bounds = graph.getGraphBounds();
        const scale = 2; // Higher resolution
        const border = 20;
        
        // Use draw.io's built-in PNG export
        const imgExport = new mxImageExport();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = Math.ceil(bounds.width * scale) + 2 * border;
        canvas.height = Math.ceil(bounds.height * scale) + 2 * border;
        
        // Fill background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Use mxImageExport to render to canvas
        const xmlCanvas = new mxXmlCanvas2D(canvas);
        xmlCanvas.translate(Math.floor(border - bounds.x * scale), Math.floor(border - bounds.y * scale));
        xmlCanvas.scale(scale);
        
        // Render the graph
        const view = graph.getView();
        const rootState = view.getState(graph.model.root);
        
        if (rootState) {
            imgExport.drawState(rootState, xmlCanvas);
        }
        
        const imageData = canvas.toDataURL('image/png', 0.9);
        
        return {
            imageData: imageData,
            diagramData: xmlData
        };
    }
    
    function sendToParent(data) {
        if (window.opener && parentOrigin) {
            window.opener.postMessage(JSON.stringify(data), parentOrigin);
        } else if (window.parent && parentOrigin) {
            window.parent.postMessage(JSON.stringify(data), parentOrigin);
        } else {
            console.warn('No parent window found or origin not set');
        }
    }
    
    // Handle window close
    window.addEventListener('beforeunload', function(e) {
        if (hasUnsavedChanges) {
            const message = 'You have unsaved changes. Are you sure you want to leave?';
            e.returnValue = message;
            return message;
        }
        
        // Send cancel message
        sendToParent({
            action: 'diagram_cancelled',
            sessionId: sessionId
        });
    });
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForDrawio);
    } else {
        waitForDrawio();
    }
    
    console.log('Draw.io custom integration script loaded');
})();
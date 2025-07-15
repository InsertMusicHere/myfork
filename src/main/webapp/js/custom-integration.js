// // Enhanced custom-integration.js for draw.io
// (function() {
//     'use strict';
    
//     let sessionId = '';
//     let autoSave = false;
//     let parentOrigin = '';
//     let hasUnsavedChanges = false;
    
//     // Wait for draw.io to be fully loaded
//     function waitForDrawio() {
//         if (typeof EditorUi !== 'undefined' && window.ui) {
//             initCustomIntegration();
//         } else {
//             setTimeout(waitForDrawio, 100);
//         }
//     }
    
//     function initCustomIntegration() {
//         // Get URL parameters
//         const urlParams = new URLSearchParams(window.location.search);
//         sessionId = urlParams.get('sessionId') || '';
//         autoSave = urlParams.get('autoSave') === 'true';
//         parentOrigin = urlParams.get('origin') || '';
//         const mode = urlParams.get('mode');
//         const existingDiagram = urlParams.get('existingDiagram');
        
//         console.log('Draw.io integration initialized:', { sessionId, autoSave, mode });
        
//         // Load existing diagram if provided
//         if (existingDiagram && mode === 'edit') {
//             try {
//                 const diagramData = atob(existingDiagram);
//                 const doc = mxUtils.parseXml(diagramData);
//                 window.ui.editor.setGraphXml(doc.documentElement);
//                 console.log('Existing diagram loaded successfully');
//             } catch (error) {
//                 console.error('Failed to load existing diagram:', error);
//             }
//         }
        
//         // Set up change tracking
//         setupChangeTracking();
        
//         // Override existing save actions
//         overrideSaveActions();
        
//         // Add custom UI elements
//         addCustomUIElements();
        
//         // Set up keyboard shortcuts
//         setupKeyboardShortcuts();
        
//         // Listen for messages from parent window
//         setupMessageListeners();
        
//         // Set up auto-save if enabled
//         if (autoSave) {
//             setupAutoSave();
//         }
//     }
    
//     function setupChangeTracking() {
//         const graph = window.ui.editor.graph;
//         const model = graph.getModel();
        
//         // Track model changes
//         model.addListener(mxEvent.CHANGE, function() {
//             hasUnsavedChanges = true;
//         });
        
//         // Track when changes are saved
//         window.addEventListener('diagram-saved', function() {
//             hasUnsavedChanges = false;
//         });
//     }
    
//     function overrideSaveActions() {
//         // Override the default save action
//         if (window.ui.actions && window.ui.actions.actions.save) {
//             const originalSave = window.ui.actions.actions.save.funct;
//             window.ui.actions.actions.save.funct = function() {
//                 handleSaveAndPublish();
//             };
//         }
        
//         // Override saveAs if needed
//         if (window.ui.actions && window.ui.actions.actions.saveAs) {
//             const originalSaveAs = window.ui.actions.actions.saveAs.funct;
//             window.ui.actions.actions.saveAs.funct = function() {
//                 handleSaveAndPublish();
//             };
//         }
//     }
    
//     function addCustomUIElements() {
//         // Add custom save button to toolbar
//         const toolbar = document.querySelector('.geMenubar');
//         if (toolbar) {
//             // Create save button
//             const saveBtn = document.createElement('button');
//             saveBtn.innerHTML = '💾 Save & Publish';
//             saveBtn.className = 'geBtn gePrimaryBtn';
//             saveBtn.style.cssText = `
//                 margin-left: 10px;
//                 background: #4CAF50;
//                 color: white;
//                 border: none;
//                 padding: 8px 16px;
//                 border-radius: 4px;
//                 cursor: pointer;
//                 font-size: 12px;
//                 font-weight: 500;
//             `;
//             saveBtn.onclick = handleSaveAndPublish;
//             toolbar.appendChild(saveBtn);
            
//             // Add auto-save button if enabled
//             if (autoSave) {
//                 const autoSaveBtn = document.createElement('button');
//                 autoSaveBtn.innerHTML = '📄 Quick Save';
//                 autoSaveBtn.className = 'geBtn';
//                 autoSaveBtn.style.cssText = `
//                     margin-left: 5px;
//                     background: #2196F3;
//                     color: white;
//                     border: none;
//                     padding: 8px 16px;
//                     border-radius: 4px;
//                     cursor: pointer;
//                     font-size: 12px;
//                     font-weight: 500;
//                 `;
//                 autoSaveBtn.onclick = handleAutoSave;
//                 toolbar.appendChild(autoSaveBtn);
//             }
//         }
        
//         // Add status indicator
//         addStatusIndicator();
//     }
    
//     function addStatusIndicator() {
//         const statusDiv = document.createElement('div');
//         statusDiv.id = 'custom-status';
//         statusDiv.style.cssText = `
//             position: fixed;
//             top: 10px;
//             right: 10px;
//             background: #f0f0f0;
//             border: 1px solid #ccc;
//             border-radius: 4px;
//             padding: 5px 10px;
//             font-size: 12px;
//             z-index: 1000;
//         `;
//         statusDiv.innerHTML = '✅ Ready';
//         document.body.appendChild(statusDiv);
//     }
    
//     function updateStatus(message, type = 'info') {
//         const statusDiv = document.getElementById('custom-status');
//         if (statusDiv) {
//             const icons = {
//                 info: '📝',
//                 success: '✅',
//                 error: '❌',
//                 warning: '⚠️'
//             };
//             statusDiv.innerHTML = `${icons[type]} ${message}`;
//             statusDiv.style.background = {
//                 info: '#e3f2fd',
//                 success: '#e8f5e8',
//                 error: '#ffebee',
//                 warning: '#fff3e0'
//             }[type];
//         }
//     }
    
//     function setupKeyboardShortcuts() {
//         document.addEventListener('keydown', function(e) {
//             if ((e.ctrlKey || e.metaKey) && e.key === 's') {
//                 e.preventDefault();
//                 handleSaveAndPublish();
//             }
            
//             if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
//                 e.preventDefault();
//                 handleAutoSave();
//             }
//         });
//     }
    
//     function setupMessageListeners() {
//         window.addEventListener('message', function(event) {
//             if (event.origin !== parentOrigin) return;
            
//             try {
//                 const data = JSON.parse(event.data);
                
//                 if (data.action === 'trigger_save' && data.sessionId === sessionId) {
//                     handleSaveAndPublish();
//                 } else if (data.action === 'trigger_auto_save' && data.sessionId === sessionId) {
//                     handleAutoSave();
//                 }
//             } catch (error) {
//                 console.error('Error parsing message:', error);
//             }
//         });
//     }
    
//     function setupAutoSave() {
//         // Auto-save every 30 seconds if there are unsaved changes
//         setInterval(function() {
//             if (hasUnsavedChanges) {
//                 console.log('Auto-saving diagram...');
//                 handleAutoSave();
//             }
//         }, 30000);
//     }
    
//     function handleSaveAndPublish() {
//         updateStatus('Saving diagram...', 'info');
        
//         try {
//             const { imageData, diagramData } = exportDiagram();
            
//             // Send to parent window
//             sendToParent({
//                 action: 'diagram_saved',
//                 imageData: imageData,
//                 diagramData: diagramData,
//                 sessionId: sessionId
//             });
            
//             // Dispatch custom event
//             window.dispatchEvent(new CustomEvent('diagram-saved'));
            
//             updateStatus('Saved & Published!', 'success');
            
//             // Close window after a short delay
//             setTimeout(() => {
//                 window.close();
//             }, 1000);
            
//         } catch (error) {
//             console.error('Save failed:', error);
//             updateStatus('Save failed!', 'error');
//             alert('Failed to save diagram. Please try again.');
//         }
//     }
    
//     function handleAutoSave() {
//         updateStatus('Auto-saving...', 'info');
        
//         try {
//             const { imageData, diagramData } = exportDiagram();
            
//             // Send to parent window
//             sendToParent({
//                 action: 'diagram_auto_saved',
//                 imageData: imageData,
//                 diagramData: diagramData,
//                 sessionId: sessionId
//             });
            
//             // Dispatch custom event
//             window.dispatchEvent(new CustomEvent('diagram-saved'));
            
//             updateStatus('Auto-saved!', 'success');
            
//             // Reset status after 3 seconds
//             setTimeout(() => {
//                 updateStatus('Ready', 'info');
//             }, 3000);
            
//         } catch (error) {
//             console.error('Auto-save failed:', error);
//             updateStatus('Auto-save failed!', 'error');
//         }
//     }
    
//     function exportDiagram() {
//         const graph = window.ui.editor.graph;
//         const xmlData = mxUtils.getXml(window.ui.editor.getGraphXml());
        
//         // Use draw.io's built-in export functionality
//         const bounds = graph.getGraphBounds();
//         const scale = 2; // Higher resolution
//         const border = 20;
        
//         // Use draw.io's built-in PNG export
//         const imgExport = new mxImageExport();
//         const canvas = document.createElement('canvas');
//         const ctx = canvas.getContext('2d');
        
//         canvas.width = Math.ceil(bounds.width * scale) + 2 * border;
//         canvas.height = Math.ceil(bounds.height * scale) + 2 * border;
        
//         // Fill background
//         ctx.fillStyle = '#ffffff';
//         ctx.fillRect(0, 0, canvas.width, canvas.height);
        
//         // Use mxImageExport to render to canvas
//         const xmlCanvas = new mxXmlCanvas2D(canvas);
//         xmlCanvas.translate(Math.floor(border - bounds.x * scale), Math.floor(border - bounds.y * scale));
//         xmlCanvas.scale(scale);
        
//         // Render the graph
//         const view = graph.getView();
//         const rootState = view.getState(graph.model.root);
        
//         if (rootState) {
//             imgExport.drawState(rootState, xmlCanvas);
//         }
        
//         const imageData = canvas.toDataURL('image/png', 0.9);
        
//         return {
//             imageData: imageData,
//             diagramData: xmlData
//         };
//     }
    
//     function sendToParent(data) {
//         if (window.opener && parentOrigin) {
//             window.opener.postMessage(JSON.stringify(data), parentOrigin);
//         } else if (window.parent && parentOrigin) {
//             window.parent.postMessage(JSON.stringify(data), parentOrigin);
//         } else {
//             console.warn('No parent window found or origin not set');
//         }
//     }
    
//     // Handle window close
//     window.addEventListener('beforeunload', function(e) {
//         if (hasUnsavedChanges) {
//             const message = 'You have unsaved changes. Are you sure you want to leave?';
//             e.returnValue = message;
//             return message;
//         }
        
//         // Send cancel message
//         sendToParent({
//             action: 'diagram_cancelled',
//             sessionId: sessionId
//         });
//     });
    
//     // Initialize when DOM is ready
//     if (document.readyState === 'loading') {
//         document.addEventListener('DOMContentLoaded', waitForDrawio);
//     } else {
//         waitForDrawio();
//     }
    
//     console.log('Draw.io custom integration script loaded');
// })();


// Enhanced custom-integration.js for draw.io
(function() {
    'use strict';
    
    let sessionId = '';
    let autoSave = false;
    let parentOrigin = '';
    let hasUnsavedChanges = false;
    let customButtonsAdded = false;
    let initializationRetries = 0;
    const MAX_INIT_RETRIES = 20;
    
    // Debug function to log UI state
    function debugUIState() {
        console.log('=== Draw.io UI Debug Info ===');
        console.log('EditorUi exists:', typeof EditorUi !== 'undefined');
        console.log('window.ui exists:', !!window.ui);
        console.log('editor exists:', !!(window.ui && window.ui.editor));
        console.log('graph exists:', !!(window.ui && window.ui.editor && window.ui.editor.graph));
        console.log('actions exists:', !!(window.ui && window.ui.actions));
        console.log('toolbar exists:', !!(window.ui && window.ui.toolbar));
        console.log('menubar exists:', !!(window.ui && window.ui.menubar));
        console.log('DOM loaded:', document.readyState);
        console.log('Available toolbars:', document.querySelectorAll('.geMenubar, .geToolbar, #geMenubar, .geMenubarContainer').length);
        console.log('=============================');
    }
    
    // Enhanced detection for draw.io readiness
    function waitForDrawio() {
        initializationRetries++;
        
        if (initializationRetries % 5 === 0) {
            debugUIState();
        }
        
        // Check multiple conditions for draw.io readiness
        const isDrawioReady = (
            typeof EditorUi !== 'undefined' && 
            window.ui && 
            window.ui.editor && 
            window.ui.editor.graph &&
            window.ui.actions &&
            document.readyState === 'complete'
        );
        
        if (isDrawioReady) {
            console.log('Draw.io fully loaded, initializing custom integration...');
            // Add a small delay to ensure UI is fully rendered
            setTimeout(() => {
                initCustomIntegration();
            }, 500);
        } else if (initializationRetries < MAX_INIT_RETRIES) {
            setTimeout(waitForDrawio, 500);
        } else {
            console.error('Failed to initialize draw.io after maximum retries');
            // Try to add floating buttons as fallback
            addFloatingButtons();
        }
    }
    
    function initCustomIntegration() {
        try {
            // Get URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            sessionId = urlParams.get('sessionId') || '';
            autoSave = urlParams.get('autoSave') === 'true';
            parentOrigin = urlParams.get('origin') || '';
            const mode = urlParams.get('mode');
            const existingDiagram = urlParams.get('existingDiagram');
            
            console.log('Draw.io integration initialized:', { sessionId, autoSave, mode, parentOrigin });
            
            // Load existing diagram if provided
            if (existingDiagram && mode === 'edit') {
                loadExistingDiagram(existingDiagram);
            }
            
            // Set up all functionality
            setupChangeTracking();
            overrideSaveActions();
            setupKeyboardShortcuts();
            setupMessageListeners();
            
            // Add custom UI elements with retry mechanism
            addCustomUIElements();
            
            // Set up auto-save if enabled
            if (autoSave) {
                setupAutoSave();
            }
            
        } catch (error) {
            console.error('Failed to initialize custom integration:', error);
            // Fallback to floating buttons
            addFloatingButtons();
        }
    }
    
    function loadExistingDiagram(existingDiagram) {
        try {
            const diagramData = atob(existingDiagram);
            const doc = mxUtils.parseXml(diagramData);
            window.ui.editor.setGraphXml(doc.documentElement);
            console.log('Existing diagram loaded successfully');
        } catch (error) {
            console.error('Failed to load existing diagram:', error);
        }
    }
    
    function addCustomUIElements() {
        if (customButtonsAdded) return;
        
        // Try multiple approaches to add buttons
        let success = false;
        
        // Approach 1: Try to add to existing toolbar
        success = tryAddToToolbar();
        
        if (!success) {
            // Approach 2: Try to add to menubar
            success = tryAddToMenubar();
        }
        
        if (!success) {
            // Approach 3: Create floating buttons
            console.log('Falling back to floating buttons');
            addFloatingButtons();
        }
        
        // Always add status indicator
        addStatusIndicator();
    }
    
    function tryAddToToolbar() {
        const toolbarSelectors = [
            '.geMenubar',
            '.geToolbar', 
            '#geMenubar',
            '.geMenubarContainer',
            '.geToolbarContainer',
            '[data-action="toolbar"]'
        ];
        
        for (const selector of toolbarSelectors) {
            const toolbar = document.querySelector(selector);
            if (toolbar) {
                console.log(`Found toolbar with selector: ${selector}`);
                try {
                    addButtonsToElement(toolbar);
                    customButtonsAdded = true;
                    return true;
                } catch (error) {
                    console.error(`Failed to add buttons to ${selector}:`, error);
                }
            }
        }
        
        return false;
    }
    
    function tryAddToMenubar() {
        // Try to find the menubar or any container
        const containers = document.querySelectorAll('div[style*="toolbar"], div[style*="menubar"], .geMenubar, .geToolbar');
        
        for (const container of containers) {
            try {
                console.log('Trying to add buttons to container:', container);
                addButtonsToElement(container);
                customButtonsAdded = true;
                return true;
            } catch (error) {
                console.error('Failed to add buttons to container:', error);
            }
        }
        
        return false;
    }
    
    function addButtonsToElement(parentElement) {
        // Create container for our buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'custom-button-container';
        buttonContainer.style.cssText = `
            display: inline-flex;
            gap: 8px;
            margin: 0 10px;
            align-items: center;
            z-index: 10000;
        `;
        
        // Create save button
        const saveBtn = createSaveButton();
        buttonContainer.appendChild(saveBtn);
        
        // Add auto-save button if enabled
        if (autoSave) {
            const autoSaveBtn = createAutoSaveButton();
            buttonContainer.appendChild(autoSaveBtn);
        }
        
        // Try to insert at the beginning or end of the parent
        if (parentElement.firstChild) {
            parentElement.insertBefore(buttonContainer, parentElement.firstChild);
        } else {
            parentElement.appendChild(buttonContainer);
        }
        
        console.log('Buttons added to toolbar successfully');
    }
    
    function createSaveButton() {
        const saveBtn = document.createElement('button');
        saveBtn.innerHTML = '💾 Save & Return';
        saveBtn.className = 'geBtn gePrimaryBtn custom-save-btn';
        saveBtn.style.cssText = `
            background: linear-gradient(135deg, #4CAF50, #45a049) !important;
            color: white !important;
            border: none !important;
            padding: 8px 16px !important;
            border-radius: 6px !important;
            cursor: pointer !important;
            font-size: 12px !important;
            font-weight: 600 !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
            transition: all 0.3s ease !important;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
            z-index: 10001 !important;
        `;
        
        saveBtn.addEventListener('mouseenter', () => {
            saveBtn.style.transform = 'translateY(-1px)';
            saveBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        });
        
        saveBtn.addEventListener('mouseleave', () => {
            saveBtn.style.transform = 'translateY(0)';
            saveBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        });
        
        saveBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSaveAndReturn();
        };
        
        return saveBtn;
    }
    
    function createAutoSaveButton() {
        const autoSaveBtn = document.createElement('button');
        autoSaveBtn.innerHTML = '📄 Quick Save';
        autoSaveBtn.className = 'geBtn custom-autosave-btn';
        autoSaveBtn.style.cssText = `
            background: linear-gradient(135deg, #2196F3, #1976D2) !important;
            color: white !important;
            border: none !important;
            padding: 8px 16px !important;
            border-radius: 6px !important;
            cursor: pointer !important;
            font-size: 12px !important;
            font-weight: 600 !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
            transition: all 0.3s ease !important;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
            z-index: 10001 !important;
        `;
        
        autoSaveBtn.addEventListener('mouseenter', () => {
            autoSaveBtn.style.transform = 'translateY(-1px)';
            autoSaveBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        });
        
        autoSaveBtn.addEventListener('mouseleave', () => {
            autoSaveBtn.style.transform = 'translateY(0)';
            autoSaveBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        });
        
        autoSaveBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAutoSave();
        };
        
        return autoSaveBtn;
    }
    
    function addFloatingButtons() {
        if (document.getElementById('custom-floating-buttons')) {
            return; // Already added
        }
        
        // Create floating button container
        const floatingContainer = document.createElement('div');
        floatingContainer.id = 'custom-floating-buttons';
        floatingContainer.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            z-index: 10000 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            background: rgba(255, 255, 255, 0.98) !important;
            padding: 15px !important;
            border-radius: 12px !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important;
            backdrop-filter: blur(10px) !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
            min-width: 200px !important;
        `;
        
        // Create save button
        const saveBtn = document.createElement('button');
        saveBtn.innerHTML = '💾 Save & Return to Document';
        saveBtn.style.cssText = `
            background: linear-gradient(135deg, #4CAF50, #45a049) !important;
            color: white !important;
            border: none !important;
            padding: 12px 20px !important;
            border-radius: 8px !important;
            cursor: pointer !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3) !important;
            transition: all 0.3s ease !important;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
        `;
        
        saveBtn.addEventListener('mouseenter', () => {
            saveBtn.style.transform = 'translateY(-2px)';
            saveBtn.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.4)';
        });
        
        saveBtn.addEventListener('mouseleave', () => {
            saveBtn.style.transform = 'translateY(0)';
            saveBtn.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
        });
        
        saveBtn.onclick = handleSaveAndReturn;
        floatingContainer.appendChild(saveBtn);
        
        // Add auto-save button if enabled
        if (autoSave) {
            const autoSaveBtn = document.createElement('button');
            autoSaveBtn.innerHTML = '📄 Quick Save';
            autoSaveBtn.style.cssText = `
                background: linear-gradient(135deg, #2196F3, #1976D2) !important;
                color: white !important;
                border: none !important;
                padding: 12px 20px !important;
                border-radius: 8px !important;
                cursor: pointer !important;
                font-size: 13px !important;
                font-weight: 600 !important;
                box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3) !important;
                transition: all 0.3s ease !important;
                text-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
            `;
            
            autoSaveBtn.addEventListener('mouseenter', () => {
                autoSaveBtn.style.transform = 'translateY(-2px)';
                autoSaveBtn.style.boxShadow = '0 6px 16px rgba(33, 150, 243, 0.4)';
            });
            
            autoSaveBtn.addEventListener('mouseleave', () => {
                autoSaveBtn.style.transform = 'translateY(0)';
                autoSaveBtn.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.3)';
            });
            
            autoSaveBtn.onclick = handleAutoSave;
            floatingContainer.appendChild(autoSaveBtn);
        }
        
        document.body.appendChild(floatingContainer);
        customButtonsAdded = true;
        console.log('Floating buttons added successfully');
    }
    
    function setupChangeTracking() {
        try {
            const graph = window.ui.editor.graph;
            const model = graph.getModel();
            
            // Track model changes
            model.addListener(mxEvent.CHANGE, function() {
                hasUnsavedChanges = true;
                updateStatus('Unsaved changes', 'warning');
            });
            
            // Track when changes are saved
            window.addEventListener('diagram-saved', function() {
                hasUnsavedChanges = false;
            });
        } catch (error) {
            console.error('Failed to setup change tracking:', error);
        }
    }
    
    function overrideSaveActions() {
        try {
            // Override the default save action
            if (window.ui.actions && window.ui.actions.actions.save) {
                const originalSave = window.ui.actions.actions.save.funct;
                window.ui.actions.actions.save.funct = function() {
                    console.log('Save action intercepted');
                    handleSaveAndReturn();
                };
            }
        } catch (error) {
            console.error('Failed to override save actions:', error);
        }
    }

    function handleSaveAndReturn() {
        updateStatus('Saving diagram...', 'info');
        
        try {
            const { imageData, diagramData } = exportDiagram();
            
            // Send to parent window
            const success = sendToParent({
                action: 'diagram_saved',
                imageData: imageData,
                diagramData: diagramData,
                sessionId: sessionId
            });
            
            if (success) {
                // Dispatch custom event
                window.dispatchEvent(new CustomEvent('diagram-saved'));
                
                updateStatus('Saved! Returning to document...', 'success');
                
                // Close window after a short delay
                setTimeout(() => {
                    try {
                        window.close();
                    } catch (e) {
                        // If window.close() fails, try to redirect back
                        if (parentOrigin) {
                            window.location.href = parentOrigin;
                        }
                    }
                }, 800);
            } else {
                throw new Error('Failed to communicate with parent window');
            }
            
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
            const success = sendToParent({
                action: 'diagram_auto_saved',
                imageData: imageData,
                diagramData: diagramData,
                sessionId: sessionId
            });
            
            if (success) {
                // Dispatch custom event
                window.dispatchEvent(new CustomEvent('diagram-saved'));
                
                updateStatus('Auto-saved!', 'success');
                
                // Reset status after 3 seconds
                setTimeout(() => {
                    updateStatus('Ready', 'info');
                }, 3000);
            } else {
                throw new Error('Failed to communicate with parent window');
            }
            
        } catch (error) {
            console.error('Auto-save failed:', error);
            updateStatus('Auto-save failed!', 'error');
        }
    }
    
    function addStatusIndicator() {
        if (document.getElementById('custom-status')) {
            return; // Already added
        }
        
        const statusDiv = document.createElement('div');
        statusDiv.id = 'custom-status';
        statusDiv.style.cssText = `
            position: fixed !important;
            top: 10px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            background: rgba(255, 255, 255, 0.95) !important;
            border: 1px solid rgba(0,0,0,0.1) !important;
            border-radius: 20px !important;
            padding: 8px 16px !important;
            font-size: 12px !important;
            font-weight: 500 !important;
            z-index: 9999 !important;
            backdrop-filter: blur(10px) !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
            transition: all 0.3s ease !important;
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
            
            const colors = {
                info: { bg: 'rgba(227, 242, 253, 0.95)', border: 'rgba(33, 150, 243, 0.2)' },
                success: { bg: 'rgba(232, 245, 232, 0.95)', border: 'rgba(76, 175, 80, 0.2)' },
                error: { bg: 'rgba(255, 235, 238, 0.95)', border: 'rgba(244, 67, 54, 0.2)' },
                warning: { bg: 'rgba(255, 243, 224, 0.95)', border: 'rgba(255, 152, 0, 0.2)' }
            };
            
            statusDiv.innerHTML = `${icons[type]} ${message}`;
            statusDiv.style.background = colors[type].bg;
            statusDiv.style.borderColor = colors[type].border;
        }
    }
    
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSaveAndReturn();
            }
            
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                handleAutoSave();
            }
        });
    }
    
    function setupMessageListeners() {
        window.addEventListener('message', function(event) {
            try {
                const data = JSON.parse(event.data);
                
                if (data.action === 'trigger_save' && data.sessionId === sessionId) {
                    handleSaveAndReturn();
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
    
    function exportDiagram() {
        const graph = window.ui.editor.graph;
        const xmlData = mxUtils.getXml(window.ui.editor.getGraphXml());
        
        // Create a temporary image using draw.io's built-in export
        const bounds = graph.getGraphBounds();
        const scale = 2;
        const border = 20;
        
        // Use draw.io's export functionality
        const imageExport = new mxImageExport();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = Math.ceil(bounds.width * scale) + 2 * border;
        canvas.height = Math.ceil(bounds.height * scale) + 2 * border;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Export using draw.io's built-in functionality
        const xmlCanvas = new mxXmlCanvas2D(canvas);
        xmlCanvas.translate(Math.floor(border - bounds.x * scale), Math.floor(border - bounds.y * scale));
        xmlCanvas.scale(scale);
        
        const imgExport = new mxImageExport();
        imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
        
        const imageData = canvas.toDataURL('image/png', 0.9);
        
        return {
            imageData: imageData,
            diagramData: xmlData
        };
    }
    
    function sendToParent(data) {
        const message = JSON.stringify(data);
        console.log('Sending message to parent:', data);
        
        // Try window.opener first (for popup windows)
        if (window.opener && !window.opener.closed) {
            try {
                window.opener.postMessage(message, parentOrigin || '*');
                console.log('Message sent to opener');
                return true;
            } catch (error) {
                console.error('Error sending to opener:', error);
            }
        }
        
        // Fallback to window.parent (for iframes)
        if (window.parent && window.parent !== window) {
            try {
                window.parent.postMessage(message, parentOrigin || '*');
                console.log('Message sent to parent');
                return true;
            } catch (error) {
                console.error('Error sending to parent:', error);
            }
        }
        
        console.error('No parent window available');
        return false;
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
    
    // Multiple initialization strategies
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(waitForDrawio, 100);
        });
    } else {
        setTimeout(waitForDrawio, 100);
    }
    
    // Also listen for window load
    window.addEventListener('load', () => {
        setTimeout(waitForDrawio, 500);
    });
    
    // Force initialization after some time
    setTimeout(() => {
        if (!customButtonsAdded) {
            console.log('Force initializing after timeout');
            waitForDrawio();
        }
    }, 3000);
    
    console.log('Draw.io custom integration script loaded');
})();
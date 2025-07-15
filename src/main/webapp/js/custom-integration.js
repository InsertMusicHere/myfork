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
    const MAX_INIT_RETRIES = 50; // Increased retries
    
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
        console.log('Body classes:', document.body.className);
        console.log('Available divs:', document.querySelectorAll('div').length);
        
        // Check if draw.io app is initialized
        if (typeof App !== 'undefined' && App.main) {
            console.log('App.main exists:', !!App.main);
            console.log('App.main.ui exists:', !!(App.main && App.main.ui));
        }
        
        // Check for global ui references
        const globalUi = window.ui || (typeof App !== 'undefined' && App.main && App.main.ui);
        console.log('Global UI reference:', !!globalUi);
        
        console.log('=============================');
    }
    
    // Enhanced detection for draw.io readiness
    function waitForDrawio() {
        initializationRetries++;
        
        if (initializationRetries % 10 === 0) {
            debugUIState();
        }
        
        // Multiple ways to check for draw.io readiness
        let ui = window.ui;
        
        // If window.ui is not available, try App.main.ui
        if (!ui && typeof App !== 'undefined' && App.main) {
            ui = App.main.ui;
            if (ui) {
                console.log('Found UI via App.main.ui');
                window.ui = ui; // Set it globally for consistency
            }
        }
        
        // Alternative: Check if EditorUi is available and try to get the current instance
        if (!ui && typeof EditorUi !== 'undefined') {
            // Try to find the current EditorUi instance
            const elements = document.querySelectorAll('*');
            for (let el of elements) {
                if (el.editorUi) {
                    ui = el.editorUi;
                    console.log('Found UI via DOM element');
                    window.ui = ui;
                    break;
                }
            }
        }
        
        // Check if we have a working UI instance
        const isDrawioReady = (
            ui && 
            ui.editor && 
            ui.editor.graph &&
            ui.actions &&
            document.readyState === 'complete' &&
            document.body.children.length > 0
        );
        
        if (isDrawioReady) {
            console.log('Draw.io fully loaded, initializing custom integration...');
            // Set the global reference
            window.ui = ui;
            
            // Add a small delay to ensure UI is fully rendered
            setTimeout(() => {
                initCustomIntegration();
            }, 1000);
        } else if (initializationRetries < MAX_INIT_RETRIES) {
            setTimeout(waitForDrawio, 300); // Reduced interval for faster detection
        } else {
            console.error('Failed to initialize draw.io after maximum retries');
            console.log('Attempting fallback initialization...');
            
            // Try to force find the UI
            attemptFallbackInitialization();
        }
    }
    
    // Fallback initialization method
    function attemptFallbackInitialization() {
        console.log('Attempting fallback initialization...');
        
        // Try to wait for the draw.io app to be ready using different methods
        const checkMethods = [
            () => window.ui,
            () => typeof App !== 'undefined' && App.main && App.main.ui,
            () => {
                // Try to find UI in window object
                for (let key in window) {
                    if (window[key] && typeof window[key] === 'object' && window[key].editor && window[key].editor.graph) {
                        return window[key];
                    }
                }
                return null;
            }
        ];
        
        let ui = null;
        for (let method of checkMethods) {
            try {
                ui = method();
                if (ui) {
                    console.log('Found UI via fallback method');
                    window.ui = ui;
                    break;
                }
            } catch (error) {
                console.log('Fallback method failed:', error);
            }
        }
        
        if (ui) {
            initCustomIntegration();
        } else {
            // Final fallback - just add floating buttons
            console.log('Adding floating buttons as final fallback');
            setTimeout(() => {
                addFloatingButtons();
                notifyParentOfButtonsReady();
            }, 1000);
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
            
            // Notify parent that buttons are ready
            setTimeout(() => {
                notifyParentOfButtonsReady();
            }, 500);
            
        } catch (error) {
            console.error('Failed to initialize custom integration:', error);
            // Fallback to floating buttons
            setTimeout(() => {
                addFloatingButtons();
                notifyParentOfButtonsReady();
            }, 1000);
        }
    }
    
    function notifyParentOfButtonsReady() {
        sendToParent({
            action: 'custom_buttons_ready',
            sessionId: sessionId,
            timestamp: Date.now()
        });
    }
    
    function loadExistingDiagram(existingDiagram) {
        try {
            const diagramData = atob(existingDiagram);
            const doc = mxUtils.parseXml(diagramData);
            
            // Ensure we have a valid UI reference
            const ui = window.ui || (typeof App !== 'undefined' && App.main && App.main.ui);
            if (ui && ui.editor) {
                ui.editor.setGraphXml(doc.documentElement);
                console.log('Existing diagram loaded successfully');
            } else {
                console.error('No valid UI reference for loading diagram');
            }
        } catch (error) {
            console.error('Failed to load existing diagram:', error);
        }
    }
    
    function addCustomUIElements() {
        if (customButtonsAdded) return;
        
        console.log('Attempting to add custom UI elements...');
        
        // Always try floating buttons first (most reliable)
        addFloatingButtons();
        
        // Also try to add to toolbar if possible
        setTimeout(() => {
            tryAddToToolbar();
        }, 2000);
        
        // Always add status indicator
        addStatusIndicator();
    }
    
    function tryAddToToolbar() {
        if (customButtonsAdded) return false;
        
        const toolbarSelectors = [
            '.geMenubar',
            '.geToolbar', 
            '#geMenubar',
            '.geMenubarContainer',
            '.geToolbarContainer',
            '[data-action="toolbar"]',
            'div[style*="position: absolute"][style*="top: 0px"]'
        ];
        
        for (const selector of toolbarSelectors) {
            const toolbar = document.querySelector(selector);
            if (toolbar && toolbar.offsetHeight > 0) {
                console.log(`Found visible toolbar with selector: ${selector}`);
                try {
                    addButtonsToElement(toolbar);
                    return true;
                } catch (error) {
                    console.error(`Failed to add buttons to ${selector}:`, error);
                }
            }
        }
        
        // Try to find any div that looks like a toolbar
        const allDivs = document.querySelectorAll('div');
        for (const div of allDivs) {
            const style = window.getComputedStyle(div);
            if (style.position === 'absolute' && 
                div.offsetTop < 100 && 
                div.offsetHeight > 20 && 
                div.offsetHeight < 100 &&
                div.offsetWidth > 200) {
                console.log('Found potential toolbar div:', div);
                try {
                    addButtonsToElement(div);
                    return true;
                } catch (error) {
                    console.error('Failed to add buttons to potential toolbar:', error);
                }
            }
        }
        
        return false;
    }
    
    function addButtonsToElement(parentElement) {
        // Check if we already added buttons to this element
        if (parentElement.querySelector('.custom-button-container')) {
            return;
        }
        
        // Create container for our buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'custom-button-container';
        buttonContainer.style.cssText = `
            display: inline-flex !important;
            gap: 8px !important;
            margin: 0 10px !important;
            align-items: center !important;
            z-index: 10000 !important;
            position: relative !important;
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
        
        console.log('Buttons added to toolbar element successfully');
        customButtonsAdded = true;
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
            position: relative !important;
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
            position: relative !important;
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
    
    // Add floating buttons as fallback
    function addFloatingButtons() {
        // Remove existing floating buttons
        const existingFloating = document.getElementById('custom-floating-buttons');
        if (existingFloating) {
            existingFloating.remove();
        }
        
        const floatingContainer = document.createElement('div');
        floatingContainer.id = 'custom-floating-buttons';
        floatingContainer.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            z-index: 99999 !important;
            pointer-events: auto !important;
        `;
        
        const saveBtn = createSaveButton();
        floatingContainer.appendChild(saveBtn);
        
        if (autoSave) {
            const autoSaveBtn = createAutoSaveButton();
            floatingContainer.appendChild(autoSaveBtn);
        }
        
        document.body.appendChild(floatingContainer);
        console.log('Floating buttons added successfully');
    }
    
    // Add status indicator
    function addStatusIndicator() {
        const existingStatus = document.getElementById('custom-status');
        if (existingStatus) {
            existingStatus.remove();
        }
        
        const statusDiv = document.createElement('div');
        statusDiv.id = 'custom-status';
        statusDiv.style.cssText = `
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            background: rgba(0,0,0,0.8) !important;
            color: white !important;
            padding: 8px 12px !important;
            border-radius: 4px !important;
            font-size: 12px !important;
            z-index: 99998 !important;
            pointer-events: none !important;
        `;
        statusDiv.textContent = `Session: ${sessionId}`;
        document.body.appendChild(statusDiv);
    }
    
    // Handle save and return
    function handleSaveAndReturn() {
        try {
            console.log('Saving diagram and returning...');
            
            // Get the UI reference
            const ui = window.ui || (typeof App !== 'undefined' && App.main && App.main.ui);
            
            if (!ui || !ui.editor || !ui.editor.graph) {
                console.error('Draw.io editor not available');
                updateStatus('Error: Editor not available');
                return;
            }
            
            // Get the diagram XML
            const graph = ui.editor.graph;
            const encoder = new mxCodec();
            const node = encoder.encode(graph.getModel());
            const diagramXml = mxUtils.getXml(node);
            const diagramData = btoa(diagramXml);
            
            console.log('Diagram data generated successfully');
            
            // Generate image
            generateDiagramImage((imageData) => {
                sendToParent({
                    action: 'diagram_saved',
                    sessionId: sessionId,
                    imageData: imageData,
                    diagramData: diagramData,
                    timestamp: Date.now()
                });
                
                // Update status
                updateStatus('Diagram saved successfully!');
                
                // Close window after a short delay
                setTimeout(() => {
                    window.close();
                }, 1000);
            });
            
        } catch (error) {
            console.error('Error saving diagram:', error);
            updateStatus('Error saving diagram');
        }
    }
    
    // Handle auto-save
    function handleAutoSave() {
        try {
            console.log('Auto-saving diagram...');
            
            // Get the UI reference
            const ui = window.ui || (typeof App !== 'undefined' && App.main && App.main.ui);
            
            if (!ui || !ui.editor || !ui.editor.graph) {
                console.error('Draw.io editor not available');
                return;
            }
            
            const graph = ui.editor.graph;
            const encoder = new mxCodec();
            const node = encoder.encode(graph.getModel());
            const diagramXml = mxUtils.getXml(node);
            const diagramData = btoa(diagramXml);
            
            generateDiagramImage((imageData) => {
                sendToParent({
                    action: 'diagram_auto_saved',
                    sessionId: sessionId,
                    imageData: imageData,
                    diagramData: diagramData,
                    timestamp: Date.now()
                });
                
                updateStatus('Auto-saved successfully!');
            });
            
        } catch (error) {
            console.error('Error auto-saving diagram:', error);
            updateStatus('Error auto-saving diagram');
        }
    }
    
    // Generate diagram image
    function generateDiagramImage(callback) {
        try {
            const ui = window.ui || (typeof App !== 'undefined' && App.main && App.main.ui);
            
            if (!ui || !ui.editor || !ui.editor.graph) {
                console.error('No valid UI reference for image generation');
                createFallbackImage(callback);
                return;
            }
            
            const graph = ui.editor.graph;
            const bounds = graph.getGraphBounds();
            const scale = 1;
            
            // Create canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size
            canvas.width = Math.max(bounds.width * scale, 100);
            canvas.height = Math.max(bounds.height * scale, 100);
            
            // Fill background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Use draw.io's built-in export functionality
            if (ui.editor.exportToCanvas) {
                ui.editor.exportToCanvas(canvas, (canvas) => {
                    const imageData = canvas.toDataURL('image/png');
                    callback(imageData);
                });
            } else {
                // Fallback method
                const svgRoot = graph.view.getDrawPane().ownerSVGElement;
                if (svgRoot) {
                    const serializer = new XMLSerializer();
                    const svgString = serializer.serializeToString(svgRoot);
                    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(svgBlob);
                    
                    const img = new Image();
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0);
                        const imageData = canvas.toDataURL('image/png');
                        URL.revokeObjectURL(url);
                        callback(imageData);
                    };
                    img.src = url;
                } else {
                    createFallbackImage(callback);
                }
            }
            
        } catch (error) {
            console.error('Error generating image:', error);
            createFallbackImage(callback);
        }
    }
    
    // Create fallback image
    function createFallbackImage(callback) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 300;
        canvas.height = 200;
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#666666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Diagram Created', canvas.width / 2, canvas.height / 2);
        callback(canvas.toDataURL('image/png'));
    }
    
    // Setup change tracking
    function setupChangeTracking() {
        const ui = window.ui || (typeof App !== 'undefined' && App.main && App.main.ui);
        
        if (!ui || !ui.editor || !ui.editor.graph) {
            console.log('Cannot setup change tracking - UI not available');
            return;
        }
        
        const graph = ui.editor.graph;
        const model = graph.getModel();
        
        // Listen for model changes
        model.addListener(mxEvent.CHANGE, () => {
            hasUnsavedChanges = true;
            updateStatus('Unsaved changes');
        });
        
        // Listen for graph changes
        graph.addListener(mxEvent.CELLS_ADDED, () => {
            hasUnsavedChanges = true;
        });
        
        graph.addListener(mxEvent.CELLS_REMOVED, () => {
            hasUnsavedChanges = true;
        });
        
        graph.addListener(mxEvent.CELLS_MOVED, () => {
            hasUnsavedChanges = true;
        });
        
        console.log('Change tracking setup successfully');
    }
    
    // Override save actions
    function overrideSaveActions() {
        const ui = window.ui || (typeof App !== 'undefined' && App.main && App.main.ui);
        
        if (!ui || !ui.actions) {
            console.log('Cannot override save actions - UI not available');
            return;
        }
        
        const originalSave = ui.actions.get('save');
        if (originalSave) {
            const originalFunct = originalSave.funct;
            originalSave.funct = function() {
                handleSaveAndReturn();
            };
            console.log('Save action overridden');
        }
        
        // Also override Ctrl+S
        const originalKeyHandler = ui.keyHandler;
        if (originalKeyHandler) {
            originalKeyHandler.bindKey(83, true, () => {
                handleSaveAndReturn();
            });
            console.log('Ctrl+S shortcut overridden');
        }
    }
    
    // Setup keyboard shortcuts
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                handleSaveAndReturn();
            }
            
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                handleAutoSave();
            }
        });
        
        console.log('Keyboard shortcuts setup');
    }
    
    // Setup message listeners
    function setupMessageListeners() {
        window.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.action === 'trigger_save' && data.sessionId === sessionId) {
                    console.log('Received trigger_save message');
                    handleSaveAndReturn();
                } else if (data.action === 'heartbeat' && data.sessionId === sessionId) {
                    // Respond to heartbeat
                    sendToParent({
                        action: 'heartbeat_response',
                        sessionId: sessionId,
                        timestamp: Date.now()
                    });
                }
            } catch (error) {
                // Ignore invalid messages
            }
        });
        
        console.log('Message listeners setup');
    }
    
    // Setup auto-save
    function setupAutoSave() {
        if (!autoSave) return;
        
        let autoSaveTimer;
        const autoSaveInterval = 30000; // 30 seconds
        
        function resetAutoSaveTimer() {
            clearTimeout(autoSaveTimer);
            if (hasUnsavedChanges) {
                autoSaveTimer = setTimeout(() => {
                    handleAutoSave();
                    hasUnsavedChanges = false;
                }, autoSaveInterval);
            }
        }
        
        // Reset timer on any change
        document.addEventListener('click', resetAutoSaveTimer);
        document.addEventListener('keydown', resetAutoSaveTimer);
        
        // Initial timer
        resetAutoSaveTimer();
        
        console.log('Auto-save setup');
    }
    
    // Update status indicator
    function updateStatus(message) {
        const statusDiv = document.getElementById('custom-status');
        if (statusDiv) {
            statusDiv.textContent = message;
            
            // Clear message after 3 seconds
            setTimeout(() => {
                statusDiv.textContent = `Session: ${sessionId}`;
            }, 3000);
        }
    }
    
    // Send message to parent window
    function sendToParent(message) {
        if (parentOrigin) {
            try {
                window.parent.postMessage(JSON.stringify(message), parentOrigin);
                console.log('Message sent to parent:', message);
            } catch (error) {
                console.error('Error sending message to parent:', error);
            }
        }
    }
    
    // Multiple initialization attempts
    function initializeWithRetry() {
        // Try immediate initialization
        if (document.readyState === 'complete') {
            waitForDrawio();
        } else {
            document.addEventListener('DOMContentLoaded', waitForDrawio);
        }
        
        // Also try when window loads
        window.addEventListener('load', () => {
            if (!customButtonsAdded) {
                setTimeout(waitForDrawio, 1000);
            }
        });
        
        // Try after a delay (in case draw.io takes time to initialize)
        setTimeout(() => {
            if (!customButtonsAdded) {
                console.log('Retry initialization after delay');
                waitForDrawio();
            }
        }, 3000);
        
        // Final retry after longer delay
        setTimeout(() => {
            if (!customButtonsAdded) {
                console.log('Final retry initialization');
                attemptFallbackInitialization();
            }
        }, 10000);
    }
    
    // Start initialization
    initializeWithRetry();
    
    // Expose functions for debugging
    window.customDrawioIntegration = {
        addFloatingButtons,
        handleSaveAndReturn,
        handleAutoSave,
        debugUIState,
        sessionId: () => sessionId,
        status: () => ({ customButtonsAdded, hasUnsavedChanges, sessionId }),
        forceInit: () => waitForDrawio(),
        fallbackInit: () => attemptFallbackInitialization()
    };
    
})();
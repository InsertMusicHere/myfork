// src/main/webapp/js/custom-integration.js
(function() {
    'use strict';
    
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
        const sessionId = urlParams.get('sessionId');
        const returnUrl = urlParams.get('returnUrl');
        const mode = urlParams.get('mode');
        const existingDiagram = urlParams.get('existingDiagram');
        
        // Load existing diagram if provided
        if (existingDiagram && mode === 'edit') {
            try {
                const diagramData = atob(existingDiagram);
                const doc = mxUtils.parseXml(diagramData);
                const codec = new mxCodec(doc);
                const model = codec.decode(doc.documentElement);
                window.ui.editor.setGraphXml(doc.documentElement);
            } catch (error) {
                console.error('Failed to load existing diagram:', error);
            }
        }
        
        // Override the save function
        const originalSave = window.ui.actions.actions.save.funct;
        window.ui.actions.actions.save.funct = function() {
            handleCustomSave();
        };
        
        // Add custom save button
        const toolbar = document.querySelector('.geToolbar');
        if (toolbar) {
            const saveBtn = document.createElement('button');
            saveBtn.innerHTML = 'Save & Return';
            saveBtn.className = 'geBtn';
            saveBtn.style.marginLeft = '10px';
            saveBtn.onclick = handleCustomSave;
            toolbar.appendChild(saveBtn);
        }
        
        // Add keyboard shortcut
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleCustomSave();
            }
        });
    }
    
    function handleCustomSave() {
        try {
            const graph = window.ui.editor.graph;
            const xmlData = mxUtils.getXml(window.ui.editor.getGraphXml());
            
            // Export as PNG
            const bounds = graph.getGraphBounds();
            const scale = 1;
            const border = 10;
            
            const imgExport = new mxImageExport();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = Math.ceil(bounds.width * scale) + 2 * border;
            canvas.height = Math.ceil(bounds.height * scale) + 2 * border;
            
            const imgCanvas = new mxXmlCanvas2D(canvas);
            imgCanvas.translate(Math.floor(border - bounds.x * scale), Math.floor(border - bounds.y * scale));
            imgCanvas.scale(scale);
            
            imgExport.drawState(graph.getView().getState(graph.model.root), imgCanvas);
            
            const imageData = canvas.toDataURL('image/png');
            
            // Return to parent application
            returnToParent(imageData, xmlData);
            
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save diagram. Please try again.');
        }
    }
    
    function returnToParent(imageData, diagramData) {
        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('returnUrl');
        const sessionId = urlParams.get('sessionId');
        
        if (returnUrl) {
            const params = new URLSearchParams({
                imageData: encodeURIComponent(imageData),
                diagramData: encodeURIComponent(diagramData),
                sessionId: sessionId || ''
            });
            
            window.location.href = `${returnUrl}?${params.toString()}`;
        } else {
            // Fallback: post message to parent window
            if (window.opener) {
                window.opener.postMessage(
                    JSON.stringify({
                        action: 'diagram_saved',
                        imageData: imageData,
                        diagramData: diagramData,
                        sessionId: sessionId
                    }),
                    '*'
                );
                window.close();
            }
        }
    }
    
    // Handle cancel/close
    window.addEventListener('beforeunload', function() {
        if (window.opener) {
            window.opener.postMessage(
                JSON.stringify({
                    action: 'diagram_cancelled',
                    sessionId: new URLSearchParams(window.location.search).get('sessionId')
                }),
                '*'
            );
        }
    });
    
    // Start the integration
    waitForDrawio();
})();
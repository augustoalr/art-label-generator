document.addEventListener('DOMContentLoaded', () => {


    // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
    const form = document.getElementById('label-form');
    const livePreview = document.getElementById('live-preview');
    const miniaturesArea = document.getElementById('miniatures-area');
    const roomsContainer = document.getElementById('rooms-container');
    const addRoomForm = document.getElementById('add-room-form');
    const generatePdfBtn = document.getElementById('generate-pdf-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const importProjectBtn = document.getElementById('import-project-btn');
    const exportProjectBtn = document.getElementById('export-project-btn');
    const importProjectInput = document.getElementById('import-project-input');
    const importCatalogBtn = document.getElementById('import-catalog-btn');
    const importCatalogInput = document.getElementById('import-catalog-input');
    const catalogStatusEl = document.getElementById('catalog-status');
    const searchAssetBtn = document.getElementById('search-asset-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const decoTypeRadios = document.querySelectorAll('input[name="decoration-type"]');
    const arabesqueControls = document.getElementById('arabesque-controls');
    const neutralLogoControls = document.getElementById('neutral-logo-controls');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmModalText = document.getElementById('confirm-modal-text');
    const confirmBtn = document.getElementById('confirm-modal-confirm-btn');
    const cancelBtn = document.getElementById('confirm-modal-cancel-btn');
    const moveToRoomModal = document.getElementById('move-to-room-modal');
    const moveModalFilter = document.getElementById('move-modal-filter');
    const moveModalRoomList = document.getElementById('move-modal-room-list');
    
    const logoPositionControls = document.getElementById('logo-position-controls');
    const resetLogoPosBtn = document.getElementById('reset-logo-pos-btn');
    const logoPosXInput = document.getElementById('logo-pos-x');
    const logoPosYInput = document.getElementById('logo-pos-y');

    // --- CONFIGURACIÓN POR DEFECTO PARA ESTILOS DE ETIQUETA (MODO PRO / STYLE ENGINE) ---
    const FONT_MAP = {
        arial: {
            css: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
            pdf: 'arial'
        },
        times: {
            css: "'Times New Roman', Times, 'Playfair Display', Georgia, serif",
            pdf: 'times'
        },
        courier: {
            css: "'Courier New', Courier, monospace",
            pdf: 'courier'
        }
    };

    // --- CONFIGURACIÓN POR DEFECTO PARA ESTILOS DE ETIQUETA (MODO PRO / STYLE ENGINE) ---
    const DEFAULT_STYLE_CONFIG = {
        fontFamily: 'arial', // 'arial' (Sans-serif), 'times' (Serif clásica), 'courier' (Monospace técnica)
        baseFontSize: 12,    // Tamaño base en puntos (rango 8 a 16 pt)
        textAlign: 'center', // 'left', 'center', 'right'
        fields: [
            { id: 'author', bold: true, italic: false, visible: true },
            { id: 'title', bold: false, italic: true, visible: true },
            { id: 'date', bold: false, italic: false, visible: true },
            { id: 'technique', bold: false, italic: false, visible: true },
            { id: 'measurements', bold: false, italic: false, visible: true }
        ],
        lineSpacingMultiplier: 1.0
    };

    // --- ESTADO DE LA APLICACIÓN ---
    let state = {
        labels: [],
        rooms: [],
        editingLabelId: null,
        styleConfig: JSON.parse(JSON.stringify(DEFAULT_STYLE_CONFIG))
    };

    // --- CATÁLOGO DE OBRAS LOCAL ---
    let artCatalog = [];
    const CATALOG_STORAGE_KEY = 'artlabel_catalog';

    const updateCatalogStatusUI = () => {
        if (!catalogStatusEl) return;
        if (artCatalog && artCatalog.length > 0) {
            catalogStatusEl.textContent = `Catálogo: ${artCatalog.length} obra${artCatalog.length === 1 ? '' : 's'} disponible${artCatalog.length === 1 ? '' : 's'}`;
            catalogStatusEl.classList.add('loaded');
        } else {
            catalogStatusEl.textContent = 'Catálogo: No cargado';
            catalogStatusEl.classList.remove('loaded');
        }
    };

    const loadCatalog = () => {
        try {
            const storedCatalog = localStorage.getItem(CATALOG_STORAGE_KEY);
            if (storedCatalog) {
                const parsed = JSON.parse(storedCatalog);
                if (Array.isArray(parsed)) {
                    artCatalog = parsed;
                }
            }
        } catch (e) {
            console.error('Error al recuperar artCatalog de localStorage:', e);
            artCatalog = [];
        }
        updateCatalogStatusUI();
    };

    const saveCatalog = (catalogData) => {
        artCatalog = catalogData;
        try {
            localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(artCatalog));
        } catch (e) {
            console.error('Error al persistir artCatalog en localStorage:', e);
        }
        updateCatalogStatusUI();
    };
    
    // --- "ZONA DE PREPARACIÓN" PARA DECORACIONES ---
    let stagedDecorationType = 'arabesque';
    let stagedDecorationTop = null;
    let stagedDecorationBottom = null;
    let stagedNeutralLogo = null;

    // --- CONFIGURACIÓN ---
    const NEUTRAL_LOGO_DEFAULTS = { x_px: 230, y_px: 130, rotation: 0 };
    let labelWidthCm = 8, labelHeightCm = 6;

    const labelWidthInput = document.getElementById('label-width-input');
    const labelHeightInput = document.getElementById('label-height-input');

    const updateLabelDimensions = () => {
        labelWidthCm = parseFloat(labelWidthInput.value) || 8;
        labelHeightCm = parseFloat(labelHeightInput.value) || 6;
        document.documentElement.style.setProperty('--label-width-cm', labelWidthCm);
        document.documentElement.style.setProperty('--label-height-cm', labelHeightCm);
        renderLivePreview();
    };

    labelWidthInput.addEventListener('input', updateLabelDimensions);
    labelHeightInput.addEventListener('input', updateLabelDimensions);

    // --- PERSISTENCIA ---
    const saveState = () => {
        const dataToSave = { ...state, labelWidthCm, labelHeightCm };
        localStorage.setItem('artLabelGeneratorState', JSON.stringify(dataToSave));
    };

    const loadState = () => {
        const savedStateString = localStorage.getItem('artLabelGeneratorState');
        if (!savedStateString) return;
        
        let parsedState = JSON.parse(savedStateString);
        
        // --- Migración de datos viejos ---
        if (parsedState.labels && parsedState.labels.length > 0 && typeof parsedState.labels[0].decorationType === 'undefined') {
            console.log("Datos antiguos detectados. Migrando al nuevo formato...");
            parsedState.labels.forEach(label => {
                if (label.neutralLogo) {
                    label.decorationType = 'neutral';
                    if (typeof label.neutralLogo.x_px === 'undefined') {
                        label.neutralLogo = { ...NEUTRAL_LOGO_DEFAULTS, ...label.neutralLogo };
                    }
                } else {
                    label.decorationType = 'arabesque';
                }
            });
        }
        
        state = { 
            labels: parsedState.labels || [], 
            rooms: parsedState.rooms || [], 
            editingLabelId: null,
            styleConfig: parsedState.styleConfig ? JSON.parse(JSON.stringify(parsedState.styleConfig)) : JSON.parse(JSON.stringify(DEFAULT_STYLE_CONFIG))
        };

        if (state.styleConfig) {
            if (!state.styleConfig.fontFamily) state.styleConfig.fontFamily = DEFAULT_STYLE_CONFIG.fontFamily;
            if (state.styleConfig.baseFontSize === undefined) state.styleConfig.baseFontSize = DEFAULT_STYLE_CONFIG.baseFontSize;
        }

        if (parsedState.labelWidthCm) {
            labelWidthCm = parsedState.labelWidthCm;
            labelWidthInput.value = labelWidthCm;
        }
        if (parsedState.labelHeightCm) {
            labelHeightCm = parsedState.labelHeightCm;
            labelHeightInput.value = labelHeightCm;
        }
        updateLabelDimensions();
    };

    // --- LÓGICA DE RENDERIZADO ---
    const renderUI = () => {
        updateDecoControlsVisibility();
        syncStyleControlsUI();
        renderLivePreview();
        renderMiniatures();
        renderRooms();
    };

    const updateDecoControlsVisibility = () => {
        document.querySelectorAll('.radio-label').forEach(label => label.classList.remove('selected'));
        const selectedRadio = document.querySelector(`input[name="decoration-type"][value="${stagedDecorationType}"]`);
        if (selectedRadio) {
            selectedRadio.checked = true;
            selectedRadio.parentElement.classList.add('selected');
        }
        arabesqueControls.style.display = stagedDecorationType === 'arabesque' ? 'flex' : 'none';
        neutralLogoControls.style.display = stagedDecorationType === 'neutral' ? 'flex' : 'none';
    };

    const renderLivePreview = () => {
        livePreview.innerHTML = '';
        const data = getFormData();

        if (stagedDecorationType === 'arabesque') {
            // Arabesques in the clipping container
            const clip = document.createElement('div');
            clip.className = 'label-clipping-container';
            if (stagedDecorationTop) clip.innerHTML += `<img src="${stagedDecorationTop}" class="label-deco top">`;
            if (stagedDecorationBottom) clip.innerHTML += `<img src="${stagedDecorationBottom}" class="label-deco bottom">`;
            livePreview.appendChild(clip);
            logoPositionControls.style.display = 'none';
        } else if (stagedDecorationType === 'neutral' && stagedNeutralLogo) {
            const logo = stagedNeutralLogo;
            
            // The draggable logo outside the clipping container to allow handle visibility
            const zIndexVal = logo.z_index === 0 ? 0 : 10;
            const logoHTML = `<div class="image-wrapper draggable" style="left: ${logo.x_px}px; top: ${logo.y_px}px; width: ${logo.w_px}px; height: ${logo.h_px}px; transform: rotate(${logo.rotation || 0}rad); z-index: ${zIndexVal};">
                <img src="${logo.src}" class="label-neutral-logo" style="width: 100%; height: 100%;">
                <div class="resize-handle" title="Escalar"><i class="fas fa-expand-arrows-alt"></i></div>
                <div class="rotate-handle" title="Rotar"><i class="fas fa-redo"></i></div>
            </div>`;
            livePreview.insertAdjacentHTML('beforeend', logoHTML);

            // Add Snapping Guides (hidden by default)
            const vGuide = document.createElement('div'); vGuide.className = 'guide-line vertical'; vGuide.id = 'v-guide';
            const hGuide = document.createElement('div'); hGuide.className = 'guide-line horizontal'; hGuide.id = 'h-guide';
            livePreview.appendChild(vGuide);
            livePreview.appendChild(hGuide);

            logoPositionControls.style.display = 'block';
            logoPosXInput.value = Math.round(logo.x_px);
            logoPosYInput.value = Math.round(logo.y_px);
            const logoSizeWInput = document.getElementById('logo-size-w');
            const logoSizeHInput = document.getElementById('logo-size-h');
            if (logoSizeWInput) logoSizeWInput.value = Math.round(logo.w_px);
            if (logoSizeHInput) logoSizeHInput.value = Math.round(logo.h_px);
            const logoRotationDegInput = document.getElementById('logo-rotation-deg');
            if (logoRotationDegInput) logoRotationDegInput.value = Math.round((logo.rotation || 0) * (180 / Math.PI));
            
            // Update Layer Buttons Active State
            const backBtn = document.getElementById('layer-back-btn');
            const frontBtn = document.getElementById('layer-front-btn');
            if (backBtn && frontBtn) {
                if (logo.z_index === 0) {
                    backBtn.classList.add('active'); frontBtn.classList.remove('active');
                } else {
                    frontBtn.classList.add('active'); backBtn.classList.remove('active');
                }
            }
        } else {
            logoPositionControls.style.display = 'none';
        }

        // Always add Registration Marks (T-Marks) for Pre-vis
        renderRegistrationMarks(livePreview);
        
        // Add the text content safely with dynamic styleConfig (Gallery Style Pro Mode)
        const styleCfg = state.styleConfig || DEFAULT_STYLE_CONFIG;
        const textAlign = styleCfg.textAlign || 'center';
        const lineSpacing = styleCfg.lineSpacingMultiplier !== undefined ? styleCfg.lineSpacingMultiplier : 1.0;
        const currentFontKey = styleCfg.fontFamily || 'arial';
        const cssFontFamily = (FONT_MAP[currentFontKey] && FONT_MAP[currentFontKey].css) || FONT_MAP.arial.css;
        const baseFontSizePt = (typeof styleCfg.baseFontSize === 'number') ? styleCfg.baseFontSize : 12;
        const previewFontSizePx = Math.round(baseFontSizePt * 1.3333); // 1pt ≈ 1.3333px at 96 DPI
        const fieldsCfg = (styleCfg.fields || DEFAULT_STYLE_CONFIG.fields).reduce((acc, f) => {
            acc[f.id] = f;
            return acc;
        }, {});

        const getFieldStyle = (fieldId) => {
            const f = fieldsCfg[fieldId] || {};
            const weight = f.bold ? 'bold' : 'normal';
            const style = f.italic ? 'italic' : 'normal';
            const display = f.visible !== false ? 'block' : 'none';
            return `font-weight: ${weight}; font-style: ${style}; display: ${display};`;
        };

        const textContentHTML = `<div class="label-content-container" style="text-align: ${textAlign}; font-family: ${cssFontFamily}; font-size: ${previewFontSizePx}px;"><div class="label-text-block" style="line-height: ${lineSpacing};"><p class="label-author" style="${getFieldStyle('author')}">${data.author||''}</p><p class="label-title" style="${getFieldStyle('title')}">${data.title||''}</p><p class="label-date" style="${getFieldStyle('date')}">${data.date||''}</p><p class="label-technique" style="${getFieldStyle('technique')}">${data.technique||''}</p><p class="label-measurements" style="${getFieldStyle('measurements')}">${data.measurements||''}</p></div></div><p class="label-asset-number">${data.assetNumber||''}</p>`;
        livePreview.insertAdjacentHTML('beforeend', textContentHTML);

        if (stagedDecorationType === 'neutral' && stagedNeutralLogo) {
            initLogoDrag();
        }
    };
    
    const getFormData = () => ({
        author: document.getElementById('author').value, title: document.getElementById('title').value,
        date: document.getElementById('date').value, technique: document.getElementById('technique').value,
        measurements: document.getElementById('measurements').value, assetNumber: document.getElementById('asset-number').value,
        id: document.getElementById('label-id').value
    });
    
    // --- MANEJO DE EVENTOS ---
    decoTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            stagedDecorationType = e.target.value;
            updateDecoControlsVisibility();
            renderLivePreview();
        });
    });

    form.addEventListener('input', renderLivePreview);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = getFormData();
        const labelData = {
            ...data,
            decorationType: stagedDecorationType,
            decorationTop: stagedDecorationType === 'arabesque' ? stagedDecorationTop : null,
            decorationBottom: stagedDecorationType === 'arabesque' ? stagedDecorationBottom : null,
            neutralLogo: stagedDecorationType === 'neutral' ? stagedNeutralLogo : null,
        };
        if (state.editingLabelId) {
            const index = state.labels.findIndex(l => l.id === state.editingLabelId);
            if (index > -1) {
                const originalLabel = state.labels[index];
                labelData.roomId = originalLabel.roomId; 
                state.labels[index] = labelData;
            }
            state.editingLabelId = null;
            form.querySelector('.submit-btn').innerHTML = '<i class="fas fa-save"></i> Guardar Rótulo';
            cancelEditBtn.style.display = 'none';
        } else {
            labelData.id = `label-${Date.now()}`;
            labelData.roomId = null;
            state.labels.push(labelData);
        }
        
        form.reset();
        
        saveState();
        renderMiniatures();
        renderRooms();
        renderLivePreview();
    });

    cancelEditBtn.addEventListener('click', () => {
        state.editingLabelId = null;
        form.reset();
        stagedDecorationType = 'arabesque';
        stagedDecorationTop = null;
        stagedDecorationBottom = null;
        stagedNeutralLogo = null;
        document.getElementById('deco-top-input').value = '';
        document.getElementById('deco-bottom-input').value = '';
        document.getElementById('deco-neutral-input').value = '';
        updateDecoControlsVisibility();
        form.querySelector('.submit-btn').innerHTML = '<i class="fas fa-save"></i> Guardar Rótulo';
        cancelEditBtn.style.display = 'none';
        renderLivePreview();
    });


    //MANEJO DEL TAMAÑO DEL LOGO INDIVIDUAL   /////////////////////////////

    const setupDecoInput = (inputId, decoType) => {
        const input = document.getElementById(inputId);
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target.result;

                if (decoType === 'neutral') {
                    const img = new Image();
                    img.onload = () => {
                        const maxWidth = 75;  //TAMAÑO DEL LOGO INDIVIDUAL
                        const maxHeight = 65; //TAMAÑO DEL LOGO INDIVIDUAL
                        let ratio = Math.min(maxWidth / img.naturalWidth, maxHeight / img.naturalHeight);
                        let width = img.naturalWidth * ratio;
                        let height = img.naturalHeight * ratio;

                        stagedNeutralLogo = { 
                            src: imageUrl, 
                            ...NEUTRAL_LOGO_DEFAULTS,
                            w_px: width,
                            h_px: height
                        };
                        renderLivePreview();
                    };
                    img.src = imageUrl;
                } else {
                    if (decoType === 'top') stagedDecorationTop = imageUrl;
                    if (decoType === 'bottom') stagedDecorationBottom = imageUrl;
                    renderLivePreview();
                }
            };
            reader.readAsDataURL(file);
        });
    };

    setupDecoInput('deco-top-input', 'top');
    setupDecoInput('deco-bottom-input', 'bottom');
    setupDecoInput('deco-neutral-input', 'neutral');

    document.querySelectorAll('.delete-deco-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const decoType = btn.dataset.deco;
            switch (decoType) {
                case 'top': stagedDecorationTop = null; document.getElementById('deco-top-input').value = ''; break;
                case 'bottom': stagedDecorationBottom = null; document.getElementById('deco-bottom-input').value = ''; break;
                case 'neutral': stagedNeutralLogo = null; document.getElementById('deco-neutral-input').value = ''; break;
            }
            renderLivePreview();
        });
    });

    resetLogoPosBtn.addEventListener('click', () => {
        if (stagedNeutralLogo) {
            stagedNeutralLogo.x_px = NEUTRAL_LOGO_DEFAULTS.x_px;
            stagedNeutralLogo.y_px = NEUTRAL_LOGO_DEFAULTS.y_px;
            renderLivePreview();
        }
    });

    // Update logo from position inputs with boundary clamping
    logoPosXInput.addEventListener('input', () => {
        if (!stagedNeutralLogo) return;
        const previewRect = livePreview.getBoundingClientRect();
        const maxW = previewRect.width || parseFloat(livePreview.style.width) || (state.labelWidthCm * 37.79) || 300;
        const rawX = parseFloat(logoPosXInput.value) || 0;
        const maxX = Math.max(0, maxW - (stagedNeutralLogo.w_px || 0));
        const clampedX = Math.max(0, Math.min(rawX, maxX));
        stagedNeutralLogo.x_px = clampedX;
        renderLivePreview();
    });
    logoPosYInput.addEventListener('input', () => {
        if (!stagedNeutralLogo) return;
        const previewRect = livePreview.getBoundingClientRect();
        const maxH = previewRect.height || parseFloat(livePreview.style.height) || (state.labelHeightCm * 37.79) || 200;
        const rawY = parseFloat(logoPosYInput.value) || 0;
        const maxY = Math.max(0, maxH - (stagedNeutralLogo.h_px || 0));
        const clampedY = Math.max(0, Math.min(rawY, maxY));
        stagedNeutralLogo.y_px = clampedY;
        renderLivePreview();
    });
    
    // Width input — proportional scaling with bounding box clamping
    const logoSizeWInput = document.getElementById('logo-size-w');
    logoSizeWInput.addEventListener('input', () => {
        if (!stagedNeutralLogo) return;
        const previewRect = livePreview.getBoundingClientRect();
        const maxW = previewRect.width || parseFloat(livePreview.style.width) || (state.labelWidthCm * 37.79) || 300;
        const maxH = previewRect.height || parseFloat(livePreview.style.height) || (state.labelHeightCm * 37.79) || 200;
        const aspectRatio = stagedNeutralLogo.h_px / (stagedNeutralLogo.w_px || 1);
        let requestedW = parseFloat(logoSizeWInput.value) || 5;
        requestedW = Math.max(5, Math.min(requestedW, maxW));
        let calculatedH = requestedW * aspectRatio;
        if (calculatedH > maxH) {
            calculatedH = maxH;
            requestedW = calculatedH / aspectRatio;
        }
        // Adjust position if width/height now exceeds label boundaries
        if (stagedNeutralLogo.x_px + requestedW > maxW) {
            stagedNeutralLogo.x_px = Math.max(0, maxW - requestedW);
        }
        if (stagedNeutralLogo.y_px + calculatedH > maxH) {
            stagedNeutralLogo.y_px = Math.max(0, maxH - calculatedH);
        }
        stagedNeutralLogo.w_px = requestedW;
        stagedNeutralLogo.h_px = calculatedH;
        renderLivePreview();
    });

    // Rotation Sync (Manual degree input)
    const logoRotationDegInput = document.getElementById('logo-rotation-deg');
    logoRotationDegInput.addEventListener('input', () => {
        if (!stagedNeutralLogo) return;
        const deg = parseFloat(logoRotationDegInput.value) || 0;
        stagedNeutralLogo.rotation = deg * (Math.PI / 180);
        const wrapper = document.querySelector('.image-wrapper.draggable');
        if (wrapper) wrapper.style.transform = `rotate(${stagedNeutralLogo.rotation}rad)`;
    });

    // Layer Management
    document.getElementById('layer-back-btn').addEventListener('click', () => {
        if (!stagedNeutralLogo) return;
        stagedNeutralLogo.z_index = 0;
        renderLivePreview();
    });
    document.getElementById('layer-front-btn').addEventListener('click', () => {
        if (!stagedNeutralLogo) return;
        stagedNeutralLogo.z_index = 10;
        renderLivePreview();
    });

    const initLogoDrag = () => {
        const wrapper = livePreview.querySelector('.image-wrapper.draggable');
        if (!wrapper) return;

        const vGuide = livePreview.querySelector('#v-guide');
        const hGuide = livePreview.querySelector('#h-guide');

        let isDragging = false, isResizing = false, isRotating = false;
        let startX, startY;
        let startLeft, startTop, startW, startH, startRot;
        let centerX, centerY;
        
        const SNAP_THRESHOLD = 5; // Pixels distance to snap

        const handleDown = (e, action) => {
            e.preventDefault();
            e.stopPropagation();
            if (action === 'drag') isDragging = true;
            if (action === 'resize') isResizing = true;
            if (action === 'rotate') {
                isRotating = true;
                const rect = wrapper.getBoundingClientRect();
                centerX = rect.left + rect.width / 2;
                centerY = rect.top + rect.height / 2;
            }

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            startX = clientX; startY = clientY;
            startLeft = stagedNeutralLogo.x_px;
            startTop = stagedNeutralLogo.y_px;
            startW = stagedNeutralLogo.w_px;
            startH = stagedNeutralLogo.h_px;
            startRot = stagedNeutralLogo.rotation || 0;

            if (isDragging) wrapper.classList.add('dragging');

            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleUp);
            document.addEventListener('touchmove', handleMove, { passive: false });
            document.addEventListener('touchend', handleUp);
        };

        const handleMove = (e) => {
            if (!isDragging && !isResizing && !isRotating) return;
            e.preventDefault();
            
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            if (isDragging) {
                const previewRect = livePreview.getBoundingClientRect();
                const maxW = previewRect.width;
                const maxH = previewRect.height;
                let newX = startLeft + (clientX - startX);
                let newY = startTop + (clientY - startY);
                
                // Pre-snap bounding box clamping
                const maxX = Math.max(0, maxW - startW);
                const maxY = Math.max(0, maxH - startH);
                newX = Math.max(0, Math.min(newX, maxX));
                newY = Math.max(0, Math.min(newY, maxY));
                
                // SNAPPING LOGIC
                const midX = newX + startW / 2;
                const midY = newY + startH / 2;
                const previewMidX = maxW / 2;
                const previewMidY = maxH / 2;

                let snappedV = false, snappedH = false;

                // Snap to Vertical Center
                if (Math.abs(midX - previewMidX) < SNAP_THRESHOLD) {
                    newX = previewMidX - startW / 2;
                    snappedV = true;
                }
                // Snap to Horizontal Center
                if (Math.abs(midY - previewMidY) < SNAP_THRESHOLD) {
                    newY = previewMidY - startH / 2;
                    snappedH = true;
                }

                // Post-snap bounding box clamping to guarantee zero overflow
                newX = Math.max(0, Math.min(newX, maxX));
                newY = Math.max(0, Math.min(newY, maxY));

                // Visual boundary edge indicator
                const atEdge = (newX <= 0 || newX >= maxX || newY <= 0 || newY >= maxY);
                if (atEdge) {
                    wrapper.classList.add('edge-clamped');
                } else {
                    wrapper.classList.remove('edge-clamped');
                }

                // Show Guides
                if (vGuide) {
                    vGuide.style.display = snappedV ? 'block' : 'none';
                    vGuide.style.left = `${previewMidX}px`;
                }
                if (hGuide) {
                    hGuide.style.display = snappedH ? 'block' : 'none';
                    hGuide.style.top = `${previewMidY}px`;
                }

                stagedNeutralLogo.x_px = newX;
                stagedNeutralLogo.y_px = newY;
                wrapper.style.left = `${newX}px`;
                wrapper.style.top = `${newY}px`;
                
                logoPosXInput.value = Math.round(newX);
                logoPosYInput.value = Math.round(newY);
            } else if (isResizing) {
                const previewRect = livePreview.getBoundingClientRect();
                const maxW = previewRect.width;
                const maxH = previewRect.height;
                const aspectRatio = startH / (startW || 1);

                let dx = clientX - startX;
                let dy = clientY - startY;
                // Use the largest movement vector to determine scale
                let moveAmount = Math.abs(dx) > Math.abs(dy) ? dx : dy;
                let scale = Math.max(0.1, (startW + moveAmount) / startW);
                
                let newW = Math.max(5, startW * scale);
                let newH = newW * aspectRatio;

                // Clamping de redimensionamiento (Resize): cannot exceed total label dimensions
                if (newW > maxW) {
                    newW = maxW;
                    newH = newW * aspectRatio;
                }
                if (newH > maxH) {
                    newH = maxH;
                    newW = newH / aspectRatio;
                }

                // If newX + newW > previewRect.width, readjust newX or clamp newW to stay strictly inside printable area
                let currentX = stagedNeutralLogo.x_px;
                let currentY = stagedNeutralLogo.y_px;
                if (currentX + newW > maxW) {
                    currentX = Math.max(0, maxW - newW);
                    stagedNeutralLogo.x_px = currentX;
                    wrapper.style.left = `${currentX}px`;
                    logoPosXInput.value = Math.round(currentX);
                }
                if (currentY + newH > maxH) {
                    currentY = Math.max(0, maxH - newH);
                    stagedNeutralLogo.y_px = currentY;
                    wrapper.style.top = `${currentY}px`;
                    logoPosYInput.value = Math.round(currentY);
                }

                const atEdge = (newW >= maxW || newH >= maxH || currentX <= 0 || currentY <= 0 || currentX + newW >= maxW || currentY + newH >= maxH);
                if (atEdge) {
                    wrapper.classList.add('edge-clamped');
                } else {
                    wrapper.classList.remove('edge-clamped');
                }

                stagedNeutralLogo.w_px = newW;
                stagedNeutralLogo.h_px = newH;
                wrapper.style.width = `${newW}px`;
                wrapper.style.height = `${newH}px`;
                
                const wInput = document.getElementById('logo-size-w');
                const hInput = document.getElementById('logo-size-h');
                if (wInput) wInput.value = Math.round(newW);
                if (hInput) hInput.value = Math.round(newH);
            } else if (isRotating) {
                let currentAngle = Math.atan2(clientY - centerY, clientX - centerX);
                let startAngle = Math.atan2(startY - centerY, startX - centerX);
                let newRot = startRot + (currentAngle - startAngle);
                
                // Rotation Snapping (every 45 degrees / PI/4)
                const snapAngle = Math.PI / 4;
                if (Math.abs(newRot % snapAngle) < 0.1) {
                    newRot = Math.round(newRot / snapAngle) * snapAngle;
                }

                stagedNeutralLogo.rotation = newRot;
                wrapper.style.transform = `rotate(${newRot}rad)`;
                logoRotationDegInput.value = Math.round(newRot * (180 / Math.PI));
            }
        };

        const handleUp = () => {
            if (isDragging) wrapper.classList.remove('dragging');
            wrapper.classList.remove('edge-clamped');
            if (vGuide) vGuide.style.display = 'none';
            if (hGuide) hGuide.style.display = 'none';
            isDragging = false; isResizing = false; isRotating = false;
            
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleUp);
        };

        wrapper.addEventListener('mousedown', (e) => handleDown(e, 'drag'));
        wrapper.addEventListener('touchstart', (e) => handleDown(e, 'drag'), { passive: false });

        const resizeHandle = wrapper.querySelector('.resize-handle');
        const rotateHandle = wrapper.querySelector('.rotate-handle');

        if (resizeHandle) {
            resizeHandle.addEventListener('mousedown', (e) => handleDown(e, 'resize'));
            resizeHandle.addEventListener('touchstart', (e) => handleDown(e, 'resize'), { passive: false });
        }
        
        if (rotateHandle) {
            rotateHandle.addEventListener('mousedown', (e) => handleDown(e, 'rotate'));
            rotateHandle.addEventListener('touchstart', (e) => handleDown(e, 'rotate'), { passive: false });
        }
    };

    // Registration Marks Drawing for Preview
    function renderRegistrationMarks(container) {
        const marks = [
            { top: 0, left: 0, classes: ['v', 'h'] },
            { top: 0, right: 0, classes: ['v', 'h'] },
            { bottom: 0, left: 0, classes: ['v', 'h'] },
            { bottom: 0, right: 0, classes: ['v', 'h'] }
        ];

        marks.forEach(m => {
            const markV = document.createElement('div');
            markV.className = 'reg-mark v';
            if ('top' in m) markV.style.top = '-5px';
            if ('bottom' in m) markV.style.bottom = '-5px';
            if ('left' in m) markV.style.left = '0px';
            if ('right' in m) markV.style.right = '0px';
            container.appendChild(markV);

            const markH = document.createElement('div');
            markH.className = 'reg-mark h';
            if ('top' in m) markH.style.top = '0px';
            if ('bottom' in m) markH.style.bottom = '0px';
            if ('left' in m) markH.style.left = '-5px';
            if ('right' in m) markH.style.right = '-5px';
            container.appendChild(markH);
        });
    }

    // --- PAGE GRID STATUS (Phase 3) ---
    const updatePrintStatus = () => {
        const widget = document.getElementById('print-status-widget');
        if (!widget) return;

        const totalLabels = state.labels.length;
        const totalPages = Math.ceil(totalLabels / 8);
        const lastPageFill = totalLabels % 8 || (totalLabels > 0 ? 8 : 0);

        let gridHTML = '<div class="mini-map-grid">';
        for (let i = 0; i < 8; i++) {
            const isFilled = i < lastPageFill;
            gridHTML += `<div class="mini-slot ${isFilled ? 'filled' : ''}"></div>`;
        }
        gridHTML += '</div>';

        widget.innerHTML = `
            ${gridHTML}
            <div class="status-counts">
                <span><b>${totalLabels}</b> Rótulos</span>
                <span><b>${totalPages}</b> ${totalPages === 1 ? 'Página' : 'Páginas'}</span>
            </div>
        `;
    };

    // --- GESTIÓN DE RÓTULOS (MINIATURAS, EDICIÓN, ELIMINACIÓN) ---
    const renderMiniatures = () => {
        miniaturesArea.innerHTML = '';
        updatePrintStatus();
        const unassignedLabels = state.labels.filter(l => !l.roomId);
        if (unassignedLabels.length === 0) {
            miniaturesArea.innerHTML = '<p class="helper-text">No hay rótulos aquí. ¡Crea uno nuevo!</p>';
        } else {
            unassignedLabels.forEach(label => miniaturesArea.appendChild(createMiniatureElement(label)));
        }
    };

    const createMiniatureElement = (label) => {
        const div = document.createElement('div');
        div.className = 'miniature-label';
        div.draggable = true;
        div.dataset.labelId = label.id;
        div.innerHTML = `<p class="miniature-author">${label.author}</p><p class="miniature-title">${label.title}</p><div class="miniature-actions"><button class="move-btn" title="Mover a Cuarto"><i class="fas fa-folder-plus"></i></button><button class="edit-btn" title="Editar"><i class="fas fa-pencil-alt"></i></button><button class="delete-btn" title="Eliminar"><i class="fas fa-trash"></i></button></div>`;
        div.querySelector('.move-btn').addEventListener('click', () => openMoveModal(label.id));
        div.querySelector('.edit-btn').addEventListener('click', () => editLabel(label.id));
        div.querySelector('.delete-btn').addEventListener('click', () => deleteLabel(label.id));
        div.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', label.id); setTimeout(() => div.style.opacity = '0.5', 0); });
        div.addEventListener('dragend', () => div.style.opacity = '1');
        return div;
    };

    const editLabel = (id) => {
        const label = state.labels.find(l => l.id === id);
        if (!label) return;
        
        const roomModal = document.getElementById('room-modal');
        if (roomModal.style.display === "block") {
            roomModal.style.display = "none";
        }

        state.editingLabelId = id;
        document.getElementById('label-id').value = label.id;
        document.getElementById('author').value = label.author;
        document.getElementById('title').value = label.title;
        document.getElementById('date').value = label.date;
        document.getElementById('technique').value = label.technique;
        document.getElementById('measurements').value = label.measurements;
        document.getElementById('asset-number').value = label.assetNumber;
        stagedDecorationType = label.decorationType || 'arabesque';
        stagedDecorationTop = label.decorationTop || null;
        stagedDecorationBottom = label.decorationBottom || null;
        stagedNeutralLogo = label.neutralLogo ? { ...NEUTRAL_LOGO_DEFAULTS, ...label.neutralLogo } : null;
        
        updateDecoControlsVisibility();
        form.querySelector('.submit-btn').innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar Rótulo';
        cancelEditBtn.style.display = 'inline-block';
        renderLivePreview();
        window.scrollTo(0, 0);
    };

    const deleteLabel = async (id) => {
        const labelToDelete = state.labels.find(l => l.id === id);
        if (!labelToDelete) return;

        const roomId = labelToDelete.roomId;

        const confirmed = await showConfirmModal(`¿Estás seguro de que quieres eliminar el rótulo "<strong>${labelToDelete.title}</strong>"?`);
        if (confirmed) {
            state.labels = state.labels.filter(l => l.id !== id);
            saveState();
            renderUI();

            const modal = document.getElementById('room-modal');
            if (modal.style.display === "block" && roomId && modal.dataset.viewingRoomId === roomId) {
                openRoomModal(roomId);
            }
        }
    };

    // --- GESTIÓN DE CUARTOS ---
    addRoomForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const roomNameInput = document.getElementById('room-name-input');
        const name = roomNameInput.value.trim();
        if (name) { state.rooms.push({ id: `room-${Date.now()}`, name }); roomNameInput.value = ''; saveState(); renderRooms(); }
    });

    const renderRooms = () => {
        roomsContainer.innerHTML = '';
        state.rooms.forEach(room => {
            const roomDiv = document.createElement('div');
            roomDiv.className = 'room drop-zone';
            roomDiv.dataset.roomId = room.id;
            const labelsInRoom = state.labels.filter(l => l.roomId === room.id);
            roomDiv.innerHTML = `<div class="room-header"><h3><i class="fas fa-chevron-down toggle-icon"></i>${room.name} (${labelsInRoom.length})</h3><div class="room-actions"><button class="view-room-btn" title="Ver en detalle"><i class="fas fa-eye"></i></button><button class="delete-room-btn" title="Eliminar Cuarto"><i class="fas fa-trash-alt"></i></button></div></div><div class="room-content"></div>`;
            const roomContent = roomDiv.querySelector('.room-content');
            if (labelsInRoom.length === 0) roomContent.innerHTML = '<p class="helper-text" style="grid-column: 1 / -1;">Este cuarto está vacío.</p>';
            else labelsInRoom.forEach(label => roomContent.appendChild(createMiniatureElement(label)));
            roomDiv.querySelector('.room-header').addEventListener('click', (e) => { if (!e.target.closest('.room-actions')) roomDiv.classList.toggle('expanded'); });
            roomDiv.querySelector('.view-room-btn').addEventListener('click', () => openRoomModal(room.id));
            roomDiv.querySelector('.delete-room-btn').addEventListener('click', () => deleteRoom(room.id));
            roomDiv.addEventListener('dragover', e => { e.preventDefault(); roomDiv.classList.add('drag-over'); });
            roomDiv.addEventListener('dragleave', () => roomDiv.classList.remove('drag-over'));
            roomDiv.addEventListener('drop', e => {
                e.preventDefault();
                roomDiv.classList.remove('drag-over');
                const labelId = e.dataTransfer.getData('text/plain');
                const label = state.labels.find(l => l.id === labelId);
                if (label) { label.roomId = room.id; saveState(); renderUI(); }
            });
            roomsContainer.appendChild(roomDiv);
        });
    };

    const deleteRoom = async (id) => {
        const roomToDelete = state.rooms.find(r => r.id === id);
        if (!roomToDelete) return;
        const confirmed = await showConfirmModal(`¿Seguro que quieres eliminar el cuarto "<strong>${roomToDelete.name}</strong>"?<br>Los rótulos que contiene volverán al área de "Sin Asignar".`);
        if (confirmed) {
            state.labels.forEach(label => { if(label.roomId === id) label.roomId = null; });
            state.rooms = state.rooms.filter(r => r.id !== id);
            saveState();
            renderUI();
        }
    };

    // --- MODALES ---
    const openRoomModal = (roomId) => {
        const room = state.rooms.find(r => r.id === roomId);
        if (!room) return;
        const modal = document.getElementById('room-modal');
        modal.dataset.viewingRoomId = roomId;
        const modalRoomName = document.getElementById('modal-room-name');
        const modalRoomLabels = document.getElementById('modal-room-labels');
        modalRoomName.textContent = room.name;
        modalRoomLabels.innerHTML = '';
        const labelsInRoom = state.labels.filter(l => l.roomId === roomId);

        if (labelsInRoom.length === 0) {
            modalRoomLabels.innerHTML = '<p class="helper-text" style="grid-column: 1 / -1;">Este cuarto está vacío.</p>';
        } else {
            document.getElementById('generate-room-pdf-btn').onclick = async () => await generatePDF(labelsInRoom);
            labelsInRoom.forEach(label => {
                const container = document.createElement('div');
                container.className = 'modal-label-container';
                const labelPreview = document.createElement('div');
                labelPreview.className = 'label-preview';
                const type = label.decorationType || 'arabesque';
                if (type === 'arabesque') {
                    if (label.decorationTop) labelPreview.innerHTML += `<img src="${label.decorationTop}" class="label-deco top">`;
                    if (label.decorationBottom) labelPreview.innerHTML += `<img src="${label.decorationBottom}" class="label-deco bottom">`;
                } else if (type === 'neutral' && label.neutralLogo) {
                    const logo = label.neutralLogo;
                    labelPreview.innerHTML += `<div class="image-wrapper" style="left: ${logo.x_px}px; top: ${logo.y_px}px; width: ${logo.w_px}px; height: ${logo.h_px}px; transform: rotate(${logo.rotation || 0}rad);">
                        <img src="${logo.src}" class="label-neutral-logo" style="width: 100%; height: 100%;">
                    </div>`;
                }
                labelPreview.innerHTML += `<div class="label-content-container"><div class="label-text-block"><p class="label-author">${label.author}</p><p class="label-title">${label.title}</p><p class="label-date">${label.date}</p><p class="label-technique">${label.technique}</p><p class="label-measurements">${label.measurements}</p></div></div><p class="label-asset-number">${label.assetNumber}</p>`;
                const actions = document.createElement('div');
                actions.className = 'miniature-actions';
                actions.innerHTML = `<button class="edit-btn" title="Editar"><i class="fas fa-pencil-alt"></i></button><button class="delete-btn" title="Eliminar"><i class="fas fa-trash"></i></button>`;
                actions.querySelector('.edit-btn').addEventListener('click', () => editLabel(label.id));
                actions.querySelector('.delete-btn').addEventListener('click', () => deleteLabel(label.id));
                container.appendChild(labelPreview);
                container.appendChild(actions);
                modalRoomLabels.appendChild(container);
            });
        }
        modal.style.display = "block";
    };

    const showConfirmModal = (message) => {
        return new Promise(resolve => {
            confirmModalText.innerHTML = message;
            confirmModal.style.display = 'flex';
            setTimeout(() => confirmModal.classList.add('visible'), 10);
            const close = (value) => {
                confirmModal.classList.remove('visible');
                setTimeout(() => {
                    confirmModal.style.display = 'none';
                    confirmBtn.onclick = null; cancelBtn.onclick = null;
                    resolve(value);
                }, 300);
            };
            confirmBtn.onclick = () => close(true);
            cancelBtn.onclick = () => close(false);
        });
    };
    
    moveToRoomModal.querySelector('.close-modal-btn').onclick = () => moveToRoomModal.style.display = 'none';
    document.getElementById('room-modal').querySelector('.close-modal-btn').onclick = () => document.getElementById('room-modal').style.display = "none";
    window.onclick = (e) => {
        if (e.target == document.getElementById('room-modal') || e.target == moveToRoomModal) {
            e.target.style.display = "none";
        }
    };

    const openMoveModal = (labelId) => {
        const label = state.labels.find(l => l.id === labelId);
        if (!label) return;
        moveToRoomModal.dataset.labelId = labelId;
        moveModalFilter.value = '';
        populateRoomList();
        moveToRoomModal.style.display = 'flex';
    };

    const populateRoomList = (filter = '') => {
        moveModalRoomList.innerHTML = '';
        const filteredRooms = state.rooms.filter(room => room.name.toLowerCase().includes(filter.toLowerCase()));
        if (filteredRooms.length === 0) {
            moveModalRoomList.innerHTML = '<li class="disabled" style="cursor:default; text-align:center; color:#999;">No se encontraron cuartos.</li>';
        } else {
            filteredRooms.forEach(room => {
                const li = document.createElement('li');
                li.textContent = room.name;
                li.dataset.roomId = room.id;
                li.addEventListener('click', () => {
                    const labelId = moveToRoomModal.dataset.labelId;
                    const labelToMove = state.labels.find(l => l.id === labelId);
                    if (labelToMove) {
                        labelToMove.roomId = room.id;
                        saveState();
                        renderUI();
                        moveToRoomModal.style.display = 'none';
                    }
                });
                moveModalRoomList.appendChild(li);
            });
        }
    };

    moveModalFilter.addEventListener('input', (e) => {
        populateRoomList(e.target.value);
    });

        // --- BÚSQUEDA Y ACCIONES GLOBALES ---
    const populateFormWithArtData = (artData) => {
        document.getElementById('author').value = artData.author || '';
        document.getElementById('title').value = artData.title || '';
        document.getElementById('date').value = artData.date || '';
        document.getElementById('technique').value = artData.technique || '';
        document.getElementById('measurements').value = artData.measurements || '';
        document.getElementById('asset-number').value = artData.asset_number || artData.id || '';
        renderLivePreview();
    };

    const findArtInCatalog = (catalogList, targetAssetNumber) => {
        if (!Array.isArray(catalogList) || catalogList.length === 0) return null;
        const normalizedTarget = String(targetAssetNumber).trim().toLowerCase();
        return catalogList.find(item => {
            if (!item) return false;
            const rawAsset = item.asset_number !== undefined ? item.asset_number : item.id;
            if (rawAsset === undefined || rawAsset === null) return false;
            const assetNumbers = String(rawAsset).split('/');
            return assetNumbers.some(n => n.trim().toLowerCase() === normalizedTarget);
        }) || null;
    };

    searchAssetBtn.addEventListener('click', async () => {
        const assetNumberInput = document.getElementById('asset-number').value.trim();
        if (!assetNumberInput) return alert('Por favor, introduce un Número de Bien para buscar.');

        // 1. Buscar en el catálogo local persistido / en memoria
        if (Array.isArray(artCatalog) && artCatalog.length > 0) {
            const foundArt = findArtInCatalog(artCatalog, assetNumberInput);
            if (foundArt) {
                populateFormWithArtData(foundArt);
                return;
            }
            alert('Número de Bien no encontrado en el catálogo cargado.');
            return;
        }

        // 2. Si no hay catálogo cargado, intentar fetch fallback (data.json o ejemplo-catalogo.json)
        let fallbackCatalog = null;
        try {
            const responseData = await fetch('data.json');
            if (responseData.ok) {
                fallbackCatalog = await responseData.json();
            }
        } catch (e) {
            // Silencioso
        }

        if (!fallbackCatalog) {
            try {
                const responseExample = await fetch('ejemplo-catalogo.json');
                if (responseExample.ok) {
                    fallbackCatalog = await responseExample.json();
                }
            } catch (e) {
                // Silencioso
            }
        }

        if (Array.isArray(fallbackCatalog) && fallbackCatalog.length > 0) {
            const foundArt = findArtInCatalog(fallbackCatalog, assetNumberInput);
            if (foundArt) {
                populateFormWithArtData(foundArt);
                return;
            }
            alert('Número de Bien no encontrado en la base de datos.');
            return;
        }

        // 3. Fallback final si no hay ningún catálogo disponible
        alert("No hay catálogo de obras cargado. Por favor, usa el botón 'Import Catalog' para cargar tu archivo .json de obras o ingresa los datos manualmente.");
    });

    clearAllBtn.addEventListener('click', async () => {
        const confirmed = await showConfirmModal('¿Estás seguro de que quieres borrar <strong>TODO</strong> tu trabajo? Esto incluye todos los rótulos y cuartos.');
        if (confirmed) {
            state = { labels: [], rooms: [], editingLabelId: null };
            stagedDecorationType = 'arabesque';
            stagedDecorationTop = null; stagedDecorationBottom = null; stagedNeutralLogo = null;
            localStorage.removeItem('artLabelGeneratorState');
            form.reset();
            document.getElementById('deco-top-input').value = '';
            document.getElementById('deco-bottom-input').value = '';
            document.getElementById('deco-neutral-input').value = '';
            renderUI();
        }
    });

    exportProjectBtn.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        const dateStr = new Date().toISOString().split('T')[0];
        downloadAnchorNode.setAttribute("download", `Rotulos_${dateStr}.artlabel`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    importProjectBtn.addEventListener('click', () => importProjectInput.click());

    // ═══════════════════════════════════════════════════════════════════════════
    // ASISTENTE DE IMPORTACIÓN MASIVA (TASK-013)
    // ═══════════════════════════════════════════════════════════════════════════
    const openImportWizardBtn = document.getElementById('open-import-wizard-btn');
    const importWizardModal = document.getElementById('import-wizard-modal');
    const importWizardCloseBtn = document.getElementById('import-wizard-close-btn');
    const wizardTabs = document.querySelectorAll('.wizard-tab');
    const wizardTabPaste = document.getElementById('wizard-tab-paste');
    const wizardTabFile = document.getElementById('wizard-tab-file');
    const wizardPasteArea = document.getElementById('wizard-paste-area');
    const wizardDetectBtn = document.getElementById('wizard-detect-btn');
    const wizardFileDropZone = document.getElementById('wizard-file-drop-zone');
    const wizardFileInput = document.getElementById('wizard-file-input');
    const wizardBrowseBtn = document.getElementById('wizard-browse-btn');
    const wizardPreviewArea = document.getElementById('wizard-preview-area');
    const wizardMappingInfo = document.getElementById('wizard-mapping-info');
    const wizardPreviewCount = document.getElementById('wizard-preview-count');
    const wizardPreviewThead = document.getElementById('wizard-preview-thead');
    const wizardPreviewTbody = document.getElementById('wizard-preview-tbody');
    const wizardWarnings = document.getElementById('wizard-warnings');
    const wizardConfirmBtn = document.getElementById('wizard-confirm-btn');
    const wizardConfirmLabel = document.getElementById('wizard-confirm-label');
    const wizardClearBtn = document.getElementById('wizard-clear-btn');

    let wizardParsedData = null;

    const escapeHtml = (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    };

    const resetWizardUI = () => {
        wizardParsedData = null;
        if (wizardPasteArea) wizardPasteArea.value = '';
        if (wizardFileInput) wizardFileInput.value = '';
        if (wizardPreviewArea) wizardPreviewArea.style.display = 'none';
        if (wizardMappingInfo) wizardMappingInfo.innerHTML = '';
        if (wizardPreviewThead) wizardPreviewThead.innerHTML = '';
        if (wizardPreviewTbody) wizardPreviewTbody.innerHTML = '';
        if (wizardWarnings) {
            wizardWarnings.style.display = 'none';
            wizardWarnings.innerHTML = '';
        }
    };

    const closeImportWizard = () => {
        if (importWizardModal) importWizardModal.style.display = 'none';
        resetWizardUI();
    };

    const openImportWizard = () => {
        if (importWizardModal) {
            resetWizardUI();
            importWizardModal.style.display = 'flex';
            if (wizardTabs.length > 0) wizardTabs[0].click();
        }
    };

    if (openImportWizardBtn) {
        openImportWizardBtn.addEventListener('click', openImportWizard);
    }

    if (importWizardCloseBtn) {
        importWizardCloseBtn.addEventListener('click', closeImportWizard);
    }

    if (importWizardModal) {
        importWizardModal.addEventListener('click', (e) => {
            if (e.target === importWizardModal) closeImportWizard();
        });
    }

    // Tabs switching
    wizardTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            wizardTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            const tabName = tab.dataset.tab;
            if (tabName === 'paste') {
                if (wizardTabPaste) wizardTabPaste.style.display = 'block';
                if (wizardTabFile) wizardTabFile.style.display = 'none';
                if (wizardPasteArea) wizardPasteArea.focus();
            } else if (tabName === 'file') {
                if (wizardTabPaste) wizardTabPaste.style.display = 'none';
                if (wizardTabFile) wizardTabFile.style.display = 'block';
            }
        });
    });

    const displayWizardPreview = (parseResult) => {
        if (!parseResult || !parseResult.artLabels || parseResult.artLabels.length === 0) {
            if (wizardPreviewArea) wizardPreviewArea.style.display = 'block';
            if (wizardPreviewCount) wizardPreviewCount.textContent = '0 obras detectadas';
            if (wizardConfirmLabel) wizardConfirmLabel.textContent = 'Confirmar e Importar';
            if (wizardConfirmBtn) wizardConfirmBtn.disabled = true;
            if (wizardMappingInfo) wizardMappingInfo.innerHTML = '';
            if (wizardPreviewThead) wizardPreviewThead.innerHTML = '';
            if (wizardPreviewTbody) wizardPreviewTbody.innerHTML = '';
            if (wizardWarnings) {
                wizardWarnings.style.display = 'block';
                wizardWarnings.innerHTML = '<p><i class="fas fa-exclamation-triangle"></i> No se encontraron obras válidas en los datos proporcionados.</p>';
            }
            return;
        }

        wizardParsedData = parseResult.artLabels;
        if (wizardPreviewArea) wizardPreviewArea.style.display = 'block';
        if (wizardConfirmBtn) wizardConfirmBtn.disabled = false;

        const count = wizardParsedData.length;
        if (wizardPreviewCount) {
            wizardPreviewCount.textContent = `${count} obra${count === 1 ? '' : 's'} detectada${count === 1 ? '' : 's'}`;
        }
        if (wizardConfirmLabel) {
            wizardConfirmLabel.textContent = `Confirmar e Importar ${count} Obra${count === 1 ? '' : 's'}`;
        }

        // Render Mappings
        if (wizardMappingInfo) {
            wizardMappingInfo.innerHTML = '';
            if (parseResult.isJson) {
                wizardMappingInfo.innerHTML = '<span class="wizard-mapping-tag"><i class="fas fa-check"></i> Catálogo JSON estándar</span>';
            } else if (parseResult.headers && parseResult.columnMapping && typeof CatalogImporter !== 'undefined') {
                const descriptions = CatalogImporter.describeMappings(parseResult.headers, parseResult.columnMapping);
                if (descriptions.length > 0) {
                    descriptions.forEach(desc => {
                        const tag = document.createElement('span');
                        tag.className = 'wizard-mapping-tag';
                        tag.innerHTML = `<i class="fas fa-check"></i> ${escapeHtml(desc)}`;
                        wizardMappingInfo.appendChild(tag);
                    });
                }
            }
        }

        // Render Warnings
        if (wizardWarnings) {
            if (parseResult.warnings && parseResult.warnings.length > 0) {
                wizardWarnings.style.display = 'block';
                wizardWarnings.innerHTML = `<ul>${parseResult.warnings.map(w => `<li>${escapeHtml(w)}</li>`).join('')}</ul>`;
            } else {
                wizardWarnings.style.display = 'none';
                wizardWarnings.innerHTML = '';
            }
        }

        // Render Preview Table (up to 3 rows)
        if (wizardPreviewThead && wizardPreviewTbody) {
            wizardPreviewThead.innerHTML = `
                <tr>
                    <th>Nro. Bien</th>
                    <th>Autor</th>
                    <th>Título</th>
                    <th>Fecha</th>
                    <th>Técnica</th>
                    <th>Medidas</th>
                </tr>
            `;

            const previewItems = wizardParsedData.slice(0, 3);
            wizardPreviewTbody.innerHTML = previewItems.map(item => `
                <tr>
                    <td><strong>${escapeHtml(item.asset_number || item.id || '-')}</strong></td>
                    <td>${escapeHtml(item.author || '-')}</td>
                    <td><em>${escapeHtml(item.title || '-')}</em></td>
                    <td>${escapeHtml(item.date || '-')}</td>
                    <td>${escapeHtml(item.technique || '-')}</td>
                    <td>${escapeHtml(item.measurements || '-')}</td>
                </tr>
            `).join('');
        }
    };

    // Tab 1: Parse Paste Text
    const processPasteText = () => {
        if (!wizardPasteArea) return;
        const text = wizardPasteArea.value;
        if (!text.trim()) {
            alert('Por favor pega texto copiado de Excel o una tabla antes de detectar.');
            return;
        }

        if (typeof CatalogImporter === 'undefined') {
            alert('Error: el módulo CatalogImporter no está cargado.');
            return;
        }

        const result = CatalogImporter.parseText(text);
        displayWizardPreview(result);
    };

    if (wizardDetectBtn) {
        wizardDetectBtn.addEventListener('click', processPasteText);
    }

    if (wizardPasteArea) {
        wizardPasteArea.addEventListener('paste', () => {
            setTimeout(processPasteText, 100);
        });
    }

    // Tab 2: File Handling
    if (wizardBrowseBtn && wizardFileInput) {
        wizardBrowseBtn.addEventListener('click', () => wizardFileInput.click());
    }

    const handleFileSelected = (file) => {
        if (!file) return;
        if (typeof CatalogImporter === 'undefined') {
            alert('Error: el módulo CatalogImporter no está cargado.');
            return;
        }

        CatalogImporter.parseFile(file)
            .then(result => {
                displayWizardPreview(result);
            })
            .catch(err => {
                alert(err.message || 'Error al procesar el archivo.');
            });
    };

    if (wizardFileInput) {
        wizardFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handleFileSelected(file);
        });
    }

    if (wizardFileDropZone) {
        wizardFileDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            wizardFileDropZone.classList.add('drag-over');
        });

        wizardFileDropZone.addEventListener('dragleave', () => {
            wizardFileDropZone.classList.remove('drag-over');
        });

        wizardFileDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            wizardFileDropZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) handleFileSelected(file);
        });
    }

    // Clear Button
    if (wizardClearBtn) {
        wizardClearBtn.addEventListener('click', resetWizardUI);
    }

    // Confirm Import Button
    if (wizardConfirmBtn) {
        wizardConfirmBtn.addEventListener('click', () => {
            if (!wizardParsedData || wizardParsedData.length === 0) {
                alert('No hay obras para importar.');
                return;
            }

            const count = wizardParsedData.length;
            const normalizedCatalog = wizardParsedData.map(item => {
                const assetNum = item.asset_number || item.id || `OBR-${Date.now()}`;
                return {
                    ...item,
                    id: item.id || assetNum,
                    asset_number: assetNum
                };
            });

            saveCatalog(normalizedCatalog);
            closeImportWizard();

            alert(`¡Éxito! Se han importado ${count} obra${count === 1 ? '' : 's'} a tu catálogo.\n\nPuedes autocompletar cualquier rótulo escribiendo su Número de Bien en el formulario de creación.`);
        });
    }

    importProjectInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedState = JSON.parse(event.target.result);
                if (importedState && Array.isArray(importedState.labels)) {
                    state = importedState;
                    if (!state.styleConfig) {
                        state.styleConfig = JSON.parse(JSON.stringify(DEFAULT_STYLE_CONFIG));
                    } else {
                        if (!state.styleConfig.fontFamily) state.styleConfig.fontFamily = DEFAULT_STYLE_CONFIG.fontFamily;
                        if (state.styleConfig.baseFontSize === undefined) state.styleConfig.baseFontSize = DEFAULT_STYLE_CONFIG.baseFontSize;
                    }
                    saveState();
                    renderUI();
                    alert('Proyecto cargado exitosamente.');
                } else {
                    alert('El archivo no tiene el formato correcto.');
                }
            } catch (err) {
                console.error("Error parsing JSON:", err);
                alert('Error al leer el archivo del proyecto.');
            }
        };
        reader.readAsText(file);
        importProjectInput.value = '';
    });
    
    // --- GENERACIÓN DE PDF ---
    const generatePDF = async (labelsToPrint) => {
        if (labelsToPrint.length === 0) return alert('No hay rótulos para generar el PDF.');
        
        const originalBtnHTML = generatePdfBtn.innerHTML;
        generatePdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando PDF...';
        generatePdfBtn.disabled = true;
        await new Promise(r => setTimeout(r, 50));

        const imageCache = {};

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });
            
            const pageW = 215.9, pageH = 279.4;
            const labelW_mm = typeof window !== 'undefined' && window.GridCalculator ? window.GridCalculator.cmToMm(labelWidthCm) : labelWidthCm * 10;
            const labelH_mm = typeof window !== 'undefined' && window.GridCalculator ? window.GridCalculator.cmToMm(labelHeightCm) : labelHeightCm * 10;
            const pageMargin = 10;
            
            const gridConfig = typeof window !== 'undefined' && window.GridCalculator 
                ? window.GridCalculator.calculatePageGrid(pageW, pageH, labelW_mm, labelH_mm, pageMargin)
                : {
                    maxCols: Math.floor((pageW - (pageMargin * 2)) / labelW_mm),
                    maxRows: Math.floor((pageH - (pageMargin * 2)) / labelH_mm),
                    itemsPerPage: Math.max(0, Math.floor((pageW - (pageMargin * 2)) / labelW_mm) * Math.floor((pageH - (pageMargin * 2)) / labelH_mm)),
                    gridW: Math.floor((pageW - (pageMargin * 2)) / labelW_mm) * labelW_mm,
                    gridH: Math.floor((pageH - (pageMargin * 2)) / labelH_mm) * labelH_mm,
                    marginX: (pageW - (Math.floor((pageW - (pageMargin * 2)) / labelW_mm) * labelW_mm)) / 2,
                    marginY: (pageH - (Math.floor((pageH - (pageMargin * 2)) / labelH_mm) * labelH_mm)) / 2
                };

            const { maxCols, maxRows, itemsPerPage, marginX, marginY } = gridConfig;
            
            if (itemsPerPage <= 0) return alert('El tamaño del rótulo es demasiado grande para la página.');

            const labelPreviewWidthPx = typeof window !== 'undefined' && window.GridCalculator ? window.GridCalculator.cmToPx(labelWidthCm) : labelWidthCm * 37.79;
            const labelPreviewHeightPx = typeof window !== 'undefined' && window.GridCalculator ? window.GridCalculator.cmToPx(labelHeightCm) : labelHeightCm * 37.79;

            for (let index = 0; index < labelsToPrint.length; index++) {
                const label = labelsToPrint[index];
                const pageIndex = Math.floor(index / itemsPerPage);
                
                if (index > 0 && index % itemsPerPage === 0) doc.addPage();
                doc.setPage(pageIndex + 1);

                const posInPage = index % itemsPerPage;
                const col = posInPage % maxCols;
                const row = Math.floor(posInPage / maxCols);
                const x = marginX + (col * labelW_mm), y = marginY + (row * labelH_mm);
                const safeMargin = 2;
            
            const type = label.decorationType || 'arabesque';
            
            // --- NEW: Optimized Image Handling with Caching ---
            if (type === 'arabesque') {
                const decoWidth = labelW_mm * 0.9, decoHeight = labelH_mm * 0.18;
                const decoX = x + (labelW_mm - decoWidth) / 2;
                if (label.decorationTop) {
                    const fmtTop = label.decorationTop.startsWith('data:image/jpeg') || label.decorationTop.startsWith('data:image/jpg') ? 'JPEG' : 'PNG';
                    doc.addImage(label.decorationTop, fmtTop, decoX, y + safeMargin, decoWidth, decoHeight);
                }
                if (label.decorationBottom) {
                    const fmtBot = label.decorationBottom.startsWith('data:image/jpeg') || label.decorationBottom.startsWith('data:image/jpg') ? 'JPEG' : 'PNG';
                    doc.addImage(label.decorationBottom, fmtBot, decoX, y + labelH_mm - decoHeight - safeMargin, decoWidth, decoHeight);
                }

            } else if (type === 'neutral' && label.neutralLogo) {
                const pxToMm_X = labelW_mm / labelPreviewWidthPx;
                const pxToMm_Y = labelH_mm / labelPreviewHeightPx;
                const logo = label.neutralLogo;

                // Cache key includes rotation to ensure variations are stored
                const cacheKey = `${logo.src.substring(0, 64)}_${logo.rotation}`;
                let processedImage;

                if (imageCache[cacheKey]) {
                    processedImage = imageCache[cacheKey];
                } else {
                    try {
                        const resp = await fetch(logo.src);
                        const blob = await resp.blob();
                        const bitmap = await createImageBitmap(blob);

                        // Save dimensions BEFORE closing the bitmap
                        const bmpW = bitmap.width;
                        const bmpH = bitmap.height;

                        const angleRad = logo.rotation || 0;
                        const absCos = Math.abs(Math.cos(angleRad));
                        const absSin = Math.abs(Math.sin(angleRad));
                        const ogW = bmpW * absCos + bmpH * absSin;
                        const ogH = bmpW * absSin + bmpH * absCos;

                        const maxDim = 800;
                        const scale = (ogW > maxDim || ogH > maxDim) ? maxDim / Math.max(ogW, ogH) : 1;

                        const canvas = document.createElement('canvas');
                        canvas.width = Math.max(1, Math.round(ogW * scale));
                        canvas.height = Math.max(1, Math.round(ogH * scale));
                        const ctx = canvas.getContext('2d');
                        ctx.translate(canvas.width / 2, canvas.height / 2);
                        ctx.scale(scale, scale);
                        ctx.rotate(angleRad);
                        ctx.drawImage(bitmap, -bmpW / 2, -bmpH / 2);
                        bitmap.close();

                        processedImage = {
                            src: canvas.toDataURL('image/png'),
                            w_ratio: ogW / (bmpW || 1),
                            h_ratio: ogH / (bmpH || 1)
                        };
                        imageCache[cacheKey] = processedImage;
                    } catch (imgErr) {
                        console.warn('Logo processing failed, using raw source:', imgErr);
                        processedImage = { src: logo.src, w_ratio: 1, h_ratio: 1 };
                    }
                }

                const bbW = logo.w_px * processedImage.w_ratio;
                const bbH = logo.h_px * processedImage.h_ratio;
                const top_left_x = logo.x_px - (bbW - logo.w_px) / 2;
                const top_left_y = logo.y_px - (bbH - logo.h_px) / 2;

                const logoX_mm = top_left_x * pxToMm_X;
                const logoY_mm = top_left_y * pxToMm_Y;
                const logoW_mm = bbW * pxToMm_X;
                const logoH_mm = bbH * pxToMm_Y;

                // Auto-detect format from data URL for compatibility with PNG, JPEG, etc.
                let imgFormat = 'PNG';
                if (processedImage.src.startsWith('data:image/jpeg') || processedImage.src.startsWith('data:image/jpg')) {
                    imgFormat = 'JPEG';
                } else if (processedImage.src.startsWith('data:image/webp')) {
                    imgFormat = 'WEBP';
                }

                try {
                    doc.addImage(processedImage.src, imgFormat, x + logoX_mm, y + logoY_mm, logoW_mm, logoH_mm);
                } catch (pdfErr) {
                    console.warn('addImage failed, retrying without format hint:', pdfErr);
                    try {
                        // Fallback: let jsPDF auto-detect format
                        doc.addImage(processedImage.src, x + logoX_mm, y + logoY_mm, logoW_mm, logoH_mm);
                    } catch (pdfErr2) {
                        console.warn('addImage fallback also failed:', pdfErr2);
                    }
                }

            }
            
            // --- CONFIGURACIÓN DE ESTILO DINÁMICA (MODO PRO / WYSIWYG 1:1) ---
            const styleConfig = state.styleConfig || DEFAULT_STYLE_CONFIG;
            const textAlign = styleConfig.textAlign || 'center';
            const lineSpacing = styleConfig.lineSpacingMultiplier !== undefined ? styleConfig.lineSpacingMultiplier : 1.0;
            const pdfFontKey = styleConfig.fontFamily || 'arial';
            const pdfFontName = (FONT_MAP[pdfFontKey] && FONT_MAP[pdfFontKey].pdf) || 'arial';
            
            doc.setFont(pdfFontName, 'normal'); doc.setTextColor(0, 0, 0);
            const fieldsMap = (styleConfig.fields || DEFAULT_STYLE_CONFIG.fields).reduce((acc, f) => {
                acc[f.id] = f;
                return acc;
            }, {});

            const getFieldFontStyle = (fieldId, defaultBold = false, defaultItalic = false) => {
                const f = fieldsMap[fieldId];
                const isBold = f ? !!f.bold : defaultBold;
                const isItalic = f ? !!f.italic : defaultItalic;

                if (isBold && isItalic) return 'bolditalic';
                if (isBold && !isItalic) return 'bold';
                if (!isBold && isItalic) return 'italic';
                return 'normal';
            };

            const isFieldVisible = (fieldId) => {
                const f = fieldsMap[fieldId];
                return f ? f.visible !== false : true;
            };

            const authorStyle = getFieldFontStyle('author', true, false);
            const titleStyle = getFieldFontStyle('title', false, true);
            const dateStyle = getFieldFontStyle('date', false, false);
            const techStyle = getFieldFontStyle('technique', false, false);
            const measStyle = getFieldFontStyle('measurements', false, false);

            const paddingLeft_mm = safeMargin + 3;
            const paddingRight_mm = safeMargin + 3;
            let textX = x + (labelW_mm / 2);
            let textOptions = { align: 'center' };

            if (textAlign === 'left') {
                textX = x + paddingLeft_mm;
                textOptions = { align: 'left' };
            } else if (textAlign === 'right') {
                textX = x + labelW_mm - paddingRight_mm;
                textOptions = { align: 'right' };
            }
            
            // --- CORRECCIÓN PARA SALTO DE LÍNEA Y AUTO-SHRINK DE TEXTO ---
            const maxWidth = labelW_mm - (safeMargin * 2) - 6;
            const decoHeightFallback = labelH_mm * 0.18;
            const startY = y + (type === 'arabesque' ? decoHeightFallback + 5 : 10);
            const availableHeight = labelH_mm - (type === 'arabesque' ? (decoHeightFallback * 2) + 10 : 20);

            const minFontSize = 6;
            const initialFontSize = (typeof styleConfig.baseFontSize === 'number') ? styleConfig.baseFontSize : 12;
            let currentFontSize = initialFontSize;
            let fitted = false;
            let authorLines = [], titleLines = [], dateLines = [], techLines = [], measLines = [];
            let lineHeight;

            while (!fitted && currentFontSize >= minFontSize) {
                doc.setFontSize(currentFontSize);
                lineHeight = currentFontSize * 0.3527 * 1.2 * lineSpacing; 
                
                doc.setFont(pdfFontName, authorStyle);
                authorLines = (isFieldVisible('author') && label.author) ? doc.splitTextToSize(label.author, maxWidth) : [];
                doc.setFont(pdfFontName, titleStyle);
                titleLines = (isFieldVisible('title') && label.title) ? doc.splitTextToSize(label.title, maxWidth) : [];
                doc.setFont(pdfFontName, dateStyle);
                dateLines = (isFieldVisible('date') && label.date) ? doc.splitTextToSize(label.date, maxWidth) : [];
                doc.setFont(pdfFontName, techStyle);
                techLines = (isFieldVisible('technique') && label.technique) ? doc.splitTextToSize(label.technique, maxWidth) : [];
                doc.setFont(pdfFontName, measStyle);
                measLines = (isFieldVisible('measurements') && label.measurements) ? doc.splitTextToSize(label.measurements, maxWidth) : [];
                
                const totalLines = authorLines.length + titleLines.length + dateLines.length + techLines.length + measLines.length;
                const fieldGaps = [authorLines, titleLines, dateLines, techLines, measLines].filter(lines => lines.length > 0).length - 1;
                const totalPadding = Math.max(0, fieldGaps) * Math.max(1, (currentFontSize / 12 * 2)) * lineSpacing;
                const totalRequiredHeight = (totalLines * lineHeight) + totalPadding;
                
                if (totalRequiredHeight <= availableHeight || currentFontSize === minFontSize) {
                    fitted = true;
                } else {
                    currentFontSize -= 0.5;
                }
            }

            let textY = startY + lineHeight;
            const padding = Math.max(1, currentFontSize / 12 * 2) * lineSpacing;

            if (authorLines.length > 0) {
                doc.setFont(pdfFontName, authorStyle);
                doc.text(authorLines, textX, textY, textOptions);
                textY += (authorLines.length * lineHeight) + padding;
            }

            if (titleLines.length > 0) {
                doc.setFont(pdfFontName, titleStyle);
                doc.text(titleLines, textX, textY, textOptions);
                textY += (titleLines.length * lineHeight) + padding;
            }

            if (dateLines.length > 0) {
                doc.setFont(pdfFontName, dateStyle);
                doc.text(dateLines, textX, textY, textOptions);
                textY += (dateLines.length * lineHeight) + padding;
            }

            if (techLines.length > 0) {
                doc.setFont(pdfFontName, techStyle);
                doc.text(techLines, textX, textY, textOptions);
                textY += (techLines.length * lineHeight) + padding;
            }

            if (measLines.length > 0) {
                doc.setFont(pdfFontName, measStyle);
                doc.text(measLines, textX, textY, textOptions);
            }
            // --- FIN DE LA CORRECCIÓN AUTO-SHRINK ---
            
            doc.setFontSize(11);
            doc.text(String(label.assetNumber), x + labelW_mm - safeMargin - 2, y + labelH_mm - safeMargin, { align: 'right' });
        }

        const pageCount = Math.ceil(labelsToPrint.length / itemsPerPage);
        for (let p = 1; p <= pageCount; p++) {
            doc.setPage(p);
            doc.setDrawColor(180, 180, 180);
            doc.setLineWidth(0.1);
            const markLength = 4;
            
            for (let i = 0; i <= maxCols; i++) {
                for (let j = 0; j <= maxRows; j++) {
                    const mx = marginX + (i * labelW_mm);
                    const my = marginY + (j * labelH_mm);
                    
                    if (j === 0) {
                        doc.line(mx, my - markLength, mx, my);
                    } else if (j === maxRows) {
                        doc.line(mx, my, mx, my + markLength);
                    } else {
                        doc.line(mx, my - markLength/2, mx, my + markLength/2);
                    }
                    
                    if (i === 0) {
                        doc.line(mx - markLength, my, mx, my);
                    } else if (i === maxCols) {
                        doc.line(mx, my, mx + markLength, my);
                    } else {
                        doc.line(mx - markLength/2, my, mx + markLength/2, my);
                    }
                }
            }
        }
        try {
            const blobUrl = doc.output('bloburl');
            window.open(blobUrl, '_blank');
        } catch (outputErr) {
            console.warn('bloburl creation failed, trying direct save:', outputErr);
            doc.save('rotulos_arte.pdf');
        }
    } catch (e) {
        console.error('Error generando PDF:', e);
        alert('Ocurrió un error generalando el PDF: ' + e.message);
    } finally {
        generatePdfBtn.innerHTML = originalBtnHTML;
        generatePdfBtn.disabled = false;
    }
};

    generatePdfBtn.addEventListener('click', async () => await generatePDF(state.labels));


    // --- GESTIÓN DE CONFIGURACIÓN DE ESTILO (MODO PRO / STYLE ENGINE) ---
    const styleAccordionBtn = document.getElementById('style-accordion-btn');
    const styleAccordion = document.querySelector('.style-accordion');
    const styleFontFamilySelect = document.getElementById('style-font-family');
    const styleFontSizeSlider = document.getElementById('style-font-size-slider');
    const fontSizeIndicator = document.getElementById('font-size-indicator');
    const styleAlignButtons = document.querySelectorAll('.style-align-btn');
    const lineSpacingSlider = document.getElementById('line-spacing-slider');
    const lineSpacingValue = document.getElementById('line-spacing-value');
    const resetStyleBtn = document.getElementById('reset-style-btn');

    if (styleAccordionBtn && styleAccordion) {
        styleAccordionBtn.addEventListener('click', () => {
            styleAccordion.classList.toggle('open');
        });
    }

    const syncStyleControlsUI = () => {
        const cfg = state.styleConfig || DEFAULT_STYLE_CONFIG;

        // 1. Sincronizar selector tipográfico y tamaño base
        if (styleFontFamilySelect) {
            styleFontFamilySelect.value = cfg.fontFamily || DEFAULT_STYLE_CONFIG.fontFamily;
        }
        const baseFontSize = (typeof cfg.baseFontSize === 'number') ? cfg.baseFontSize : DEFAULT_STYLE_CONFIG.baseFontSize;
        if (styleFontSizeSlider) {
            styleFontSizeSlider.value = baseFontSize;
        }
        if (fontSizeIndicator) {
            fontSizeIndicator.textContent = `${baseFontSize} pt`;
        }

        // 2. Sincronizar alineación
        const currentAlign = cfg.textAlign || 'center';
        styleAlignButtons.forEach(btn => {
            if (btn.dataset.align === currentAlign) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // 3. Sincronizar botones de formato de cada campo
        const fieldsMap = (cfg.fields || DEFAULT_STYLE_CONFIG.fields).reduce((acc, f) => {
            acc[f.id] = f;
            return acc;
        }, {});

        document.querySelectorAll('.style-field-row').forEach(row => {
            const fieldId = row.dataset.field;
            const fieldData = fieldsMap[fieldId] || { bold: false, italic: false };

            const boldBtn = row.querySelector('.format-bold');
            if (boldBtn) {
                if (fieldData.bold) boldBtn.classList.add('active');
                else boldBtn.classList.remove('active');
            }

            const italicBtn = row.querySelector('.format-italic');
            if (italicBtn) {
                if (fieldData.italic) italicBtn.classList.add('active');
                else italicBtn.classList.remove('active');
            }
        });

        // 4. Sincronizar interlineado
        const spacing = cfg.lineSpacingMultiplier !== undefined ? cfg.lineSpacingMultiplier : 1.0;
        if (lineSpacingSlider) lineSpacingSlider.value = spacing;
        if (lineSpacingValue) lineSpacingValue.textContent = `${parseFloat(spacing).toFixed(1)}x`;
    };

    // Eventos de selección de tipografía
    if (styleFontFamilySelect) {
        styleFontFamilySelect.addEventListener('change', (e) => {
            if (!state.styleConfig) {
                state.styleConfig = JSON.parse(JSON.stringify(DEFAULT_STYLE_CONFIG));
            }
            state.styleConfig.fontFamily = e.target.value;
            saveState();
            renderLivePreview();
        });
    }

    // Eventos de control de tamaño base de fuente
    if (styleFontSizeSlider) {
        styleFontSizeSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            if (!state.styleConfig) {
                state.styleConfig = JSON.parse(JSON.stringify(DEFAULT_STYLE_CONFIG));
            }
            state.styleConfig.baseFontSize = val;
            if (fontSizeIndicator) fontSizeIndicator.textContent = `${val} pt`;
            saveState();
            renderLivePreview();
        });
    }

    // Eventos de alineación
    styleAlignButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const align = btn.dataset.align;
            if (!state.styleConfig) {
                state.styleConfig = JSON.parse(JSON.stringify(DEFAULT_STYLE_CONFIG));
            }
            state.styleConfig.textAlign = align;
            syncStyleControlsUI();
            saveState();
            renderLivePreview();
        });
    });

    // Eventos de formato por campo (Negrita / Cursiva)
    document.querySelectorAll('.style-field-row').forEach(row => {
        const fieldId = row.dataset.field;
        const boldBtn = row.querySelector('.format-bold');
        const italicBtn = row.querySelector('.format-italic');

        if (boldBtn) {
            boldBtn.addEventListener('click', () => {
                if (!state.styleConfig) {
                    state.styleConfig = JSON.parse(JSON.stringify(DEFAULT_STYLE_CONFIG));
                }
                const field = state.styleConfig.fields.find(f => f.id === fieldId);
                if (field) {
                    field.bold = !field.bold;
                    syncStyleControlsUI();
                    saveState();
                    renderLivePreview();
                }
            });
        }

        if (italicBtn) {
            italicBtn.addEventListener('click', () => {
                if (!state.styleConfig) {
                    state.styleConfig = JSON.parse(JSON.stringify(DEFAULT_STYLE_CONFIG));
                }
                const field = state.styleConfig.fields.find(f => f.id === fieldId);
                if (field) {
                    field.italic = !field.italic;
                    syncStyleControlsUI();
                    saveState();
                    renderLivePreview();
                }
            });
        }
    });

    // Evento de control de interlineado
    if (lineSpacingSlider) {
        lineSpacingSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (!state.styleConfig) {
                state.styleConfig = JSON.parse(JSON.stringify(DEFAULT_STYLE_CONFIG));
            }
            state.styleConfig.lineSpacingMultiplier = val;
            if (lineSpacingValue) lineSpacingValue.textContent = `${val.toFixed(1)}x`;
            saveState();
            renderLivePreview();
        });
    }

    // Evento de reseteo a valores por defecto
    if (resetStyleBtn) {
        resetStyleBtn.addEventListener('click', () => {
            state.styleConfig = JSON.parse(JSON.stringify(DEFAULT_STYLE_CONFIG));
            syncStyleControlsUI();
            saveState();
            renderLivePreview();
        });
    }

    // --- INICIALIZACIÓN ---
    loadState();
    loadCatalog();
    renderUI();
});
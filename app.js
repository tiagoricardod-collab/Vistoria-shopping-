// app.js - Sistema Completo de Vistoria com Fotos
document.addEventListener('DOMContentLoaded', function() {
    // Variáveis globais
    let inspections = JSON.parse(localStorage.getItem('inspections')) || [];
    let currentInspectionPhotos = [];
    let currentUser = { name: "Inspetor", id: "user-001" };

    // Elementos da UI
    const views = {
        home: document.getElementById('homeView'),
        inspection: document.getElementById('inspectionView'),
        reports: document.getElementById('reportsView')
    };

    // Inicialização
    initNavigation();
    updateDashboard();
    loadInspectionsTable();
    setupEquipmentTypeToggle();
    setupPhotoUpload();
    setupAIAssistant();
    setupBackup();

    // Event Listeners
    document.getElementById('startInspection').addEventListener('click', showInspectionView);
    document.getElementById('cancelInspection').addEventListener('click', showHomeView);
    document.getElementById('saveInspection').addEventListener('click', saveInspection);
    document.getElementById('exportExcel').addEventListener('click', exportToExcel);
    document.getElementById('applyFilters').addEventListener('click', loadInspectionsTable);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    document.getElementById('equipmentType').addEventListener('change', toggleEquipmentFields);

    // ========== FUNÇÕES PRINCIPAIS ========== //

    // 1. Funções de Navegação
    function showHomeView() {
        hideAllViews();
        views.home.style.display = 'block';
        updateDashboard();
    }

    function showInspectionView() {
        hideAllViews();
        views.inspection.style.display = 'block';
        document.getElementById('inspectionForm').reset();
        currentInspectionPhotos = [];
        document.getElementById('photoPreviewContainer').innerHTML = '';
    }

    // 2. Sistema de Fotos
    function setupPhotoUpload() {
        const photoInput = document.getElementById('equipmentPhotos');
        photoInput.addEventListener('change', function(e) {
            currentInspectionPhotos = [];
            const previewContainer = document.getElementById('photoPreviewContainer');
            previewContainer.innerHTML = '';
            
            Array.from(e.target.files).forEach(file => {
                if (!file.type.match('image.*')) return;
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    currentInspectionPhotos.push({
                        name: file.name,
                        data: e.target.result.split(',')[1]
                    });
                    
                    const col = document.createElement('div');
                    col.className = 'col-md-3 mb-3';
                    col.innerHTML = `
                        <div class="card">
                            <img src="${e.target.result}" class="card-img-top" style="height: 120px; object-fit: cover;">
                            <div class="card-body p-2 text-center">
                                <button class="btn btn-sm btn-danger remove-photo" data-name="${file.name}">
                                    <i class="bi bi-trash"></i> Remover
                                </button>
                            </div>
                        </div>
                    `;
                    previewContainer.appendChild(col);
                };
                reader.readAsDataURL(file);
            });
        });

        // Delegation para remover fotos
        document.getElementById('photoPreviewContainer').addEventListener('click', function(e) {
            if (e.target.closest('.remove-photo')) {
                const photoName = e.target.closest('.remove-photo').getAttribute('data-name');
                currentInspectionPhotos = currentInspectionPhotos.filter(p => p.name !== photoName);
                e.target.closest('.col-md-3').remove();
            }
        });
    }

    // 3. Salvamento de Vistorias
    function saveInspection() {
        const form = document.getElementById('inspectionForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const inspectionData = {
            id: 'insp-' + Date.now(),
            date: new Date().toISOString(),
            equipmentType: document.getElementById('equipmentType').value,
            equipmentId: document.getElementById('equipmentId').value,
            location: document.getElementById('location').value,
            floor: document.getElementById('floor').value,
            status: document.getElementById('status').value,
            inspector: currentUser.name,
            photos: [...currentInspectionPhotos],
            checklist: getChecklistData(),
            nextInspectionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        // Adiciona campos específicos
        if (inspectionData.equipmentType === 'extinguisher') {
            inspectionData.extinguisherType = document.getElementById('extinguisherType').value;
            inspectionData.extinguisherCapacity = document.getElementById('extinguisherCapacity').value;
            inspectionData.extinguisherDueDate = document.getElementById('extinguisherDueDate').value;
        } else {
            inspectionData.hydrantType = document.getElementById('hydrantType').value;
            inspectionData.hydrantPressure = document.getElementById('hydrantPressure').value;
        }

        inspections.push(inspectionData);
        localStorage.setItem('inspections', JSON.stringify(inspections));
        alert('Vistoria salva com sucesso!');
        showHomeView();
    }

    // 4. Backup e Exportação
    function setupBackup() {
        document.getElementById('exportBackup').addEventListener('click', exportBackup);
        document.getElementById('importBackupInput').addEventListener('change', importBackup);
    }

    function exportBackup() {
        const data = {
            inspections: inspections,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-vistorias-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ========== FUNÇÕES AUXILIARES ========== //
    function getChecklistData() {
        return {
            accessible: document.getElementById('checkAccessible').checked,
            seal: document.getElementById('checkSeal').checked,
            pressure: document.getElementById('checkPressure').checked,
            hose: document.getElementById('checkHose').checked,
            signalization: document.getElementById('checkSignalization').checked,
            valves: document.getElementById('checkValves').checked
        };
    }

    function toggleEquipmentFields() {
        const type = document.getElementById('equipmentType').value;
        document.getElementById('extinguisherFields').style.display = type === 'extinguisher' ? 'block' : 'none';
        document.getElementById('hydrantFields').style.display = type === 'hydrant' ? 'block' : 'none';
    }

    // ... (Outras funções auxiliares como updateDashboard, loadInspectionsTable, etc.)
});

// Inicialize o Firebase se for usar (opcional)
// const firebaseConfig = { ... };
// firebase.initializeApp(firebaseConfig);

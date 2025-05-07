'use strict';


document.addEventListener('DOMContentLoaded', async function() {
    const fileInput = document.querySelector('.file-input');
    const uploadArea = document.querySelector('.upload-area');
    const previewContainer = document.querySelector('.preview-container');
    const feedbackArea = document.querySelector('.upload-area-feedback');
    const uploadContainer = document.querySelector('.upload-container');
    let files = [];

    // First load layout components
    await loadLayoutComponents();
    
    // Then handle the view loading
    await handleViewLoading();
    
    // Set up navigation listeners
    setupNavigation();


    if (window.location.pathname === '/index.html#home') {
        // Handle click on the upload area
        uploadArea.addEventListener('click', function(e) {
            e.preventDefault();
            fileInput.click();
        });
        
        // Handle file selection
        fileInput.addEventListener('change', function(e) {
            files = Array.from(e.target.files);
            updatePreview();
        });
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });
        
        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });
        
        // Handle dropped files
        uploadArea.addEventListener('drop', function(e) {
            const dt = e.dataTransfer;
            files = Array.from(dt.files);
            fileInput.files = dt.files; // Assign to file input
            updatePreview();
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        function highlight() {
            uploadArea.classList.add('dragover');
        }
        
        function unhighlight() {
            uploadArea.classList.remove('dragover');
        }
        
        function updatePreview() {
            previewContainer.innerHTML = '';
            
            if (files.length > 0) {
                uploadContainer.classList.add('has-files');
                feedbackArea.textContent = `${files.length} file(s) selected`;
                
                files.forEach((file, index) => {
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    
                    // Create remove button
                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'remove-btn';
                    removeBtn.innerHTML = '×';
                    removeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        files.splice(index, 1);
                        updateFileInput();
                        updatePreview();
                    });
                    
                    // File info display
                    const fileInfo = document.createElement('div');
                    fileInfo.className = 'file-info';
                    fileInfo.textContent = `${file.name} (${formatFileSize(file.size)})`;
                    
                    // Check if file is an image
                    if (file.type.match('image.*')) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const img = document.createElement('img');
                            img.src = e.target.result;
                            previewItem.insertBefore(img, previewItem.firstChild);
                        }
                        reader.readAsDataURL(file);
                    } 
                    // Check if file is PDF
                    else if (file.type === 'application/pdf') {
                        const pdfIcon = document.createElement('div');
                        pdfIcon.className = 'file-icon';
                        pdfIcon.innerHTML = '📄';
                        previewItem.appendChild(pdfIcon);
                    }
                    // Other file types
                    else {
                        const fileIcon = document.createElement('div');
                        fileIcon.className = 'file-icon';
                        
                        // Get file extension
                        const ext = file.name.split('.').pop().toLowerCase();
                        fileIcon.textContent = `.${ext}`;
                        previewItem.appendChild(fileIcon);
                    }
                    
                    previewItem.appendChild(fileInfo);
                    previewItem.appendChild(removeBtn);
                    previewContainer.appendChild(previewItem);
                });
            } else {
                uploadContainer.classList.remove('has-files');
                feedbackArea.textContent = '';
            }
        }
        
        function updateFileInput() {
            const dataTransfer = new DataTransfer();
            files.forEach(file => dataTransfer.items.add(file));
            fileInput.files = dataTransfer.files;
        }
        
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        }
        
        // Example upload function (would need a server endpoint)
        function uploadFiles() {
            if (files.length === 0) {
                feedbackArea.textContent = 'No files selected';
                return;
            }
            
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files[]', file, file.name);
            });
            
            feedbackArea.textContent = 'Uploading...';
            
            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                feedbackArea.textContent = 'Upload successful!';
                console.log(data);
            })
            .catch(error => {
                feedbackArea.textContent = 'Upload failed.';
                console.error(error);
            });
        }
    }

    if (window.location.pathname === '/index.html#tutorials') {
        // Initialize particles.js
        particlesJS.load('particles-js', 'TutJson.json', function() {
            console.log('Quantum particles initialized');
        });

        // Quantum card animations
        const cards = document.querySelectorAll('.quantum-card');

        cards.forEach((card, index) => {
            // Slide up animation
            card.style.transform = 'translateY(50px)';
            card.style.opacity = '0';
            
            // Apply animation with delay
            setTimeout(() => {
                card.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
                card.style.transform = 'translateY(0)';
                card.style.opacity = '1';
            }, index * 150);
        });
    }
});

async function loadLayoutComponents() {
    try {
        // Load top bar
        const topBarResponse = await fetch('layout/top-bar.html');
        document.querySelector('.top-bar').innerHTML = await topBarResponse.text();
        
        // Load navbar
        const navbarResponse = await fetch('layout/navbar.html');
        document.querySelector('.navbar').innerHTML = await navbarResponse.text();
        
        // Load footer
        const footerResponse = await fetch('layout/footer.html');
        document.querySelector('#footer_section').innerHTML = await footerResponse.text();
    } catch (error) {
        console.error('Error loading layout components:', error);
    }
}

async function handleViewLoading() {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    // Redirect if coming from /views/ URL
    if (path.includes('/views/')) {
        const viewName = path.split('/views/')[1].replace('.html', '');
        window.history.replaceState(null, '', `index.html#${viewName}`);
        await loadViewContent(viewName);
    } 
    // Handle hash-based navigation
    else if (hash) {
        const viewName = hash.substring(1); // Remove the #
        await loadViewContent(viewName);
    }
    // Default to home
    else {
        await loadViewContent('home');
    }
}

async function loadViewContent(viewName) {
    const validViews = ['home', 'videos', 'tutorials', 'patents', 'contact'];
    const contentDiv = document.getElementById('main_content');
    
    // Show loading state
    contentDiv.innerHTML = '<div class="text-center py-5"><i class="fas fa-spinner fa-spin fa-3x"></i></div>';
    
    // Validate view name
    if (!validViews.includes(viewName)) {
        viewName = 'home';
    }
    
    try {
        const response = await fetch(`views/${viewName}.html`);
        if (!response.ok) throw new Error(`Failed to load ${viewName} view`);
        
        const html = await response.text();
        contentDiv.innerHTML = html;
        
        // Update active state in navbar
        updateActiveNavItem(viewName);
    } catch (error) {
        console.error('Error loading view:', error);
        contentDiv.innerHTML = `
            <div class="alert alert-danger text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                <h4>Error loading content</h4>
                <p>${error.message}</p>
                <button onclick="loadViewContent('${viewName}')" class="btn btn-warning">Retry</button>
            </div>
        `;
    }
}

function updateActiveNavItem(viewName) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-view') === viewName) {
            link.classList.add('active');
        }
    });
}

function setupNavigation() {
    // Handle clicks on navigation links
    document.addEventListener('click', function(event) {
        const navLink = event.target.closest('.nav-link');
        if (navLink) {
            event.preventDefault();
            const viewName = navLink.getAttribute('data-view');
            window.history.pushState({}, '', `index.html#${viewName}`);
            loadViewContent(viewName);
        }
    });
    
    // Handle back/forward navigation
    window.addEventListener('popstate', function() {
        handleViewLoading();
    });
}
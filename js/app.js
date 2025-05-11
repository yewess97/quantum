'use strict';


document.addEventListener('DOMContentLoaded', async function() {
    // First load layout components
    await loadLayoutComponents();
    
    // Then handle the view loading
    await handleViewLoading();
    
    // Set up navigation listeners
    setupNavigation();

    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference or use preferred color scheme
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme === 'light' || (!currentTheme && !prefersDarkScheme.matches)) {
        body.classList.add('light-theme');
        themeToggle.querySelector('i').classList.add('fa-sun');
        themeToggle.querySelector('i').classList.remove('fa-moon');
    }
    
    themeToggle.addEventListener('click', function() {
        const icon = this.querySelector('i');
        
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('theme', 'light');
        }
        
        // Refresh particles.js with new theme
        particlesJS.load('particles-js', 'TutJson.json', function() {
            console.log('Particles refreshed for new theme');
        });
    });

    if (window.location.pathname === '/' || window.location.pathname === '/index.html' || window.location.pathname === '/index.html#home') {
        const fileInput = document.getElementById("file-input");
        const uploadArea = document.getElementById("upload-area");
        const filePreview = document.getElementById("file-preview");
        const fileName = document.getElementById("file-name");
        const fileSize = document.getElementById("file-size");
        const fileType = document.getElementById("file-type");
        const fileIcon = document.getElementById('file-icon');
        const fileRemove = document.getElementById('file-remove');
    
        function showFileInfo(file) {
            filePreview.classList.remove('d-none');
            fileName.textContent = file.name;
            fileSize.textContent = (file.size / 1024).toFixed(1) + ' KB';
            fileType.textContent = file.type || 'Unknown';

            if (file.type.startsWith('image/')) {
                fileIcon.textContent = '🖼️';
            } 
            else if (file.type.startsWith('video/')) {
                fileIcon.textContent = '🎬';
            } 
            else if (file.type.startsWith('audio/')) {
                fileIcon.textContent = '🎵';
            } 
            else if (file.type === 'application/pdf') {
                fileIcon.textContent = '📄';
            } 
            else {
                fileIcon.textContent = '📁';
            }
        }
    
        fileInput.addEventListener("change", function (e) {
            const file = e.target.files[0];

            if (!file) return;

            showFileInfo(file);
        });

        fileRemove.addEventListener('click', function () {
            const input = document.getElementById('file-input');
            const preview = document.getElementById('file-preview');
        
            input.value = "";
            preview.classList.add('d-none');
        });
    
        // === Drag & Drop Events ===
        uploadArea.addEventListener("dragover", function (e) {
            e.preventDefault();
            uploadArea.classList.add("dragover");
        });
    
        uploadArea.addEventListener("dragleave", function (e) {
            e.preventDefault();
            uploadArea.classList.remove("dragover");
        });
    
        uploadArea.addEventListener("drop", function (e) {
            e.preventDefault();
            uploadArea.classList.remove("dragover");
            if (e.dataTransfer.files.length > 0) {
                const droppedFile = e.dataTransfer.files[0];
                fileInput.files = e.dataTransfer.files; // Optional: assign to input
                showFileInfo(droppedFile);
            }
        });
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
    const validViews = ['home', 'videos', 'tutorials', 'patents', 'patent-details', 'contact', 'login-register', 'terms'];
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
        const readPatent = event.target.closest('.read-patent');
        const terms = event.target.closest('.terms');
        if (navLink) {
            event.preventDefault();
            const viewName = navLink.getAttribute('data-view');
            window.history.pushState({}, '', `index.html#${viewName}`);
            loadViewContent(viewName);
        }
        if (readPatent) {
            event.preventDefault();
            const viewName = readPatent.getAttribute('data-view');
            window.history.pushState({}, '', `index.html#${viewName}`);
            loadViewContent(viewName);
        }
        if (terms) {
            event.preventDefault();
            const viewName = terms.getAttribute('data-view');
            window.history.pushState({}, '', `index.html#${viewName}`);
            loadViewContent(viewName);
        }
    });
    
    // Handle back/forward navigation
    window.addEventListener('popstate', function() {
        handleViewLoading();
    });
}

function goToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    } 
    else {
        console.error(`Section with ID ${sectionId} not found`);
    }
}

function showForm(type) {
    document.querySelectorAll('.form, form').forEach(f => f.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

    document.getElementById(type).classList.add('active');
    document.querySelector(`.tab[onclick*="${type}"]`).classList.add('active');
  }
'use strict';


document.addEventListener('DOMContentLoaded', async function() {
    // First load layout components
    await loadLayoutComponents();
    
    // Then handle the view loading
    await handleViewLoading();
    
    // Set up navigation listeners
    setupNavigation();
});

async function loadLayoutComponents() {
    try {
        // Load top bar
        const headerResponse = await fetch('layout/header.html');
        document.querySelector('.main-header').innerHTML = await headerResponse.text();
        
        // Load navbar
        const navbarResponse = await fetch('layout/navbar.html');
        document.querySelector('.main-sidebar').innerHTML = await navbarResponse.text();
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
        window.history.replaceState(null, '', `admin.html#${viewName}`);
        await loadViewContent(viewName);
    } 
    // Handle hash-based navigation
    else if (hash) {
        const viewName = hash.substring(1); // Remove the #
        await loadViewContent(viewName);
    }
    // Default to home
    else {
        await loadViewContent('dashboard');
    }
}

async function loadViewContent(viewName) {
    const validViews = ['dashboard', 'videos', 'tutorials', 'patents', 'users'];
    const contentDiv = document.getElementById('content_wrapper');
    
    // Show loading state
    contentDiv.innerHTML = '<div class="text-center py-5"><i class="fas fa-spinner fa-spin fa-3x"></i></div>';
    
    // Validate view name
    if (!validViews.includes(viewName)) {
        viewName = 'dashboard';
    }
    
    try {
        const response = await fetch(`views/${viewName}.html`);
        if (!response.ok) throw new Error(`Failed to load ${viewName} view`);
        
        const html = await response.text();
        contentDiv.innerHTML = html;
        document.querySelector('.main-header .page-name').innerHTML = String(viewName).charAt(0).toUpperCase() + String(viewName).slice(1);
        
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
            window.history.pushState({}, '', `admin.html#${viewName}`);
            loadViewContent(viewName);
        }
    });
    
    // Handle back/forward navigation
    window.addEventListener('popstate', function() {
        handleViewLoading();
    });
}
/* ========================================
   UPTIME KUMA CUSTOM THEME SCRIPT
   ========================================
   This script customizes Uptime Kuma's appearance to match
   the homelab dashboard theme. It can be injected into
   Uptime Kuma to provide a consistent look and feel.
   ======================================== */

(function initializeUptimeKumaTheme() {
    'use strict';
    
    // Helper function to wait for elements to appear on the page
    function waitForElementToAppear(selector, callback) {
        const element = document.querySelector(selector);
        if (element) {
            callback(element);
        } else {
            setTimeout(() => waitForElementToAppear(selector, callback), 100);
        }
    }
    
    // Apply the custom theme to match the homelab dashboard
    function applyCustomThemeToUptimeKuma() {
        // Define custom CSS variables and styles to match our dashboard
        const customThemeCSS = `
            :root {
                --primary-color: #4299e1;
                --secondary-color: #48bb78;
                --danger-color: #f56565;
                --warning-color: #ed8936;
                --background-color: #0f1419;
                --card-background: #1a1f2e;
                --text-color: #e6e6e6;
                --muted-color: #a0aec0;
                --border-color: #2d3748;
            }

            [data-theme="light"] {
                --background-color: #f7fafc;
                --card-background: #ffffff;
                --text-color: #1a202c;
                --muted-color: #4a5568;
                --border-color: #e2e8f0;
            }
            
            body {
                background-color: var(--background-color) !important;
                color: var(--text-color) !important;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            }
            
            .container {
                background-color: var(--background-color) !important;
            }
            
            .card {
                background-color: var(--card-background) !important;
                border: 1px solid var(--border-color) !important;
                border-radius: 12px !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
            }
            
            .card-header {
                background-color: var(--card-background) !important;
                border-bottom: 1px solid var(--border-color) !important;
            }
            
            .status {
                border-radius: 8px !important;
                font-weight: 600 !important;
                font-family: 'JetBrains Mono', monospace !important;
            }
            
            .status.up {
                background-color: var(--secondary-color) !important;
                color: white !important;
            }
            
            .status.down {
                background-color: var(--danger-color) !important;
                color: white !important;
            }
            
            .status.warning {
                background-color: var(--warning-color) !important;
                color: white !important;
            }
            
            .navbar {
                background-color: var(--card-background) !important;
                border-bottom: 1px solid var(--border-color) !important;
            }
            
            .navbar-brand {
                color: var(--text-color) !important;
                font-family: 'JetBrains Mono', monospace !important;
                font-weight: 600 !important;
            }
            
            .nav-link {
                color: var(--text-color) !important;
            }
            
            .nav-link:hover {
                color: var(--primary-color) !important;
            }
            
            .btn {
                border-radius: 8px !important;
                font-weight: 500 !important;
                transition: all 0.3s ease !important;
            }
            
            .btn-primary {
                background-color: var(--primary-color) !important;
                border-color: var(--primary-color) !important;
            }
            
            .btn-primary:hover {
                background-color: var(--primary-color) !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3) !important;
            }
            
            .form-control {
                background-color: var(--card-background) !important;
                border: 1px solid var(--border-color) !important;
                color: var(--text-color) !important;
                border-radius: 8px !important;
            }
            
            .form-control:focus {
                border-color: var(--primary-color) !important;
                box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1) !important;
            }
            
            .table {
                color: var(--text-color) !important;
            }
            
            .table th {
                background-color: var(--card-background) !important;
                border-color: var(--border-color) !important;
                color: var(--text-color) !important;
                font-weight: 600 !important;
            }
            
            .table td {
                border-color: var(--border-color) !important;
            }
            
            .table-striped tbody tr:nth-of-type(odd) {
                background-color: rgba(66, 153, 225, 0.05) !important;
            }
            
            .alert {
                border-radius: 8px !important;
                border: none !important;
            }
            
            .alert-success {
                background-color: rgba(72, 187, 120, 0.1) !important;
                color: var(--secondary-color) !important;
                border-left: 4px solid var(--secondary-color) !important;
            }
            
            .alert-danger {
                background-color: rgba(245, 101, 101, 0.1) !important;
                color: var(--danger-color) !important;
                border-left: 4px solid var(--danger-color) !important;
            }
            
            .alert-warning {
                background-color: rgba(237, 137, 54, 0.1) !important;
                color: var(--warning-color) !important;
                border-left: 4px solid var(--warning-color) !important;
            }
            
            .progress {
                background-color: var(--border-color) !important;
                border-radius: 4px !important;
            }
            
            .progress-bar {
                background-color: var(--secondary-color) !important;
                border-radius: 4px !important;
            }
            
            .badge {
                border-radius: 20px !important;
                font-weight: 600 !important;
                font-family: 'JetBrains Mono', monospace !important;
            }
            
            .badge-success {
                background-color: var(--secondary-color) !important;
            }
            
            .badge-danger {
                background-color: var(--danger-color) !important;
            }
            
            .badge-warning {
                background-color: var(--warning-color) !important;
            }
            
            .badge-primary {
                background-color: var(--primary-color) !important;
            }
            
            /* Custom scrollbar */
            ::-webkit-scrollbar {
                width: 8px;
            }
            
            ::-webkit-scrollbar-track {
                background: var(--border-color);
                border-radius: 4px;
            }
            
            ::-webkit-scrollbar-thumb {
                background: var(--primary-color);
                border-radius: 4px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
                background: var(--primary-color);
            }
            
            /* Loading animations */
            .spinner-border {
                color: var(--primary-color) !important;
            }
            
            /* Chart styling */
            .chart-container {
                background-color: var(--card-background) !important;
                border: 1px solid var(--border-color) !important;
                border-radius: 8px !important;
            }
            
            /* Modal styling */
            .modal-content {
                background-color: var(--card-background) !important;
                border: 1px solid var(--border-color) !important;
                border-radius: 12px !important;
            }
            
            .modal-header {
                border-bottom: 1px solid var(--border-color) !important;
            }
            
            .modal-footer {
                border-top: 1px solid var(--border-color) !important;
            }
            
            .close {
                color: var(--text-color) !important;
            }
            
            /* Dropdown styling */
            .dropdown-menu {
                background-color: var(--card-background) !important;
                border: 1px solid var(--border-color) !important;
                border-radius: 8px !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
            }
            
            .dropdown-item {
                color: var(--text-color) !important;
            }
            
            .dropdown-item:hover {
                background-color: var(--primary-color) !important;
                color: white !important;
            }
            
            /* Pagination styling */
            .page-link {
                background-color: var(--card-background) !important;
                border: 1px solid var(--border-color) !important;
                color: var(--text-color) !important;
            }
            
            .page-link:hover {
                background-color: var(--primary-color) !important;
                border-color: var(--primary-color) !important;
                color: white !important;
            }
            
            .page-item.active .page-link {
                background-color: var(--primary-color) !important;
                border-color: var(--primary-color) !important;
            }
        `;
        
        // Create and inject the custom style element
        const customStyleElement = document.createElement('style');
        customStyleElement.textContent = customThemeCSS;
        document.head.appendChild(customStyleElement);
        
        // Apply theme based on system preference
        const systemPrefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', systemPrefersDarkMode ? 'dark' : 'light');
        
        // Listen for system theme changes and update accordingly
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (themeChangeEvent) => {
            document.documentElement.setAttribute('data-theme', themeChangeEvent.matches ? 'dark' : 'light');
        });
        
        console.log('🎨 Uptime Kuma custom theme applied successfully!');
    }
    
    // Initialize the theme when the page is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyCustomThemeToUptimeKuma);
    } else {
        applyCustomThemeToUptimeKuma();
    }
    
    // Also apply when the page is fully loaded (fallback)
    window.addEventListener('load', applyCustomThemeToUptimeKuma);
    
})();
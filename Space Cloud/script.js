// Space Cloud - Shared JavaScript
// Interactive functionality for the space tourism CRM platform

// Global state management
const SpaceCloud = {
  // User data
  currentUser: {
    id: 1,
    name: 'Dr. Eva Rostova',
    role: 'experience-architect',
    email: 'eva.rostova@spacecloud.com',
    avatar: 'ER'
  },
  
  // Sample data
  astronauts: [
    {
      id: 1,
      name: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      phone: '+1 (555) 123-4567',
      status: 'active',
      clearanceStatus: 'approved',
      flightDate: '2024-06-15',
      flightNumber: 'SC-2024-001',
      medicalClearance: 100,
      trainingProgress: 85,
      totalSpent: 250000,
      preferences: {
        dietary: 'Vegetarian',
        accommodation: 'Premium Suite',
        specialRequests: 'Window seat preferred'
      }
    },
    {
      id: 2,
      name: 'Marcus Rodriguez',
      email: 'marcus.rodriguez@email.com',
      phone: '+1 (555) 234-5678',
      status: 'pending',
      clearanceStatus: 'in-progress',
      flightDate: '2024-07-20',
      flightNumber: 'SC-2024-002',
      medicalClearance: 60,
      trainingProgress: 45,
      totalSpent: 150000,
      preferences: {
        dietary: 'No restrictions',
        accommodation: 'Standard Cabin',
        specialRequests: 'None'
      }
    },
    {
      id: 3,
      name: 'Dr. Emily Watson',
      email: 'emily.watson@email.com',
      phone: '+1 (555) 345-6789',
      status: 'waitlisted',
      clearanceStatus: 'pending',
      flightDate: null,
      flightNumber: null,
      medicalClearance: 0,
      trainingProgress: 0,
      totalSpent: 0,
      preferences: {
        dietary: 'Gluten-free',
        accommodation: 'Premium Suite',
        specialRequests: 'Accessibility accommodations needed'
      }
    }
  ],
  
  flights: [
    {
      id: 1,
      number: 'SC-2024-001',
      date: '2024-06-15',
      capacity: 6,
      booked: 4,
      status: 'confirmed',
      destination: 'Suborbital Flight',
      duration: '2 hours'
    },
    {
      id: 2,
      number: 'SC-2024-002',
      date: '2024-07-20',
      capacity: 6,
      booked: 2,
      status: 'confirmed',
      destination: 'Suborbital Flight',
      duration: '2 hours'
    },
    {
      id: 3,
      number: 'SC-2024-003',
      date: '2024-08-10',
      capacity: 6,
      booked: 0,
      status: 'open',
      destination: 'Suborbital Flight',
      duration: '2 hours'
    }
  ],
  
  clearanceWorkflows: [
    {
      id: 1,
      astronautId: 1,
      steps: [
        { id: 1, name: 'Medical Questionnaire', status: 'completed', dueDate: '2024-05-01', completedDate: '2024-04-28' },
        { id: 2, name: 'Physical Examination', status: 'completed', dueDate: '2024-05-15', completedDate: '2024-05-12' },
        { id: 3, name: 'Cardiovascular Testing', status: 'completed', dueDate: '2024-05-20', completedDate: '2024-05-18' },
        { id: 4, name: 'Psychological Evaluation', status: 'completed', dueDate: '2024-05-25', completedDate: '2024-05-22' },
        { id: 5, name: 'Final Approval', status: 'completed', dueDate: '2024-06-01', completedDate: '2024-05-30' }
      ]
    },
    {
      id: 2,
      astronautId: 2,
      steps: [
        { id: 1, name: 'Medical Questionnaire', status: 'completed', dueDate: '2024-06-01', completedDate: '2024-05-28' },
        { id: 2, name: 'Physical Examination', status: 'completed', dueDate: '2024-06-15', completedDate: '2024-06-12' },
        { id: 3, name: 'Cardiovascular Testing', status: 'in-progress', dueDate: '2024-06-20', completedDate: null },
        { id: 4, name: 'Psychological Evaluation', status: 'pending', dueDate: '2024-06-25', completedDate: null },
        { id: 5, name: 'Final Approval', status: 'pending', dueDate: '2024-07-01', completedDate: null }
      ]
    }
  ],
  
  salesPipeline: [
    { stage: 'Waitlisted', count: 45, value: 11250000 },
    { stage: 'Invitation to Apply', count: 12, value: 3000000 },
    { stage: 'Application Submitted', count: 8, value: 2000000 },
    { stage: 'Medical Pre-Screen', count: 5, value: 1250000 },
    { stage: 'Deposit Secured', count: 3, value: 750000 },
    { stage: 'Training Started', count: 2, value: 500000 },
    { stage: 'Ready for Flight', count: 4, value: 1000000 }
  ]
};

// Utility functions
const Utils = {
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },
  
  formatDate: (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },
  
  formatDateTime: (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  getStatusColor: (status) => {
    const colors = {
      'active': 'success',
      'pending': 'warning',
      'waitlisted': 'info',
      'completed': 'success',
      'in-progress': 'warning',
      'overdue': 'danger',
      'approved': 'success',
      'confirmed': 'success',
      'open': 'info'
    };
    return colors[status] || 'secondary';
  },
  
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

// Navigation management
const Navigation = {
  init: () => {
    Navigation.setupSidebar();
    Navigation.setupMobileMenu();
    Navigation.highlightCurrentPage();
  },
  
  setupSidebar: () => {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Remove active class from all links
        sidebarLinks.forEach(l => l.classList.remove('active'));
        // Add active class to clicked link
        link.classList.add('active');
      });
    });
  },
  
  setupMobileMenu: () => {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileMenuToggle && sidebar) {
      mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }
  },
  
  highlightCurrentPage: () => {
    const currentPath = window.location.pathname;
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    
    sidebarLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && currentPath.includes(href.replace('.html', ''))) {
        link.classList.add('active');
      }
    });
  }
};

// Data management
const DataManager = {
  getAstronaut: (id) => {
    return SpaceCloud.astronauts.find(a => a.id === parseInt(id));
  },
  
  getFlight: (id) => {
    return SpaceCloud.flights.find(f => f.id === parseInt(id));
  },
  
  getClearanceWorkflow: (astronautId) => {
    return SpaceCloud.clearanceWorkflows.find(w => w.astronautId === parseInt(astronautId));
  },
  
  updateAstronaut: (id, updates) => {
    const index = SpaceCloud.astronauts.findIndex(a => a.id === parseInt(id));
    if (index !== -1) {
      SpaceCloud.astronauts[index] = { ...SpaceCloud.astronauts[index], ...updates };
      return SpaceCloud.astronauts[index];
    }
    return null;
  },
  
  addAstronaut: (astronaut) => {
    const newAstronaut = {
      id: Utils.generateId(),
      ...astronaut,
      createdAt: new Date().toISOString()
    };
    SpaceCloud.astronauts.push(newAstronaut);
    return newAstronaut;
  }
};

// UI Components
const UI = {
  showNotification: (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} fade-in`;
    notification.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.className = 'btn btn-sm';
    closeBtn.style.cssText = 'float: right; background: none; border: none; color: inherit; font-size: 1.2em;';
    closeBtn.onclick = () => notification.remove();
    
    notification.appendChild(closeBtn);
    
    // Insert at top of main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.insertBefore(notification, mainContent.firstChild);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 5000);
    }
  },
  
  showModal: (title, content) => {
    const modal = document.createElement('div');
    modal.className = 'modal fade-in';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;
    
    modal.innerHTML = `
      <div class="card" style="max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
        <div class="card-header">
          <h3>${title}</h3>
          <button class="btn btn-sm" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="card-body">
          ${content}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  },
  
  updateProgressBar: (elementId, percentage) => {
    const progressBar = document.getElementById(elementId);
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
  },
  
  toggleSection: (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.toggle('hidden');
    }
  }
};

// Dashboard functionality
const Dashboard = {
  init: () => {
    Dashboard.loadStats();
    Dashboard.loadRecentActivity();
    Dashboard.setupRoleBasedView();
  },
  
  loadStats: () => {
    const statsContainer = document.getElementById('dashboard-stats');
    if (!statsContainer) return;
    
    const stats = [
      { label: 'Active Astronauts', value: SpaceCloud.astronauts.filter(a => a.status === 'active').length, icon: '👨‍🚀' },
      { label: 'Pending Clearances', value: SpaceCloud.astronauts.filter(a => a.clearanceStatus === 'in-progress').length, icon: '📋' },
      { label: 'Upcoming Flights', value: SpaceCloud.flights.filter(f => f.status === 'confirmed').length, icon: '🚀' },
      { label: 'Total Revenue', value: Utils.formatCurrency(SpaceCloud.astronauts.reduce((sum, a) => sum + a.totalSpent, 0)), icon: '💰' }
    ];
    
    statsContainer.innerHTML = stats.map(stat => `
      <div class="stat-card">
        <div class="stat-number">${stat.value}</div>
        <div class="stat-label">${stat.label}</div>
        <div style="font-size: 2rem; margin-top: 0.5rem;">${stat.icon}</div>
      </div>
    `).join('');
  },
  
  loadRecentActivity: () => {
    const activityContainer = document.getElementById('recent-activity');
    if (!activityContainer) return;
    
    const activities = [
      { type: 'clearance', message: 'Sarah Chen completed medical clearance', time: '2 hours ago' },
      { type: 'booking', message: 'New booking: Marcus Rodriguez for SC-2024-002', time: '4 hours ago' },
      { type: 'training', message: 'Emily Watson started training program', time: '1 day ago' },
      { type: 'payment', message: 'Payment received: $250,000 from Sarah Chen', time: '2 days ago' }
    ];
    
    activityContainer.innerHTML = activities.map(activity => `
      <div class="timeline-item">
        <div class="timeline-content">
          <div class="timeline-date">${activity.time}</div>
          <div>${activity.message}</div>
        </div>
      </div>
    `).join('');
  },
  
  setupRoleBasedView: () => {
    const role = SpaceCloud.currentUser.role;
    const roleSpecificElements = document.querySelectorAll(`[data-role="${role}"]`);
    
    roleSpecificElements.forEach(element => {
      element.classList.remove('hidden');
    });
  }
};

// Clearance Tracker functionality
const ClearanceTracker = {
  init: () => {
    ClearanceTracker.loadWorkflows();
    ClearanceTracker.setupEventListeners();
  },
  
  loadWorkflows: () => {
    const container = document.getElementById('clearance-workflows');
    if (!container) return;
    
    container.innerHTML = SpaceCloud.clearanceWorkflows.map(workflow => {
      const astronaut = DataManager.getAstronaut(workflow.astronautId);
      const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
      const totalSteps = workflow.steps.length;
      const progress = (completedSteps / totalSteps) * 100;
      
      return `
        <div class="card mb-lg">
          <div class="card-header">
            <div>
              <h4>${astronaut.name}</h4>
              <p class="text-muted">Flight: ${astronaut.flightNumber || 'TBD'}</p>
            </div>
            <div class="text-right">
              <div class="badge badge-${Utils.getStatusColor(astronaut.clearanceStatus)}">
                ${astronaut.clearanceStatus}
              </div>
              <div class="mt-sm">
                <div class="progress">
                  <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
                <small class="text-muted">${completedSteps}/${totalSteps} steps completed</small>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="grid grid-2">
              ${workflow.steps.map(step => `
                <div class="flex items-center gap-sm">
                  <div class="badge badge-${Utils.getStatusColor(step.status)}">
                    ${step.status === 'completed' ? '✓' : step.status === 'in-progress' ? '⟳' : '○'}
                  </div>
                  <div>
                    <div>${step.name}</div>
                    <small class="text-muted">Due: ${Utils.formatDate(step.dueDate)}</small>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },
  
  setupEventListeners: () => {
    // Add event listeners for clearance actions
    document.addEventListener('click', (e) => {
      if (e.target.matches('.btn-clearance-action')) {
        const action = e.target.dataset.action;
        const astronautId = e.target.dataset.astronautId;
        ClearanceTracker.handleAction(action, astronautId);
      }
    });
  },
  
  handleAction: (action, astronautId) => {
    switch (action) {
      case 'approve':
        UI.showNotification('Clearance step approved successfully', 'success');
        break;
      case 'reject':
        UI.showNotification('Clearance step rejected', 'warning');
        break;
      case 'view-details':
        const astronaut = DataManager.getAstronaut(astronautId);
        UI.showModal('Clearance Details', `
          <h4>${astronaut.name}</h4>
          <p>Medical clearance workflow details...</p>
        `);
        break;
    }
  }
};

// Flight Manifest functionality
const FlightManifest = {
  init: () => {
    FlightManifest.loadManifest();
    FlightManifest.setupSeatInteractions();
  },
  
  loadManifest: () => {
    const container = document.getElementById('flight-manifest');
    if (!container) return;
    
    container.innerHTML = SpaceCloud.flights.map(flight => {
      const availableSeats = flight.capacity - flight.booked;
      const seats = [];
      
      // Generate seat grid
      for (let i = 1; i <= flight.capacity; i++) {
        const status = i <= flight.booked ? 'booked' : 'available';
        seats.push(`
          <div class="seat ${status}" data-seat="${i}" data-flight="${flight.id}">
            ${i}
          </div>
        `);
      }
      
      return `
        <div class="card mb-lg">
          <div class="card-header">
            <div>
              <h4>${flight.number}</h4>
              <p class="text-muted">${Utils.formatDate(flight.date)} • ${flight.destination}</p>
            </div>
            <div class="text-right">
              <div class="badge badge-${Utils.getStatusColor(flight.status)}">
                ${flight.status}
              </div>
              <div class="mt-sm">
                <small class="text-muted">${flight.booked}/${flight.capacity} seats booked</small>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="manifest-grid">
              ${seats.join('')}
            </div>
            <div class="mt-lg">
              <div class="flex gap-sm">
                <div class="flex items-center gap-xs">
                  <div class="seat available" style="width: 20px; height: 20px; font-size: 0.7rem;">1</div>
                  <small>Available</small>
                </div>
                <div class="flex items-center gap-xs">
                  <div class="seat booked" style="width: 20px; height: 20px; font-size: 0.7rem;">1</div>
                  <small>Booked</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },
  
  setupSeatInteractions: () => {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.seat')) {
        const seat = e.target.dataset.seat;
        const flightId = e.target.dataset.flight;
        const flight = DataManager.getFlight(flightId);
        
        if (e.target.classList.contains('available')) {
          UI.showModal('Book Seat', `
            <h4>Book Seat ${seat}</h4>
            <p>Flight: ${flight.number}</p>
            <p>Date: ${Utils.formatDate(flight.date)}</p>
            <div class="form-group">
              <label class="form-label">Select Astronaut</label>
              <select class="form-select" id="astronaut-select">
                <option value="">Choose an astronaut...</option>
                ${SpaceCloud.astronauts.filter(a => !a.flightNumber).map(a => 
                  `<option value="${a.id}">${a.name}</option>`
                ).join('')}
              </select>
            </div>
            <div class="flex gap-sm">
              <button class="btn btn-primary" onclick="FlightManifest.bookSeat(${seat}, ${flightId})">
                Confirm Booking
              </button>
              <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                Cancel
              </button>
            </div>
          `);
        } else if (e.target.classList.contains('booked')) {
          UI.showModal('Seat Details', `
            <h4>Seat ${seat} - Booked</h4>
            <p>Flight: ${flight.number}</p>
            <p>Date: ${Utils.formatDate(flight.date)}</p>
            <p>This seat is currently occupied.</p>
          `);
        }
      }
    });
  },
  
  bookSeat: (seat, flightId) => {
    const astronautSelect = document.getElementById('astronaut-select');
    const astronautId = astronautSelect.value;
    
    if (!astronautId) {
      UI.showNotification('Please select an astronaut', 'warning');
      return;
    }
    
    // Update astronaut with flight information
    const flight = DataManager.getFlight(flightId);
    DataManager.updateAstronaut(astronautId, {
      flightNumber: flight.number,
      flightDate: flight.date,
      status: 'active'
    });
    
    // Update flight booking count
    const flightIndex = SpaceCloud.flights.findIndex(f => f.id === flightId);
    if (flightIndex !== -1) {
      SpaceCloud.flights[flightIndex].booked += 1;
    }
    
    UI.showNotification('Seat booked successfully!', 'success');
    document.querySelector('.modal').remove();
    FlightManifest.loadManifest();
  }
};

// Sales Pipeline functionality
const SalesPipeline = {
  init: () => {
    SalesPipeline.loadPipeline();
    SalesPipeline.loadProspects();
  },
  
  loadPipeline: () => {
    const container = document.getElementById('sales-pipeline');
    if (!container) return;
    
    container.innerHTML = SpaceCloud.salesPipeline.map(stage => {
      const percentage = (stage.value / SpaceCloud.salesPipeline.reduce((sum, s) => sum + s.value, 0)) * 100;
      
      return `
        <div class="card">
          <div class="card-header">
            <h4>${stage.stage}</h4>
            <div class="text-right">
              <div class="stat-number">${stage.count}</div>
              <div class="stat-label">Prospects</div>
            </div>
          </div>
          <div class="card-body">
            <div class="mb-sm">
              <div class="progress">
                <div class="progress-bar" style="width: ${percentage}%"></div>
              </div>
            </div>
            <div class="text-center">
              <div class="text-lg font-bold">${Utils.formatCurrency(stage.value)}</div>
              <small class="text-muted">Pipeline Value</small>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },
  
  loadProspects: () => {
    const container = document.getElementById('prospects-list');
    if (!container) return;
    
    const prospects = SpaceCloud.astronauts.filter(a => a.status === 'waitlisted');
    
    container.innerHTML = prospects.map(prospect => `
      <div class="card mb-md">
        <div class="card-header">
          <div>
            <h4>${prospect.name}</h4>
            <p class="text-muted">${prospect.email}</p>
          </div>
          <div class="flex gap-sm">
            <button class="btn btn-sm btn-primary" onclick="SalesPipeline.moveToNextStage(${prospect.id})">
              Move to Next Stage
            </button>
            <button class="btn btn-sm btn-secondary" onclick="SalesPipeline.viewDetails(${prospect.id})">
              View Details
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="grid grid-3">
            <div>
              <small class="text-muted">Status</small>
              <div class="badge badge-${Utils.getStatusColor(prospect.status)}">
                ${prospect.status}
              </div>
            </div>
            <div>
              <small class="text-muted">Interest Level</small>
              <div>High</div>
            </div>
            <div>
              <small class="text-muted">Last Contact</small>
              <div>${Utils.formatDate(new Date().toISOString())}</div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  },
  
  moveToNextStage: (astronautId) => {
    const astronaut = DataManager.getAstronaut(astronautId);
    if (astronaut.status === 'waitlisted') {
      DataManager.updateAstronaut(astronautId, { status: 'pending' });
      UI.showNotification('Prospect moved to next stage', 'success');
      SalesPipeline.loadProspects();
    }
  },
  
  viewDetails: (astronautId) => {
    const astronaut = DataManager.getAstronaut(astronautId);
    UI.showModal('Prospect Details', `
      <h4>${astronaut.name}</h4>
      <div class="grid grid-2">
        <div>
          <strong>Email:</strong> ${astronaut.email}
        </div>
        <div>
          <strong>Phone:</strong> ${astronaut.phone}
        </div>
        <div>
          <strong>Status:</strong> 
          <span class="badge badge-${Utils.getStatusColor(astronaut.status)}">
            ${astronaut.status}
          </span>
        </div>
        <div>
          <strong>Preferences:</strong> ${astronaut.preferences.dietary}
        </div>
      </div>
    `);
  }
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  Navigation.init();
  
  // Initialize page-specific functionality
  const currentPage = window.location.pathname;
  
  if (currentPage.includes('dashboard') || currentPage === '/' || currentPage.endsWith('.html')) {
    Dashboard.init();
  }
  
  if (currentPage.includes('clearance')) {
    ClearanceTracker.init();
  }
  
  if (currentPage.includes('manifest')) {
    FlightManifest.init();
  }
  
  if (currentPage.includes('sales')) {
    SalesPipeline.init();
  }
  
  if (currentPage.includes('astronaut')) {
    // Initialize astronaut record page
    const urlParams = new URLSearchParams(window.location.search);
    const astronautId = urlParams.get('id');
    if (astronautId) {
      const astronaut = DataManager.getAstronaut(astronautId);
      if (astronaut) {
        // Load astronaut details
        document.title = `${astronaut.name} - Space Cloud`;
        // Additional astronaut-specific initialization
      }
    }
  }
  
  // Global event listeners
  document.addEventListener('click', (e) => {
    // Handle form submissions
    if (e.target.matches('form')) {
      e.preventDefault();
      UI.showNotification('Form submitted successfully!', 'success');
    }
    
    // Handle button actions
    if (e.target.matches('.btn-action')) {
      const action = e.target.dataset.action;
      switch (action) {
        case 'export':
          UI.showNotification('Report exported successfully', 'success');
          break;
        case 'generate':
          UI.showNotification('Report generated', 'info');
          break;
        case 'refresh':
          location.reload();
          break;
      }
    }
  });
});

// Export for global access
window.SpaceCloud = SpaceCloud;
window.Utils = Utils;
window.UI = UI;
window.DataManager = DataManager;


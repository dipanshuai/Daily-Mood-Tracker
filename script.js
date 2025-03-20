// ===============================================
// DOM ELEMENT MANAGEMENT
// ===============================================

// Store all DOM elements in a single object for better management
const elements = {
    // Navigation elements
    navButtons: {
        today: document.getElementById('today'),
        weekView: document.getElementById('week-view'),
        monthView: document.getElementById('month-view'),
        resetData: document.getElementById('reset-button')
    },
    
    // View containers
    containers: {
        dayView: document.getElementById('day-view-container'),
        weekView: document.getElementById('week-view-container'),
        monthView: document.getElementById('month-view-container'),
        moodList: document.getElementById('mood-list-container')
    },
    
    // Mood selector elements
    moodSelector: {
        buttons: document.querySelectorAll('.mood-button'),
        container: document.querySelector('.mood-selector')
    },
    
    // Popup elements
    popup: {
        overlay: document.querySelector('.popup-overlay'),
        title: document.getElementById('popup-heading'),
        reasonLabel: document.getElementById('ask-reason'),
        reasonInput: document.getElementById('reason'),
        saveButton: document.getElementById('create-card')
    },
    
    // Date display
    dateIndicator: document.getElementById('date-indicator')
};

// ===============================================
// STATE MANAGEMENT
// ===============================================

// Main application state for single mood entry
const app = {
    moodName: "",
    moodEmoji: "",
    moodReason: "",
    moodStartTime: "",
    moodEndTime: "",
    moodDuration: "",
    moodDate: "",
    moodStartTimeInms: ""
};

// Data structure for tracking current view state
const viewState = {
    currentView: 'day',       // Current active view (day, week, or month)
    currentWeekStart: null,   // Starting date of currently displayed week
    currentMonth: null,       // Currently displayed month (0-11)
    currentYear: null,        // Currently displayed year
    selectedDate: null        // Selected date for detailed view
};

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

// Get current date and time information
function dateTime() {
    const d = new Date();
    const hourInNum = d.getHours();
    const minuteInNum = d.getMinutes();
    const secondInNum = d.getSeconds();
    const time = d.getTime();
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dateString = d.toISOString().split('T')[0];
    
    // Format time values with leading zeros if needed
    const hour = String(hourInNum).padStart(2, '0');
    const minute = String(minuteInNum).padStart(2, '0');
    const second = String(secondInNum).padStart(2, '0');
    const notation = hourInNum < 12 ? "AM" : "PM";
    
    // Return all date & time components
    return {
        dateObj: d,
        timeStamp: time,
        hourAndMinute: `${hour}:${minute} ${notation}`,
        hourInNum: hourInNum,
        minuteInNum: minuteInNum,
        secondInNum: secondInNum,
        hour: hour,
        minute: minute,
        second: second,
        notation: notation,
        dateString: dateString,
        year: year,
        month: month,
        day: day
    };
}

// Calculate duration between two timestamps
function calculateDuration(startTime, endTime) {
    let diffMs = endTime - startTime;
    if (diffMs < 0) {
        diffMs += 24 * 60 * 60 * 1000; // Handle overnight durations
    }
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    // Format duration in human-readable format
    let formattedDuration = [];
    if (hours > 0) {
        formattedDuration.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    }
    if (minutes > 0) {
        formattedDuration.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    }
    formattedDuration.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
    
    return formattedDuration.join(' ');
}

// Format date as YYYY-MM-DD
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// Get array of dates for a week starting from the given date
function getWeekDates(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday (make Monday the first day)
    const monday = new Date(date);
    monday.setDate(diff);
    const weekDates = [];
    
    // Create array of 7 date objects for the week
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(monday);
        currentDate.setDate(monday.getDate() + i);
        weekDates.push(currentDate);
    }
    
    return weekDates;
}

// Get number of days in a month
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

// Check if a date is in the future
function isFutureDate(dateStr) {
    const today = formatDate(new Date());
    return dateStr > today;
}

// Format date to readable string
function formatDateToReadable(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// ===============================================
// DATA MANAGEMENT FUNCTIONS
// ===============================================

// Clear all mood data after confirmation
function clearAllMoodData() {
    const confirmation = confirm('Do you really want to clear all your mood tracking data?');
    if (confirmation) {
        try {
            localStorage.removeItem('moodEntries');
            location.reload();
        } catch (error) {
            console.error('Error clearing mood data:', error);
            alert('Failed to clear your mood data. Please try again.');
        }
    }
}

// Retrieve mood data from localStorage
function getMoodDataFromLocalStorage() {
    return JSON.parse(localStorage.getItem('moodEntries')) || [];
}

// Save mood entry to localStorage
function saveMoodDataToLocalStorage(moodEmoji, moodName, moodReason, moodStartTime, moodEndTime, moodDuration, moodDate) {
    let allMoodData = getMoodDataFromLocalStorage();

    // Add new entry at the beginning of the array (most recent first)
    allMoodData.unshift({
        moodEmoji: moodEmoji,
        moodName: moodName,
        moodReason: moodReason,
        moodStartTime: moodStartTime,
        moodEndTime: moodEndTime,
        moodDuration: moodDuration,
        moodDate: moodDate,
    });

    localStorage.setItem('moodEntries', JSON.stringify(allMoodData));
}

// Update all mood entries in localStorage
function updateMoodEntries(entries) {
    try {
        localStorage.setItem('moodEntries', JSON.stringify(entries));
    } catch (error) {
        console.error('Error saving mood entries to localStorage:', error);
        alert('Failed to save your mood data. Please try again or check your browser settings.');
    }
}

// Update previous mood card's end time and duration
function updatePreviousCardDataInLocalStorage(endTime, duration) {
    const entries = getMoodDataFromLocalStorage();

    // Only update if there's a previous entry
    if (entries.length >= 2) {
        entries[1].moodEndTime = endTime;
        entries[1].moodDuration = duration;
        updateMoodEntries(entries);
    }
}

// Get mood entries for a specific date
function getMoodEntriesForDate(targetDate) {
    const allEntries = getMoodDataFromLocalStorage();
    return allEntries.filter(entry => entry.moodDate === targetDate);
}

// ===============================================
// MOOD ANALYSIS FUNCTIONS
// ===============================================

// Calculate most frequent mood from a set of entries
function getMostFrequentMood(entries) {
    if (!entries || entries.length === 0) return null;
    
    // Count occurrences of each mood
    const moodCounts = {};
    entries.forEach(entry => {
        const mood = entry.moodName;
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    
    // Find the most frequent mood
    let maxCount = 0;
    let mostFrequentMood = null;
    
    for (const mood in moodCounts) {
        if (moodCounts[mood] > maxCount) {
            maxCount = moodCounts[mood];
            mostFrequentMood = mood;
        }
    }
    
    // Return mood details
    return {
        mood: mostFrequentMood,
        emoji: entries.find(entry => entry.moodName === mostFrequentMood).moodEmoji,
        count: maxCount,
        total: entries.length
    };
}

// Calculate mood statistics from a set of entries
function calculateMoodStats(entries) {
    const moodStats = {};
    const totalEntries = entries.length;
    
    // Count occurrences of each mood
    entries.forEach(entry => {
        const mood = entry.moodName;
        if (!moodStats[mood]) {
            moodStats[mood] = {
                count: 0,
                emoji: entry.moodEmoji,
                percentage: 0
            };
        }
        moodStats[mood].count++;
    });
    
    // Calculate percentages
    for (const mood in moodStats) {
        moodStats[mood].percentage = Math.round((moodStats[mood].count / totalEntries) * 100);
    }
    
    return moodStats;
}

// ===============================================
// UI FUNCTIONS - DAY VIEW
// ===============================================

// Show mood selection popup
function showMoodSelectionPopup(selectedMoodValue, selectedMoodEmoji) {
    elements.popup.overlay.classList.remove('hide');
    elements.popup.title.innerHTML = `You are ${selectedMoodValue} ${selectedMoodEmoji} Now.`;
    elements.popup.reasonLabel.innerHTML = `Why are you feeling <b>${selectedMoodValue}</b>? Please enter the reason...`;
}

// Hide mood selection popup
function hidePopup() {
    elements.popup.overlay.classList.add('hide');
}

// Handle mood button selection
function selectMood(button) {
    // Remove selection from all buttons and add to the clicked one
    elements.moodSelector.buttons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    
    // Store mood data in app state
    app.moodName = button.getAttribute('data-value');
    
    // Extract just the emoji (first text node) without the span text
    app.moodEmoji = button.firstChild.textContent.trim();
    
    // Get current time information
    const timeData = dateTime();
    app.moodStartTime = timeData.hourAndMinute;
    app.moodDate = timeData.dateString;
    app.moodStartTimeInms = timeData.timeStamp;
    app.moodEndTime = "Now";
    app.moodDuration = "Now";
}

// Create a new mood card from UI data
function createMoodCardsFromUI() {
    // Create new mood card element
    const card = document.createElement('div');
    
    // Get data from app state
    let moodEmoji = app.moodEmoji;
    let moodName = app.moodName;
    let selectedCurrentMood = moodName + " " + moodEmoji;
    let moodDuration = app.moodDuration;
    let moodStartTime = app.moodStartTime;
    let moodEndTime = app.moodEndTime;
    let moodReason = app.moodReason;
    let moodDate = app.moodDate;
    let timeInMs = app.moodStartTimeInms;
    
    // Set up the card
    card.classList.add('mood-card', 'child-div-col');
    card.setAttribute('time', timeInMs);
    card.setAttribute('date', moodDate);
    card.innerHTML = `
        <div class="mood-info child-div-row">
            <p class="mood-title"> You were ${selectedCurrentMood} for <span id='moodduration'>${moodDuration}</span> </p>
            <p>From ${moodStartTime} to <span id="moodendtime">${moodEndTime}</span></p>
        </div>
        <div class="mood-reason">
            <p>${moodReason}</p>
        </div>
    `;

    // Add the card to the container
    if (elements.containers.moodList.childElementCount === 0) {
        elements.containers.moodList.appendChild(card);
    } else {
        elements.containers.moodList.insertBefore(card, elements.containers.moodList.firstChild);
    }
    
    // Save the mood data
    saveMoodDataToLocalStorage(moodEmoji, moodName, moodReason, moodStartTime, moodEndTime, moodDuration, moodDate);
    
    // Update previous card's end time and duration if it exists
    if (elements.containers.moodList.childElementCount >= 2) {
        let previousCard = elements.containers.moodList.children[1];
        let moodEndTimeContainer = previousCard.querySelector('#moodendtime');
        let moodStartTimeofPreviousCard = Number(previousCard.getAttribute('time'));
        
        // Update end time to current start time
        moodEndTimeContainer.innerText = moodStartTime;
        
        // Calculate and update duration
        let moodDurationOfPreviousCard = previousCard.querySelector('#moodduration');
        const duration = calculateDuration(moodStartTimeofPreviousCard, timeInMs);
        moodDurationOfPreviousCard.innerText = duration;
        
        // Update in localStorage
        updatePreviousCardDataInLocalStorage(moodStartTime, duration);
    }
}

// Render mood cards for a specific date
function renderMoodCardsForDate(dateStr) {
    // Clear existing cards
    elements.containers.moodList.innerHTML = '';
    
    // Update date indicator
    const dateObj = new Date(dateStr);
    elements.dateIndicator.textContent = formatDateToReadable(dateObj);
    
    // Get entries for the selected date
    const entries = getMoodEntriesForDate(dateStr);
    
    // Create cards for each entry
    entries.forEach(entry => {
        const card = document.createElement('div');
        card.classList.add('mood-card', 'child-div-col');
        card.setAttribute('date', entry.moodDate);
        card.setAttribute('time', new Date(entry.moodDate + 'T' + entry.moodStartTime.split(' ')[0]).getTime());
        
        card.innerHTML = `
            <div class="mood-info child-div-row">
                <p class="mood-title"> You were ${entry.moodName} ${entry.moodEmoji} for <span id='moodduration'>${entry.moodDuration}</span> </p>
                <p>From ${entry.moodStartTime} to <span id="moodendtime">${entry.moodEndTime}</span></p>
            </div>
            <div class="mood-reason">
                <p>${entry.moodReason}</p>
            </div>
        `;
        
        elements.containers.moodList.appendChild(card);
    });
    
    // Update message if no entries
    if (entries.length === 0) {
        const noEntriesMessage = document.createElement('div');
        noEntriesMessage.className = 'no-entries-message';
        noEntriesMessage.textContent = 'No mood entries for this date.';
        elements.containers.moodList.appendChild(noEntriesMessage);
    }
}

// ===============================================
// UI SETUP & VIEW MANAGEMENT
// ===============================================

// Switch between views (day, week, month)
function showView(viewName) {
    // Hide all views
    elements.containers.dayView.classList.add('hide');
    elements.containers.weekView.classList.add('hide');
    elements.containers.monthView.classList.add('hide');
    
    // Show the selected view
    if (viewName === 'day') {
        elements.containers.dayView.classList.remove('hide');
        elements.moodSelector.container.classList.remove('hide');
        // If no specific date is selected, show today's entries
        if (!viewState.selectedDate) {
            viewState.selectedDate = formatDate(new Date());
        }
        renderMoodCardsForDate(viewState.selectedDate);
    } else if (viewName === 'week') {
        elements.containers.weekView.classList.remove('hide');
        elements.moodSelector.container.classList.add('hide');
        generateWeekView();
    } else if (viewName === 'month') {
        elements.containers.monthView.classList.remove('hide');
        elements.moodSelector.container.classList.add('hide');
        generateMonthView();
    }
    
    // Update current view
    viewState.currentView = viewName;
}

// Update navigation button active states
function updateNavButtons() {
    elements.navButtons.today.classList.remove('active');
    elements.navButtons.weekView.classList.remove('active');
    elements.navButtons.monthView.classList.remove('active');
    
    if (viewState.currentView === 'day') {
        elements.navButtons.today.classList.add('active');
    } else if (viewState.currentView === 'week') {
        elements.navButtons.weekView.classList.add('active');
    } else if (viewState.currentView === 'month') {
        elements.navButtons.monthView.classList.add('active');
    }
}

// ===============================================
// WEEK VIEW GENERATION
// ===============================================

// Generate the week view calendar and summary
function generateWeekView() {
    elements.containers.weekView.innerHTML = '';
    
    // Set current week if not set
    if (!viewState.currentWeekStart) {
        viewState.currentWeekStart = new Date();
    }
    
    const weekDates = getWeekDates(new Date(viewState.currentWeekStart));
    
    // Create week view header with navigation
    const weekHeader = document.createElement('div');
    weekHeader.className = 'week-header';
    
    // Previous week button
    const prevWeekBtn = document.createElement('button');
    prevWeekBtn.innerHTML = '&larr;';
    prevWeekBtn.className = 'nav-arrow';
    prevWeekBtn.addEventListener('click', () => {
        const newStart = new Date(viewState.currentWeekStart);
        newStart.setDate(newStart.getDate() - 7);
        viewState.currentWeekStart = newStart;
        generateWeekView();
    });
    
    // Week range display
    const weekRange = document.createElement('h2');
    const startDate = weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDate = weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    weekRange.textContent = `${startDate} - ${endDate}`;
    
    // Next week button
    const nextWeekBtn = document.createElement('button');
    nextWeekBtn.innerHTML = '&rarr;';
    nextWeekBtn.className = 'nav-arrow';
    nextWeekBtn.addEventListener('click', () => {
        const newStart = new Date(viewState.currentWeekStart);
        newStart.setDate(newStart.getDate() + 7);
        viewState.currentWeekStart = newStart;
        generateWeekView();
    });
    
    // Add all elements to header
    weekHeader.appendChild(prevWeekBtn);
    weekHeader.appendChild(weekRange);
    weekHeader.appendChild(nextWeekBtn);
    elements.containers.weekView.appendChild(weekHeader);
    
    // Create week grid
    const weekGrid = document.createElement('div');
    weekGrid.className = 'week-grid';
    
    // Create day names header
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-name';
        dayHeader.textContent = day;
        weekGrid.appendChild(dayHeader);
    });
    
    // Create day cells with mood data
    weekDates.forEach(date => {
        const dateStr = formatDate(date);
        const dayCell = document.createElement('div');
        dayCell.className = 'day-cell';
        
        // Check if this is today
        if (dateStr === formatDate(new Date())) {
            dayCell.classList.add('today');
        }
        
        // Check if this is a future date
        const isFuture = isFutureDate(dateStr);
        if (isFuture) {
            dayCell.classList.add('future-date');
        }
        
        // Day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        dayCell.appendChild(dayNumber);
        
        // Get mood entries for this date
        const dayEntries = getMoodEntriesForDate(dateStr);
        
        // Mood emoji display
        const moodDisplay = document.createElement('div');
        moodDisplay.className = 'day-mood-display';
        
        // Check if there are entries for this date
        if (dayEntries.length > 0) {
            const mostFrequentMood = getMostFrequentMood(dayEntries);
            moodDisplay.innerHTML = `<span class="mood-emoji">${mostFrequentMood.emoji}</span>`;
            dayCell.setAttribute('data-entries', dayEntries.length);
            
            // Make cells clickable to navigate directly to day view
            dayCell.addEventListener('click', () => {
                viewState.selectedDate = dateStr;
                showView('day');
                updateNavButtons();
            });
        } else {
            moodDisplay.textContent = '—';
            // If future date or no entries, add disabled class
            dayCell.classList.add('disabled');
        }
        
        dayCell.appendChild(moodDisplay);
        weekGrid.appendChild(dayCell);
    });
    
    elements.containers.weekView.appendChild(weekGrid);
    
    // Add weekly summary section
    const weeklySummaryContainer = document.createElement('div');
    weeklySummaryContainer.id = 'weekly-summary';
    weeklySummaryContainer.className = 'mood-summary-container';
    
    // Get all entries for the current week
    const allWeekEntries = [];
    weekDates.forEach(date => {
        const dateStr = formatDate(date);
        const dayEntries = getMoodEntriesForDate(dateStr);
        allWeekEntries.push(...dayEntries);
    });
    
    // Generate summary if there are entries
    if (allWeekEntries.length > 0) {
        const weeklyStats = calculateMoodStats(allWeekEntries);
        
        const summaryTitle = document.createElement('h3');
        summaryTitle.textContent = 'Weekly Mood Summary';
        weeklySummaryContainer.appendChild(summaryTitle);
        
        const statsList = document.createElement('div');
        statsList.className = 'stats-list';
        
        // Sort moods by percentage (descending)
        const sortedMoods = Object.keys(weeklyStats).sort(
            (a, b) => weeklyStats[b].percentage - weeklyStats[a].percentage
        );
        
        // Create stats items for each mood
        sortedMoods.forEach(mood => {
            const moodStat = weeklyStats[mood];
            
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            
            const moodLabel = document.createElement('div');
            moodLabel.className = 'mood-label';
            moodLabel.innerHTML = `${moodStat.emoji} ${mood}`;
            
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';
            
            const progress = document.createElement('progress');
            progress.value = moodStat.percentage;
            progress.max = 100;
            progress.className = `mood-progress mood-${mood.toLowerCase()}`;
            
            const percentage = document.createElement('span');
            percentage.className = 'percentage';
            percentage.textContent = `${moodStat.percentage}%`;
            
            progressContainer.appendChild(progress);
            progressContainer.appendChild(percentage);
            
            statItem.appendChild(moodLabel);
            statItem.appendChild(progressContainer);
            statsList.appendChild(statItem);
        });
        
        weeklySummaryContainer.appendChild(statsList);
    } else {
        const noDataMsg = document.createElement('p');
        noDataMsg.className = 'no-data-message';
        noDataMsg.textContent = 'No mood data recorded for this week.';
        weeklySummaryContainer.appendChild(noDataMsg);
    }
    
    elements.containers.weekView.appendChild(weeklySummaryContainer);
}

// ===============================================
// MONTH VIEW GENERATION
// ===============================================

// Generate the month view calendar and summary
function generateMonthView() {
    elements.containers.monthView.innerHTML = '';
    
    // Set current month and year if not set
    if (viewState.currentMonth === null || viewState.currentYear === null) {
        const today = new Date();
        viewState.currentMonth = today.getMonth();
        viewState.currentYear = today.getFullYear();
    }
    
    // Create month view header with navigation
    const monthHeader = document.createElement('div');
    monthHeader.className = 'month-header';
    
    // Previous month button
    const prevMonthBtn = document.createElement('button');
    prevMonthBtn.innerHTML = '&larr;';
    prevMonthBtn.className = 'nav-arrow';
    prevMonthBtn.addEventListener('click', () => {
        if (viewState.currentMonth === 0) {
            viewState.currentMonth = 11;
            viewState.currentYear--;
        } else {
            viewState.currentMonth--;
        }
        generateMonthView();
    });
    
    // Month and year display
    const monthTitle = document.createElement('h2');
    monthTitle.textContent = new Date(viewState.currentYear, viewState.currentMonth, 1)
        .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Next month button
    const nextMonthBtn = document.createElement('button');
    nextMonthBtn.innerHTML = '&rarr;';
    nextMonthBtn.className = 'nav-arrow';
    nextMonthBtn.addEventListener('click', () => {
        if (viewState.currentMonth === 11) {
            viewState.currentMonth = 0;
            viewState.currentYear++;
        } else {
            viewState.currentMonth++;
        }
        generateMonthView();
    });
    
    // Add all elements to header
    monthHeader.appendChild(prevMonthBtn);
    monthHeader.appendChild(monthTitle);
    monthHeader.appendChild(nextMonthBtn);
    elements.containers.monthView.appendChild(monthHeader);
    
    // Create month grid
    const monthGrid = document.createElement('div');
    monthGrid.className = 'month-grid';
    
    // Create day names header
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-name';
        dayHeader.textContent = day;
        monthGrid.appendChild(dayHeader);
    });
    
    // Determine the first day of the month and offset
    const firstDay = new Date(viewState.currentYear, viewState.currentMonth, 1);
    let firstDayOfWeek = firstDay.getDay() || 7; // Convert Sunday (0) to 7
    firstDayOfWeek--; // Adjust to 0-indexed for the grid
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell empty';
        monthGrid.appendChild(emptyCell);
    }
    
    // Add cells for days of the month
    const daysInMonth = getDaysInMonth(viewState.currentYear, viewState.currentMonth);
    const today = new Date();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(viewState.currentYear, viewState.currentMonth, day);
        const dateStr = formatDate(date);
        
        const dayCell = document.createElement('div');
        dayCell.className = 'day-cell';
        
        // Check if this is today
        if (dateStr === formatDate(today)) {
            dayCell.classList.add('today');
        }
        
        // Check if this is a future date
        const isFuture = isFutureDate(dateStr);
        if (isFuture) {
            dayCell.classList.add('future-date');
        }
        
        // Day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);
        
        // Get mood entries for this date
        const dayEntries = getMoodEntriesForDate(dateStr);
        
        // Mood emoji display
        const moodDisplay = document.createElement('div');
        moodDisplay.className = 'day-mood-display';
        
        if (dayEntries.length > 0) {
            const mostFrequentMood = getMostFrequentMood(dayEntries);
            moodDisplay.innerHTML = `<span class="mood-emoji">${mostFrequentMood.emoji}</span>`;
            dayCell.setAttribute('data-entries', dayEntries.length);
            
            // Make cells clickable to navigate directly to day view
            dayCell.addEventListener('click', () => {
                viewState.selectedDate = dateStr;
                showView('day');
                updateNavButtons();
            });
        } else {
            moodDisplay.textContent = '—';
            // If future date or no entries, add disabled class
            dayCell.classList.add('disabled');
        }
        
        dayCell.appendChild(moodDisplay);
        monthGrid.appendChild(dayCell);
    }
    
    elements.containers.monthView.appendChild(monthGrid);
    
    // Add monthly summary section
    const monthlySummaryContainer = document.createElement('div');
    monthlySummaryContainer.id = 'monthly-summary';
    monthlySummaryContainer.className = 'mood-summary-container';
    
    // Get all entries for the current month
    let allMonthEntries = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(viewState.currentYear, viewState.currentMonth, day);
        const dateStr = formatDate(date);
        const dayEntries = getMoodEntriesForDate(dateStr);
        allMonthEntries.push(...dayEntries);
    }
    
    // Generate summary if there are entries
    if (allMonthEntries.length > 0) {
        const monthlyStats = calculateMoodStats(allMonthEntries);
        
        const summaryTitle = document.createElement('h3');
        summaryTitle.textContent = 'Monthly Mood Summary';
        monthlySummaryContainer.appendChild(summaryTitle);
        
        const statsList = document.createElement('div');
        statsList.className = 'stats-list';
        
        // Sort moods by percentage (descending)
        const sortedMoods = Object.keys(monthlyStats).sort(
            (a, b) => monthlyStats[b].percentage - monthlyStats[a].percentage
        );
        
        // Create stats items for each mood
        sortedMoods.forEach(mood => {
            const moodStat = monthlyStats[mood];
            
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            
            const moodLabel = document.createElement('div');
            moodLabel.className = 'mood-label';
            moodLabel.innerHTML = `${moodStat.emoji} ${mood}`;
            
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';
            
            const progress = document.createElement('progress');
            progress.value = moodStat.percentage;
            progress.max = 100;
            progress.className = `mood-progress mood-${mood.toLowerCase()}`;
            
            const percentage = document.createElement('span');
            percentage.className = 'percentage';
            percentage.textContent = `${moodStat.percentage}%`;
            
            progressContainer.appendChild(progress);
            progressContainer.appendChild(percentage);
            
            statItem.appendChild(moodLabel);
            statItem.appendChild(progressContainer);
            statsList.appendChild(statItem);
        });
        
        monthlySummaryContainer.appendChild(statsList);
    } else {
        const noDataMsg = document.createElement('p');
        noDataMsg.className = 'no-data-message';
        noDataMsg.textContent = 'No mood data recorded for this month.';
        monthlySummaryContainer.appendChild(noDataMsg);
    }
    
    elements.containers.monthView.appendChild(monthlySummaryContainer);
}

// ===============================================
// EVENT LISTENERS & INITIALIZATION
// ===============================================

// Event listeners for mood buttons
elements.moodSelector.buttons.forEach(button => {
    button.addEventListener('click', () => {
        selectMood(button);
        showMoodSelectionPopup(app.moodName, app.moodEmoji);
    });
});

// Event listener for creating mood card
elements.popup.saveButton.addEventListener('click', () => {
    app.moodReason = elements.popup.reasonInput.value;
    hidePopup();
    createMoodCardsFromUI();
    elements.popup.reasonInput.value = "";
});

// Event listener for resetting data
elements.navButtons.resetData.addEventListener('click', clearAllMoodData);

// Event listeners for navigation
elements.navButtons.today.addEventListener('click', () => {
    // Reset to today's date
    viewState.selectedDate = formatDate(new Date());
    showView('day');
    updateNavButtons();
});

elements.navButtons.weekView.addEventListener('click', () => {
    // Reset week view to current week
    viewState.currentWeekStart = new Date();
    showView('week');
    updateNavButtons();
});

elements.navButtons.monthView.addEventListener('click', () => {
    // Reset month view to current month
    const today = new Date();
    viewState.currentMonth = today.getMonth();
    viewState.currentYear = today.getFullYear();
    showView('month');
    updateNavButtons();
});

// Initialize the application on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set default view to day view
    viewState.currentView = 'day';
    viewState.selectedDate = formatDate(new Date()); // Set today as default
    
    // Show today's date in the date indicator
    elements.dateIndicator.textContent = formatDateToReadable(new Date());
    
    // Show the day view
    showView('day');
    updateNavButtons();
    
    // Render today's mood cards
    renderMoodCardsForDate(viewState.selectedDate);
});

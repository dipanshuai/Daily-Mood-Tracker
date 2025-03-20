
// ===================================
// DOM ELEMENTS
// ===================================

const elements = {
   // Mood selection
   moodCircles: document.querySelectorAll('.mood-circle'),
   
   // Date selection
   todayBtn: document.getElementById('today-btn'),
   thisWeekBtn: document.getElementById('this-week-btn'),
   monthViewBtn: document.getElementById('month-view-btn'),
   
   // Week overview
   weekOverview: document.getElementById('week-overview'),
   weekDaysContainer: document.getElementById('week-days-container'),
   weeklyMoodStats: document.getElementById('weekly-mood-stats'),
   
   // Month overview
   monthOverview: document.getElementById('month-overview'),
   overviewCalendarDays: document.getElementById('overview-calendar-days'),
   overviewCalendarTitle: document.getElementById('overview-calendar-title'),
   overviewPrevMonthBtn: document.getElementById('overview-prev-month'),
   overviewNextMonthBtn: document.getElementById('overview-next-month'),
   monthlyMoodStats: document.getElementById('monthly-mood-stats'),
   
   // Mood stats and cards
   moodStatsGrid: document.getElementById('mood-stats-grid'),
   moodCardsContainer: document.getElementById('mood-cards-container'),
   
   // Overlay and popups
   overlay: document.getElementById('overlay'),
   moodInputPopup: document.getElementById('mood-input-popup'),
   calendarPopup: document.getElementById('calendar-popup'),
   closeButtons: document.querySelectorAll('.close-btn'),
   
   // Mood input
   selectedEmoji: document.getElementById('selected-emoji'),
   selectedMoodName: document.getElementById('selected-mood-name'),
   selectedMoodReason: document.getElementById('selected-mood-reason'),
   reasonInput: document.getElementById('reason'),
   submitMoodBtn: document.getElementById('submit-mood-btn'),
   
   // Calendar
   calendarDays: document.getElementById('calendar-days'),
   calendarTitle: document.getElementById('calendar-title'),
   prevMonthBtn: document.getElementById('prev-month'),
   nextMonthBtn: document.getElementById('next-month'),
   viewMoodBtn: document.getElementById('view-mood-btn'),
   
   // Clear data
   clearDataBtn: document.getElementById('clear-data')
};

// ===================================
// APPLICATION STATE
// ===================================

const app = {
   selectedMood: null,
   selectedDate: new Date(),
   currentCalendarDate: new Date(),
   overviewCalendarDate: new Date(),
   selectedCalendarDay: null,
   isWeekViewActive: false,
   isMonthViewActive: false,
   moodEmojis: {
      'Happy': '😊',
      'Sad': '😢',
      'Angry': '😠',
      'Stressed': '😫',
      'Relaxed': '😌',
      'Tired': '😴'
   }
};

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Gets current timestamp and returns formatted time data
 * @returns {Object} Time information in various formats
 */
function getTimeStamp() {
   const d = new Date();
   const hourInNum = d.getHours();
   const minuteInNum = d.getMinutes();
   const secondInNum = d.getSeconds();
   const time = d.getTime();

   // Format time values with leading zeros if needed
   const hour = String(hourInNum).padStart(2, '0');
   const minute = String(minuteInNum).padStart(2, '0');
   const second = String(secondInNum).padStart(2, '0');
   const notation = hourInNum < 12 ? "AM" : "PM";

   return {
      timestamp: d,
      time: time,
      hourAndMinute: `${hour}:${minute} ${notation}`,
      hourInNum: hourInNum,
      minuteInNum: minuteInNum,
      secondInNum: secondInNum,
      hour: hour,
      minute: minute,
      second: second,
      notation: notation,
      fullDate: d.toDateString()
   };
}

/**
 * Formats a date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
   return new Date(date).toDateString();
}

/**
 * Format time from seconds to human-readable format
 * @param {number} totalSeconds - Total seconds to format
 * @returns {string} Formatted time string
 */
function formatTimeFromSeconds(totalSeconds) {
   if (totalSeconds < 60) {
      return `${totalSeconds} second${totalSeconds !== 1 ? 's' : ''}`;
   }
   
   const hours = Math.floor(totalSeconds / 3600);
   const minutes = Math.floor((totalSeconds % 3600) / 60);
   const seconds = totalSeconds % 60;
   
   let formattedTime = [];
   
   if (hours > 0) {
      formattedTime.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
   }
   
   if (minutes > 0) {
      formattedTime.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
   }
   
   if (seconds > 0 && hours === 0) {
      formattedTime.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
   }
   
   return formattedTime.join(' ');
}

/**
 * Calculate total seconds from milliseconds
 * @param {number} milliseconds - Milliseconds to convert
 * @returns {number} Total seconds
 */
function calculateTotalSeconds(milliseconds) {
   return Math.floor(milliseconds / 1000);
}

/**
 * Calculates and formats duration between two timestamps
 * @param {number} startTime - Start timestamp in milliseconds
 * @param {number} endTime - End timestamp in milliseconds
 * @returns {string} Formatted duration string
 */
function calculateDuration(startTime, endTime) {
   // Calculate the difference in milliseconds
   let diffMs = endTime - startTime;

   // Handle overnight scenarios
   if (diffMs < 0) {
      // Add 24 hours in milliseconds
      diffMs += 24 * 60 * 60 * 1000;
   }

   // Calculate total seconds
   const totalSeconds = calculateTotalSeconds(diffMs);
   
   // Format the time
   return formatTimeFromSeconds(totalSeconds);
}

/**
 * Check if two dates are on the same day
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} True if same day
 */
function isSameDay(date1, date2) {
   const d1 = new Date(date1);
   const d2 = new Date(date2);
   
   return d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate();
}

/**
 * Check if a date is today
 * @param {Date|string} dateStr - Date to check
 * @returns {boolean} True if date is today
 */
function isToday(dateStr) {
   return isSameDay(new Date(dateStr), new Date());
}

/**
 * Check if a date is in the future
 * @param {Date|string} dateStr - Date to check
 * @returns {boolean} True if date is in the future
 */
function isFutureDate(dateStr) {
   const date = new Date(dateStr);
   const today = new Date();
   
   // Set today to end of day for comparison
   today.setHours(23, 59, 59, 999);
   
   return date > today;
}

/**
 * Get days in a month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Number of days in the month
 */
function getDaysInMonth(year, month) {
   return new Date(year, month + 1, 0).getDate();
}

/**
 * Get first day of month (0 = Sunday, 1 = Monday, etc.)
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Day of week (0-6)
 */
function getFirstDayOfMonth(year, month) {
   return new Date(year, month, 1).getDay();
}

/**
 * Get the start of the current week (Sunday)
 * @returns {Date} Date object for the first day of the current week
 */
function getStartOfWeek() {
   const today = new Date();
   const day = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
   const diff = today.getDate() - day;
   return new Date(today.setDate(diff));
}

/**
 * Get dates for the current week (Sunday to Saturday)
 * @returns {Array} Array of date objects for the week
 */
function getCurrentWeekDates() {
   const startOfWeek = getStartOfWeek();
   const weekDates = [];
   
   for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
   }
   
   return weekDates;
}

/**
 * Format a date to show day name
 * @param {Date} date - Date to format
 * @returns {string} Day name (e.g., "Sunday")
 */
function getDayName(date) {
   return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Format a date to short month and day format
 * @param {Date} date - Date to format
 * @returns {string} Formatted date (e.g., "Mar 15")
 */
function formatShortDate(date) {
   return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ===================================
// STORAGE FUNCTIONS
// ===================================

/**
 * Gets all mood entries from localStorage
 * @returns {Array} Array of mood entries
 */
function getMoodEntries() {
   try {
      return JSON.parse(localStorage.getItem('moodEntries')) || [];
   } catch (error) {
      console.error('Error retrieving mood entries from localStorage:', error);
      return [];
   }
}

/**
 * Saves mood entries to localStorage
 * @param {Array} entries - Mood entries to save
 */
function saveMoodEntries(entries) {
   try {
      localStorage.setItem('moodEntries', JSON.stringify(entries));
   } catch (error) {
      console.error('Error saving mood entries to localStorage:', error);
      alert('Failed to save your mood data. Please try again or check your browser settings.');
   }
}

/**
 * Adds a new mood entry to storage
 * @param {string} mood - Mood name
 * @param {string} reason - Reason for the mood
 */
function saveMood(mood, reason) {
   const entries = getMoodEntries();
   const timeInfo = getTimeStamp();

   // Add new mood entry at the beginning of the array
   entries.unshift({
      mood: mood,
      moodEmoji: app.moodEmojis[mood],
      reason: reason,
      startTime: timeInfo.time,
      endTime: null,
      showStartTime: timeInfo.hourAndMinute,
      showEndTime: "Now",
      duration: "Just now",
      dateObj: new Date().toISOString(),
      date: timeInfo.fullDate
   });

   // If there's a previous entry, update its end time and duration
   if (entries.length > 1) {
      entries[1].endTime = timeInfo.time;
      entries[1].showEndTime = timeInfo.hourAndMinute;
      entries[1].duration = calculateDuration(entries[1].startTime, entries[1].endTime);
   }

   saveMoodEntries(entries);
}

/**
 * Clears all mood data from localStorage
 */
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

// ===================================
// UI FUNCTIONS
// ===================================

/**
 * Open the mood input popup
 * @param {string} mood - Selected mood
 * @param {string} emoji - Mood emoji
 */
function openMoodInputPopup(mood, emoji) {
   app.selectedMood = mood;
   elements.selectedEmoji.textContent = emoji;
   elements.selectedMoodName.textContent = mood;
   elements.selectedMoodReason.textContent = mood.toLowerCase();
   elements.reasonInput.value = '';
   
   elements.overlay.classList.remove('hidden');
   elements.moodInputPopup.classList.remove('hidden');
   elements.reasonInput.focus();
}

/**
 * Open the calendar popup for date selection
 */
function openCalendarPopup() {
   elements.overlay.classList.remove('hidden');
   elements.calendarPopup.classList.remove('hidden');
   
   app.currentCalendarDate = new Date();
   renderCalendar();
}

/**
 * Close all popups
 */
function closePopups() {
   elements.overlay.classList.add('hidden');
   elements.moodInputPopup.classList.add('hidden');
   elements.calendarPopup.classList.add('hidden');
   
   app.selectedCalendarDay = null;
   elements.viewMoodBtn.disabled = true;
}

/**
 * Creates a mood card element
 * @param {Object} moodData - Mood entry data
 * @returns {HTMLElement} Mood card element
 */
function createMoodCard(moodData) {
   const card = document.createElement('div');
   card.className = 'mood-card';
   card.setAttribute('data-timestamp', moodData.startTime);
   
   card.innerHTML = `
      <div class="mood-info">
         <div class="mood-header">
            <span class="mood-emoji">${moodData.moodEmoji}</span>
            <span class="mood-name">${moodData.mood}</span>
         </div>
         <p class="mood-reason">${moodData.reason}</p>
      </div>
      <div class="mood-time">
         <div class="time-range">${moodData.showStartTime} - ${moodData.showEndTime}</div>
         <div class="duration">${moodData.duration}</div>
      </div>
   `;
   
   return card;
}

/**
 * Load mood entries for a specific date
 * @param {Date|string} date - Date to load entries for
 */
function loadMoodEntriesForDate(date) {
   const allEntries = getMoodEntries();
   const targetDate = new Date(date);
   
   // Filter entries for the selected date
   const dateEntries = allEntries.filter(entry => 
      isSameDay(new Date(entry.dateObj), targetDate)
   );
   
   // Update the selected date
   app.selectedDate = targetDate;
   
   // Hide week and month overviews if they're visible
   if (app.isWeekViewActive) {
      toggleWeekView();
   }
   
   if (app.isMonthViewActive) {
      toggleMonthView();
   }
   
   // Clear existing content
   elements.moodCardsContainer.innerHTML = '';
   
   if (dateEntries.length === 0) {
      const noData = document.createElement('div');
      noData.className = 'no-data';
      noData.textContent = `No mood entries for ${formatDate(targetDate)}`;
      elements.moodCardsContainer.appendChild(noData);
   } else {
      // Add each entry to the container
      dateEntries.forEach(entry => {
         const card = createMoodCard(entry);
         elements.moodCardsContainer.appendChild(card);
      });
   }
   
   // Update mood stats
   updateMoodStats(dateEntries);
}

/**
 * Update mood statistics with progress bars
 * @param {Array} entries - Mood entries to analyze
 */
function updateMoodStats(entries) {
   elements.moodStatsGrid.innerHTML = '';
   
   if (entries.length === 0) {
      elements.moodStatsGrid.innerHTML = '<div class="no-stats">No data available</div>';
      return;
   }
   
   // Calculate total time for each mood
   const moodTimes = {};
   let totalTrackedSeconds = 0;
   
   // Initialize time for all moods to 0
   Object.keys(app.moodEmojis).forEach(mood => {
      moodTimes[mood] = 0;
   });
   
   // Calculate time for each mood
   entries.forEach(entry => {
      if (entry.endTime) {
         const durationMs = entry.endTime - entry.startTime;
         const durationSec = calculateTotalSeconds(durationMs);
         
         moodTimes[entry.mood] += durationSec;
         totalTrackedSeconds += durationSec;
      }
   });
   
   // Create a stat item for each mood with data
   Object.keys(moodTimes)
      .filter(mood => moodTimes[mood] > 0)
      .sort((a, b) => moodTimes[b] - moodTimes[a])
      .forEach(mood => {
         const statItem = document.createElement('div');
         statItem.className = `stat-item mood-${mood}`;
         
         const percentage = totalTrackedSeconds > 0 
            ? Math.round((moodTimes[mood] / totalTrackedSeconds) * 100) 
            : 0;
         
         statItem.innerHTML = `
            <div class="stat-emoji">${app.moodEmojis[mood]}</div>
            <div class="stat-details">
               <div class="stat-label">
                  <span>${mood}</span>
                  <span class="stat-percentage">${percentage}%</span>
               </div>
               <div class="stat-progress">
                  <div class="stat-progress-bar" style="width: ${percentage}%"></div>
               </div>
               <div class="stat-time">${formatTimeFromSeconds(moodTimes[mood])}</div>
            </div>
         `;
         
         elements.moodStatsGrid.appendChild(statItem);
      });
   
   // If no stats available yet (only most recent mood with no duration)
   if (elements.moodStatsGrid.children.length === 0) {
      const noStatsMsg = document.createElement('div');
      noStatsMsg.className = 'no-stats';
      noStatsMsg.textContent = 'Not enough data to calculate mood durations yet';
      elements.moodStatsGrid.appendChild(noStatsMsg);
   }
}

/**
 * Render the calendar for date selection
 */
function renderCalendar() {
   const year = app.currentCalendarDate.getFullYear();
   const month = app.currentCalendarDate.getMonth();
   const today = new Date();
   
   // Set calendar title
   elements.calendarTitle.textContent = new Date(year, month, 1).toLocaleDateString('default', { 
      month: 'long', 
      year: 'numeric' 
   });
   
   // Clear calendar days
   elements.calendarDays.innerHTML = '';
   
   // Get entries with dates
   const allEntries = getMoodEntries();
   
   // Get days in the month and first day of month
   const daysInMonth = getDaysInMonth(year, month);
   const firstDay = getFirstDayOfMonth(year, month);
   
   // Create empty cells for days before the first day of the month
   for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day empty';
      elements.calendarDays.appendChild(emptyDay);
   }
   
   // Create cells for each day in the month
   for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString();
      
      const dayCell = document.createElement('div');
      dayCell.className = 'calendar-day';
      dayCell.textContent = day;
      
      // Check if this day has entries
      const hasEntries = allEntries.some(entry => isSameDay(new Date(entry.dateObj), date));
      
      // Check if this is today
      if (isSameDay(date, today)) {
         dayCell.classList.add('today');
      }
      
      // Check if selected
      if (app.selectedCalendarDay && isSameDay(app.selectedCalendarDay, date)) {
         dayCell.classList.add('selected');
      }
      
      // Check if future date
      if (isFutureDate(date)) {
         dayCell.classList.add('disabled');
      } else {
         // Add click event for non-future dates
         dayCell.addEventListener('click', () => {
            // Remove selected class from all days
            document.querySelectorAll('.calendar-day.selected').forEach(el => {
               el.classList.remove('selected');
            });
            
            // Add selected class to clicked day
            dayCell.classList.add('selected');
            
            // Update selected date
            app.selectedCalendarDay = date;
            
            // Enable view button
            elements.viewMoodBtn.disabled = false;
         });
      }
      
      // Mark days with entries
      if (hasEntries) {
         dayCell.classList.add('has-entry');
      }
      
      elements.calendarDays.appendChild(dayCell);
   }
}

/**
 * Submit a new mood entry
 */
function submitMood() {
   const mood = app.selectedMood;
   const reason = elements.reasonInput.value.trim();
   
   if (!mood) {
      alert('Please select a mood');
      return;
   }
   
   if (!reason) {
      alert('Please enter a reason for your mood');
      return;
   }
   
   // Save the mood entry
   saveMood(mood, reason);
   
   // Close the popup
   closePopups();
   
   // Reload today's entries
   loadMoodEntriesForDate(new Date());
}

/**
 * Toggle week view
 */
function toggleWeekView() {
   // Toggle week view state
   app.isWeekViewActive = !app.isWeekViewActive;
   
   if (app.isWeekViewActive) {
      // Close month view if it's open
      if (app.isMonthViewActive) {
         app.isMonthViewActive = false;
         elements.monthOverview.classList.add('hidden');
         elements.monthViewBtn.classList.remove('active');
      }
      
      // Show week view, hide cards
      elements.moodCardsContainer.classList.add('hidden');
      elements.weekOverview.classList.remove('hidden');
      elements.thisWeekBtn.classList.add('active');
      
      // Render the week overview
      renderWeekOverview();
   } else {
      // Hide week view, show cards
      elements.moodCardsContainer.classList.remove('hidden');
      elements.weekOverview.classList.add('hidden');
      elements.thisWeekBtn.classList.remove('active');
   }
}

/**
 * Render the week overview
 */
function renderWeekOverview() {
   const weekDates = getCurrentWeekDates();
   const allEntries = getMoodEntries();
   
   // Clear previous content
   elements.weekDaysContainer.innerHTML = '';
   
   // Create day elements for each day of the week
   weekDates.forEach(date => {
      // Filter entries for this day
      const dayEntries = allEntries.filter(entry => 
         isSameDay(new Date(entry.dateObj), date)
      );
      
      // Create day element
      const dayElement = document.createElement('div');
      dayElement.className = 'week-day';
      
      // Check if this day is today
      if (isToday(date)) {
         dayElement.classList.add('today');
      }
      
      // Check if this day has entries
      if (dayEntries.length > 0) {
         dayElement.classList.add('has-entry');
      }
      
      // Get most frequent mood for this day if there are entries
      let dominantMood = null;
      let dominantMoodEmoji = '';
      
      if (dayEntries.length > 0) {
         dominantMood = getMostFrequentMood(dayEntries);
         dominantMoodEmoji = app.moodEmojis[dominantMood];
      }
      
      // Create day content
      dayElement.innerHTML = `
         <div class="week-day-name">${getDayName(date)}</div>
         <div class="week-day-date">${formatShortDate(date)}</div>
         <div class="week-day-mood">${dominantMoodEmoji}</div>
      `;
      
      // Add click event to view this day's entries
      dayElement.addEventListener('click', () => {
         loadMoodEntriesForDate(date);
      });
      
      elements.weekDaysContainer.appendChild(dayElement);
   });
   
   // Update weekly mood summary
   updateWeeklyMoodSummary(weekDates);
}

/**
 * Update the weekly mood summary
 * @param {Array} weekDates - Array of dates for the week
 */
function updateWeeklyMoodSummary(weekDates) {
   const allEntries = getMoodEntries();
   
   // Count the dominant moods for each day of the week
   const moodOccurrences = {};
   
   // Initialize mood occurrences
   Object.keys(app.moodEmojis).forEach(mood => {
      moodOccurrences[mood] = {
         count: 0,
         days: []
      };
   });
   
   // Analyze each day of the week
   weekDates.forEach(date => {
      // Filter entries for this day
      const dayEntries = allEntries.filter(entry => 
         isSameDay(new Date(entry.dateObj), date)
      );
      
      // If there are entries, get the most frequent mood
      if (dayEntries.length > 0) {
         const dominantMood = getMostFrequentMood(dayEntries);
         if (dominantMood) {
            moodOccurrences[dominantMood].count++;
            moodOccurrences[dominantMood].days.push({
               date: date,
               dayName: getDayName(date)
            });
         }
      }
   });
   
   // Clear previous summary
   elements.weeklyMoodStats.innerHTML = '';
   
   // Check if there's any mood data for the week
   const hasData = Object.values(moodOccurrences).some(mood => mood.count > 0);
   
   if (!hasData) {
      elements.weeklyMoodStats.innerHTML = '<div class="no-stats">No mood data for this week</div>';
      return;
   }
   
   // Create a summary item for each mood with occurrences
   Object.keys(moodOccurrences)
      .filter(mood => moodOccurrences[mood].count > 0)
      .sort((a, b) => moodOccurrences[b].count - moodOccurrences[a].count)
      .forEach(mood => {
         const moodData = moodOccurrences[mood];
         
         const moodItem = document.createElement('div');
         moodItem.className = 'weekly-mood-item';
         
         // Create day tags for each day
         const dayTags = moodData.days.map(day => {
            return `<span class="day-tag">${day.dayName}</span>`;
         }).join('');
         
         moodItem.innerHTML = `
            <div class="weekly-mood-emoji">${app.moodEmojis[mood]}</div>
            <div class="weekly-mood-details">
               <div class="weekly-mood-name">${mood} was your main mood on ${moodData.count} day${moodData.count !== 1 ? 's' : ''}</div>
               <div class="weekly-mood-dates">${dayTags}</div>
            </div>
         `;
         
         elements.weeklyMoodStats.appendChild(moodItem);
      });
}

/**
 * Toggle month view
 */
function toggleMonthView() {
   app.isMonthViewActive = !app.isMonthViewActive;
   
   if (app.isMonthViewActive) {
      // Close week view if it's open
      if (app.isWeekViewActive) {
         app.isWeekViewActive = false;
         elements.weekOverview.classList.add('hidden');
         elements.thisWeekBtn.classList.remove('active');
      }
      
      // Show month view, hide cards
      elements.moodCardsContainer.classList.add('hidden');
      elements.monthOverview.classList.remove('hidden');
      elements.monthViewBtn.classList.add('active');
      
      // Render the month overview
      renderMonthOverview();
      updateMonthlyMoodSummary();
   } else {
      // Hide month view, show cards
      elements.moodCardsContainer.classList.remove('hidden');
      elements.monthOverview.classList.add('hidden');
      elements.monthViewBtn.classList.remove('active');
   }
}

/**
 * Get the most frequent mood for a day
 * @param {Array} entries - Entries to analyze
 * @returns {string|null} Most frequent mood or null if no entries
 */
function getMostFrequentMood(entries) {
   if (entries.length === 0) return null;
   
   // Count occurrences of each mood
   const moodCounts = {};
   
   // Initialize mood counts to zero
   Object.keys(app.moodEmojis).forEach(mood => {
      moodCounts[mood] = 0;
   });
   
   // Count each mood occurrence
   entries.forEach(entry => {
      moodCounts[entry.mood]++;
   });
   
   // Find the mood with the highest count
   let mostFrequentMood = null;
   let highestCount = 0;
   
   Object.keys(moodCounts).forEach(mood => {
      if (moodCounts[mood] > highestCount) {
         highestCount = moodCounts[mood];
         mostFrequentMood = mood;
      }
   });
   
   return mostFrequentMood;
}

/**
 * Render the month overview calendar
 */
function renderMonthOverview() {
   const year = app.overviewCalendarDate.getFullYear();
   const month = app.overviewCalendarDate.getMonth();
   const today = new Date();
   
   // Set calendar title
   elements.overviewCalendarTitle.textContent = new Date(year, month, 1).toLocaleDateString('default', { 
      month: 'long', 
      year: 'numeric' 
   });
   
   // Clear calendar days
   elements.overviewCalendarDays.innerHTML = '';
   
   // Get entries with dates
   const allEntries = getMoodEntries();
   
   // Get days in the month and first day of month
   const daysInMonth = getDaysInMonth(year, month);
   const firstDay = getFirstDayOfMonth(year, month);
   
   // Create empty cells for days before the first day of the month
   for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'overview-day empty';
      elements.overviewCalendarDays.appendChild(emptyDay);
   }
   
   // Create cells for each day in the month
   for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      
      const dayCell = document.createElement('div');
      dayCell.className = 'overview-day';
      
      // Add day number
      const dayNumber = document.createElement('div');
      dayNumber.className = 'overview-day-number';
      dayNumber.textContent = day;
      dayCell.appendChild(dayNumber);
      
      // Filter entries for this day
      const dayEntries = allEntries.filter(entry => 
         isSameDay(new Date(entry.dateObj), date)
      );
      
      // Add the most frequent mood emoji
      const dayMood = document.createElement('div');
      dayMood.className = 'overview-day-mood';
      
      if (dayEntries.length > 0) {
         const mostFrequentMood = getMostFrequentMood(dayEntries);
         if (mostFrequentMood) {
            dayMood.textContent = app.moodEmojis[mostFrequentMood];
            dayCell.classList.add('has-entry');
            
            // Add click event to view this day's entries
            dayCell.addEventListener('click', () => {
               loadMoodEntriesForDate(date);
            });
         }
      }
      
      dayCell.appendChild(dayMood);
      
      // Check if this is today
      if (isSameDay(date, today)) {
         dayCell.classList.add('today');
      }
      
      // Check if future date
      if (isFutureDate(date)) {
         dayCell.classList.add('future');
         // Remove any click event
         dayCell.replaceWith(dayCell.cloneNode(true));
      }
      
      elements.overviewCalendarDays.appendChild(dayCell);
   }
   
   // Update the monthly mood summary
   updateMonthlyMoodSummary();
}

/**
 * Get the days when a mood was the most frequent
 * @param {Array} entries - Entries to analyze
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {Object} Object mapping moods to arrays of days
 */
function getMoodMostFrequentDays(entries, year, month) {
   const daysInMonth = getDaysInMonth(year, month);
   const moodFrequencyByDay = {};
   
   // Initialize mood frequency data structure
   Object.keys(app.moodEmojis).forEach(mood => {
      moodFrequencyByDay[mood] = {};
      
      for (let day = 1; day <= daysInMonth; day++) {
         moodFrequencyByDay[mood][day] = 0;
      }
   });
   
   // Count mood occurrences by day
   entries.forEach(entry => {
      const entryDate = new Date(entry.dateObj);
      if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
         const day = entryDate.getDate();
         const mood = entry.mood;
         
         if (mood in moodFrequencyByDay) {
            moodFrequencyByDay[mood][day]++;
         }
      }
   });
   
   // Find days when each mood was most frequent
   const moodDominantDays = {};
   
   for (let day = 1; day <= daysInMonth; day++) {
      let maxCount = 0;
      let dominantMood = null;
      
      Object.keys(app.moodEmojis).forEach(mood => {
         const count = moodFrequencyByDay[mood][day];
         if (count > maxCount) {
            maxCount = count;
            dominantMood = mood;
         }
      });
      
      if (dominantMood && maxCount > 0) {
         if (!moodDominantDays[dominantMood]) {
            moodDominantDays[dominantMood] = [];
         }
         moodDominantDays[dominantMood].push(day);
      }
   }
   
   return moodDominantDays;
}

/**
 * Update the monthly mood summary
 */
function updateMonthlyMoodSummary() {
   const year = app.overviewCalendarDate.getFullYear();
   const month = app.overviewCalendarDate.getMonth();
   const allEntries = getMoodEntries();
   
   // Get days when each mood was dominant
   const moodDominantDays = getMoodMostFrequentDays(allEntries, year, month);
   
   // Clear previous summary
   elements.monthlyMoodStats.innerHTML = '';
   
   // If no data available
   if (Object.keys(moodDominantDays).length === 0) {
      elements.monthlyMoodStats.innerHTML = '<div class="no-stats">No mood data for this month</div>';
      return;
   }
   
   // Create a summary item for each mood
   Object.keys(moodDominantDays)
      .sort((a, b) => moodDominantDays[b].length - moodDominantDays[a].length)
      .forEach(mood => {
         const days = moodDominantDays[mood];
         const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' });
         
         const moodItem = document.createElement('div');
         moodItem.className = 'monthly-mood-item';
         
         // Create date tags for each day
         const dateTags = days.map(day => {
            return `<span class="date-tag">${monthName} ${day}</span>`;
         }).join('');
         
         moodItem.innerHTML = `
            <div class="monthly-mood-emoji">${app.moodEmojis[mood]}</div>
            <div class="monthly-mood-details">
               <div class="monthly-mood-name">${mood} was your main mood on ${days.length} day${days.length !== 1 ? 's' : ''}</div>
               <div class="monthly-mood-dates">${dateTags}</div>
            </div>
         `;
         
         elements.monthlyMoodStats.appendChild(moodItem);
      });
}

// ===================================
// EVENT LISTENERS
// ===================================

// Mood circle click
elements.moodCircles.forEach(circle => {
   circle.addEventListener('click', () => {
      const mood = circle.getAttribute('data-mood');
      const emoji = circle.querySelector('.emoji').textContent;
      openMoodInputPopup(mood, emoji);
   });
});

// Today button click
elements.todayBtn.addEventListener('click', () => {
   // Set button states
   elements.todayBtn.classList.add('active');
   elements.thisWeekBtn.classList.remove('active');
   elements.monthViewBtn.classList.remove('active');
   
   loadMoodEntriesForDate(new Date());
});

// This Week button click
elements.thisWeekBtn.addEventListener('click', () => {
   // Set button states
   elements.todayBtn.classList.remove('active');
   elements.thisWeekBtn.classList.add('active');
   elements.monthViewBtn.classList.remove('active');
   
   toggleWeekView();
});

// Month View button click
elements.monthViewBtn.addEventListener('click', () => {
   // Set button states
   elements.todayBtn.classList.remove('active');
   elements.thisWeekBtn.classList.remove('active');
   elements.monthViewBtn.classList.add('active');
   
   toggleMonthView();
});

// Close buttons
elements.closeButtons.forEach(btn => {
   btn.addEventListener('click', closePopups);
});

// Submit mood button
elements.submitMoodBtn.addEventListener('click', submitMood);

// Reason input enter key
elements.reasonInput.addEventListener('keypress', (e) => {
   if (e.key === 'Enter') {
      e.preventDefault();
      submitMood();
   }
});

// View mood button
elements.viewMoodBtn.addEventListener('click', () => {
   if (app.selectedCalendarDay) {
      loadMoodEntriesForDate(app.selectedCalendarDay);
      closePopups();
   }
});

// Calendar navigation
elements.prevMonthBtn.addEventListener('click', () => {
   const currentDate = app.currentCalendarDate;
   app.currentCalendarDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
   renderCalendar();
});

elements.nextMonthBtn.addEventListener('click', () => {
   const currentDate = app.currentCalendarDate;
   app.currentCalendarDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
   renderCalendar();
});

// Month overview navigation
elements.overviewPrevMonthBtn.addEventListener('click', () => {
   const currentDate = app.overviewCalendarDate;
   app.overviewCalendarDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
   renderMonthOverview();
});

elements.overviewNextMonthBtn.addEventListener('click', () => {
   const currentDate = app.overviewCalendarDate;
   app.overviewCalendarDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
   renderMonthOverview();
});

// Clear data button
elements.clearDataBtn.addEventListener('click', clearAllMoodData);

// Close popup when clicking on overlay (outside the popup)
elements.overlay.addEventListener('click', (e) => {
   if (e.target === elements.overlay) {
      closePopups();
   }
});

// ===================================
// INITIALIZATION
// ===================================

/**
 * Initialize the application
 * Load today's entries by default
 */
document.addEventListener('DOMContentLoaded', () => {
   // Set today button as active by default
   elements.todayBtn.classList.add('active');
   
   // Load today's mood entries
   loadMoodEntriesForDate(new Date());
});
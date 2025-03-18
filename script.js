/**
 * Mood Tracker Application
 * A simple application to track moods over time with reasons and duration.
 */

// DOM Elements - cached for better performance
const elements = {
   moodSelector: document.getElementById('mood-selector'),
   reasonInput: document.getElementById('reason'),
   submitBtn: document.getElementById('submit-btn'),
   moodCardsContainer: document.getElementById('mood-cards-container'),
   clearDataBtn: document.getElementById('clear-data')
};

// Application State
const app = {
   selectedMood: elements.moodSelector.value
};

/**
 * ============================
 * UTILITY FUNCTIONS
 * ============================
 */

// Gets current timestamp and returns formatted time data

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
      notation: notation
   };
}

// Calculates and formats duration between two timestamps

function calculateDuration(startTime, endTime) {
   // Calculate the difference in milliseconds
   let diffMs = endTime - startTime;

   // Handle overnight scenarios
   if (diffMs < 0) {
      // Add 24 hours in milliseconds
      diffMs += 24 * 60 * 60 * 1000;
   }

   // Convert to hours, minutes, seconds
   const hours = Math.floor(diffMs / (1000 * 60 * 60));
   const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
   const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

   // Format the output string with appropriate units
   let formattedDuration = [];

   if (hours > 0) {
      formattedDuration.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
   }

   if (minutes > 0) {
      formattedDuration.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
   }

   // Always include seconds
   formattedDuration.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);

   return formattedDuration.join(' ');
}

/**
 * ============================
 * STORAGE FUNCTIONS
 * ============================
 */

//    Gets all mood entries from localStorage

function getMoodEntries() {
   try {
      return JSON.parse(localStorage.getItem('moodEntries')) || [];
   } catch (error) {
      console.error('Error retrieving mood entries from localStorage:', error);
      return [];
   }
}

//   Saves mood entries to localStorage

function saveMoodEntries(entries) {
   try {
      localStorage.setItem('moodEntries', JSON.stringify(entries));
   } catch (error) {
      console.error('Error saving mood entries to localStorage:', error);
      alert('Failed to save your mood data. Please try again or check your browser settings.');
   }
}

//   Adds a new mood entry to storage

function saveMood(mood, reason, showStartTime, startTime, timeStamp) {
   const entries = getMoodEntries();

   // Add new mood entry at the beginning of the array
   entries.unshift({
      mood: mood,
      reason: reason,
      showStartTime: showStartTime,
      showEndTime: "Now",
      startTime: startTime,
      endTime: undefined,
      duration: "Now",
      timeStamp: timeStamp
   });

   saveMoodEntries(entries);
}

//  Updates the previous mood card with end time and duration

function updatePreviousCard(showEndTime, duration) {
   const entries = getMoodEntries();

   // Only update if there's a previous entry
   if (entries.length >= 2) {
      entries[1].showEndTime = showEndTime;
      entries[1].duration = duration;
      saveMoodEntries(entries);
   }
}

//  Clears all mood data from localStorage

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

/**
 * ============================
 * UI FUNCTIONS
 * ============================
 */

//  Creates a mood card element

function createMoodCardElement(moodData) {
   const card = document.createElement('div');
   card.classList.add('innerrow');
   card.setAttribute('timestamp', moodData.timeStamp)

   card.innerHTML = `
     <div class="colcontent">
       <h3>Mood: ${moodData.mood}</h3>
       <p>Reason: ${moodData.reason}</p>
     </div>
     <div class="colcontent">
       <p ${moodData.startTime ? `startTime="${moodData.startTime}"` : ''}>
         From ${moodData.showStartTime} to <span>${moodData.showEndTime}</span>
       </p>
       ${moodData.duration ? `<p>Duration: ${moodData.duration}</p>` : ''}
     </div>`;

   return card;
}

//  Loads and displays all saved mood entries

function loadAllMoods() {
   const moodEntries = getMoodEntries();

   // Clear existing content to prevent duplicates
   elements.moodCardsContainer.innerHTML = '';

   // Add each mood entry to the container
   moodEntries.forEach(entry => {
      const card = createMoodCardElement(entry);
      elements.moodCardsContainer.appendChild(card);
   });
}

// Creates a new mood card and updates previous card

function createNewMoodCard() {
   // Validate form input
   const reasonValue = elements.reasonInput.value.trim();
   if (!reasonValue) {
      alert('Please enter a reason for your mood');
      return;
   }

   // Get current mood and time information
   const selectedMoodValue = app.selectedMood;
   const timeInfo = getTimeStamp();
   const showStartTime = timeInfo.hourAndMinute;
   const startTime = timeInfo.time;
   const timeStamp = timeInfo.timestamp;

   // Create and add the new mood card to DOM
   const newMoodCard = createMoodCardElement({
      mood: selectedMoodValue,
      reason: reasonValue,
      showStartTime: showStartTime,
      showEndTime: "Now",
      startTime: startTime,
      timeStamp: timeStamp
   });

   // Insert the new card at the beginning of the container
   if (elements.moodCardsContainer.childElementCount === 0) {
      elements.moodCardsContainer.appendChild(newMoodCard);
   } else {
      elements.moodCardsContainer.insertBefore(newMoodCard, elements.moodCardsContainer.firstChild);
   }

   // Save the new card to storage
   saveMood(selectedMoodValue, reasonValue, showStartTime, startTime, timeStamp);

   // Update previous mood card with end time and duration
   if (elements.moodCardsContainer.childElementCount >= 2) {
      const previousCard = elements.moodCardsContainer.children[1];
      const endTimeSpan = previousCard.querySelector('span');
      const durationContainer = previousCard.children[1];

      // Update end time
      endTimeSpan.innerText = showStartTime;

      // Calculate and update duration
      const realStartTimeAttr = previousCard.querySelector('[startTime]');
      if (realStartTimeAttr) {
         const realStartTime = realStartTimeAttr.getAttribute('startTime');
         const duration = calculateDuration(parseInt(realStartTime), startTime);

         // Add or update duration paragraph
         if (durationContainer.childElementCount < 2) {
            const durationPara = document.createElement('p');
            durationPara.innerHTML = `Duration: ${duration}`;
            durationContainer.appendChild(durationPara);
         } else {
            durationContainer.children[1].innerHTML = `Duration: ${duration}`;
         }

         // Update in storage
         updatePreviousCard(showStartTime, duration);
      }
   }

   // Reset form
   elements.reasonInput.value = '';
   elements.moodSelector.selectedIndex = 0;
   app.selectedMood = elements.moodSelector.value;
}

/**
 * ============================
 * EVENT LISTENERS
 * ============================
 */

// Track mood selection changes
elements.moodSelector.addEventListener('change', function () {
   app.selectedMood = this.value;
});

// Submit button click handler
elements.submitBtn.addEventListener('click', createNewMoodCard);

// Clear data button click handler
elements.clearDataBtn.addEventListener('click', clearAllMoodData);

// Enter key press in reason input submits the form
elements.reasonInput.addEventListener('keypress', function (event) {
   if (event.key === 'Enter') {
      event.preventDefault();
      createNewMoodCard();
   }
});

// Initialize the application
document.addEventListener('DOMContentLoaded', loadAllMoods);
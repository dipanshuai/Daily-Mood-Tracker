//all selector elements:

let selectedMood = document.getElementById('mood-selector');
let selectedMoodValue = selectedMood.value;

const submitBtn = document.getElementById('submit-btn');
const moodCardsContainer = document.getElementById('mood-cards-container');
const reason = document.getElementById('reason').value;



//++++++++++++ All Functions ++++++++++++++++++++++++++++++++++++++++++++++++




//helper functions start ---------------------------------------------

//time and date processor function
function getTimeStamp() {
   const d = new Date();

   const hourInNum = d.getHours();
   const minuteInNum = d.getMinutes();
   const secondInNum = d.getSeconds();
   const millisecondInNum = d.getMilliseconds();
   const time = d.getTime();
   const hour = String(hourInNum).padStart(2, '0');
   const minute = String(minuteInNum).padStart(2, '0');
   const second = String(secondInNum).padStart(2, '0');
   const notation = hourInNum < 12 ? "AM" : "PM";

   return {
      tstamp: d,
      hourInNum: hourInNum,
      minuteInNum: minuteInNum,
      secondInNum: secondInNum,
      millisecondInNum: millisecondInNum,
      time: time,
      hour: hour,
      minute: minute,
      second: second,
      notation: notation,
      hourandminute: hour + ":" + minute + " " + notation
   };
}

//duration calculation and formatting function
function calculateDuration(startTime, endTime) {
   
   // Calculate the difference in milliseconds
   let diffMs = endTime - startTime;
   console.log(diffMs)
   
   // Handle overnight scenarios if needed
   if (diffMs < 0) {
      diffMs += 24 * 60 * 60 * 1000; // Add 24 hours in milliseconds
   }

   console.log(diffMs)
   
   // Convert to hours, minutes, seconds
   const hours = Math.floor(diffMs / (1000 * 60 * 60));
   const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
   const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
   
   // Format the output string with single units
   let formattedDuration = ""
   if (hours > 0) {
      formattedDuration += hours + " hour ";
   }
   
   if (minutes > 0) {
      formattedDuration += minutes + " minute ";
   }
   
   // Always include seconds, even if they're 0
   formattedDuration += seconds + " second";
   return formattedDuration.trim()}


//helper functions end -----------------------------








//Local Storage Function------------------------------------------

function saveMood(mood, reason, showStartTime, startTime, ) {
   //if there is something in localstorage, get the data else start with an empty array []
   let moods = JSON.parse(localStorage.getItem('moodEntries')) || [];

   //add new moodcard data
   moods.unshift({
      mood: mood,
      reason: reason,
      showStartTime: showStartTime,
      showEndTime: "Now",
      startTime: startTime,
      endTime: undefined,
      duration: undefined || "Now"

   });

   //save updated array to local storage
   localStorage.setItem('moodEntries', JSON.stringify(moods));
};






//update previous card function
function updatePreviousCard(showendtime, endtime) {
   let moods = JSON.parse(localStorage.getItem('moodEntries')) || [];
   moods[1].showEndTime = showendtime;
   let startTime = moods[1].startTime;
   moods[1].endTime = endtime;
   moods[1].duration = calculateDuration(startTime, endtime);
   localStorage.setItem('moodEntries', JSON.stringify(moods));

}









//function to load All Mood cards from local storage
function loadAllMoods() {
   let moods = JSON.parse(localStorage.getItem('moodEntries')) || [];
   console.log(moods)

   //show each mood entries on the page
   moods.forEach(moodcard => {
      let card = document.createElement('div');
      card.classList.add('innerrow');
      card.innerHTML = `
               <div>
                   <h3>Mood: ${moodcard.mood}</h3>
                  <p>Reason: ${moodcard.reason}</p>
               </div>
                  <div>
                     <p>${moodcard.showStartTime} to <span>${moodcard.showEndTime}</span></p>
                     <p>Duration : ${moodcard.duration} </p>
                  </div>`;

      moodCardsContainer.appendChild(card);
   })
}

//local storage functions end ---------------------------------------


// Important functions ++++++++++++++++++++++++++++++++++++++++++++++++++++

//create new mood card function. also clears the form data
function createNewMoodCard() {
   const showStartTime = getTimeStamp().hourandminute;
   const startTime = getTimeStamp().time;
   let duration = 'Now'

   let reason = document.getElementById('reason');
   let reasonValue = reason.value;
   let newMoodCard = document.createElement('div');
   newMoodCard.classList.add('innerrow');
   newMoodCard.innerHTML = `
                <div>
                    <h3>Mood : ${selectedMoodValue}</h3>
                    <p>Reason: ${reasonValue}</p>
                </div>
                <div>
                     <p>${showStartTime}  to <span>Now</span></p>
                </div>`;

   //check if mood-cards-container is empty
   if (moodCardsContainer.childElementCount == 0) {
      //if mood-cards-conatiner is empty, append new mood card
      moodCardsContainer.appendChild(newMoodCard);
   } else {
      //otherwise insert the new mood card before the first child
      moodCardsContainer.insertBefore(newMoodCard, moodCardsContainer.firstChild);
   }
   //save the new card to local storage
   saveMood(selectedMoodValue, reasonValue, showStartTime, startTime,)

   //update previous card:
   let upToTime;
   if (moodCardsContainer.childElementCount >= 1) {
      upToTime = moodCardsContainer.children[1].querySelector('span')
      upToTime.innerText = showStartTime

   }

//duration handling before saving:

   let durationParaSelector = moodCardsContainer.children[1].lastChild;
   let durationPara = document.createElement('p');
   durationPara.innerHTML = `<p>Duration : ${duration} </p>`

   if (durationParaSelector.childElementCount == 1) {
      durationParaSelector.appendChild(durationPara);
   }

   updatePreviousCard(showStartTime, startTime)
   reason.value = '';
   selectedMood.value = selectedMood.options[0].value;


}

//other functions end ---------------------------------------------------

//+++++++++++++ All Event Listeners +++++++++++++++++++++++++++++++++++++++++++
selectedMood.addEventListener('change', function () {
   selectedMoodValue = this.value;
})

submitBtn.addEventListener('click', createNewMoodCard)

document.addEventListener('DOMContentLoaded', loadAllMoods);


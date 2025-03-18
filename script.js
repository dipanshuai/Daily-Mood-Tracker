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
      hour: hour,
      minute: minute,
      second: second,
      notation: notation,
      hourandminute: hour + ":" + minute + " " + notation
   };
}
//helper functions end -----------------------------


//Local Storage Function------------------------------------------

function saveMood(mood, reason, starttime, duration) {
   //if there is something in localstorage, get the data else start with an empty array []
   let moods = JSON.parse(localStorage.getItem('moodEntries')) || [];

   //add new moodcard data
   moods.unshift({
      mood: mood,
      reason: reason,
      startTime: starttime,
      endTime: "Now",
      duration: duration || "Now"

   });

   //save updated array to local storage
   localStorage.setItem('moodEntries', JSON.stringify(moods));
};

//update previous card function
function updatePreviousCard(endtime) {
   let moods = JSON.parse(localStorage.getItem('moodEntries')) || [];
   moods[1].endTime = endtime;
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
                     <p>${moodcard.startTime} to <span>${moodcard.endTime}</span></p>
                     <p>Duration : ${moodcard.duration} </p>
                  </div>`;

      moodCardsContainer.appendChild(card);
   })
}

//local storage functions end ---------------------------------------


// Important functions ++++++++++++++++++++++++++++++++++++++++++++++++++++

//create new mood card function. also clears the form data
function createNewMoodCard() {
   const startTime = getTimeStamp().hourandminute;
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
                     <p>${startTime}  to <span>Now</span></p>
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
   saveMood(selectedMoodValue, reasonValue, startTime, 'Now')

   //update previous card:
   let upToTime;
   if (moodCardsContainer.childElementCount >= 1) {
      upToTime = moodCardsContainer.children[1].querySelector('span')
      upToTime.innerText = startTime

   }



   let durationParaSelector = moodCardsContainer.children[1].lastChild;
   let durationPara = document.createElement('p');
   durationPara.innerHTML = `<p>Duration : ${duration} </p>`
   console.log(durationParaSelector.childElementCount)


   if (durationParaSelector.childElementCount == 1) {
      durationParaSelector.appendChild(durationPara);
   }

   console.log(startTime)

   updatePreviousCard(startTime)
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


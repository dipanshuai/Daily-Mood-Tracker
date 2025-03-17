//all selector elements:

let selectedMood = document.getElementById('mood-selector');
let selectedMoodValue = selectedMood.value;

const submitBtn = document.getElementById('submit-btn');
const moodCardsContainer = document.getElementById('mood-cards-container');
const reason = document.getElementById('reason').value;

//++++++++++++ All Functions ++++++++++++++++++++++++++++++++++++++++++++++++

//Local Storage Function------------------------------------------

function saveMood (mood, reason, timestamp){
   //if there is something in localstorage, get the data else start with an empty array []
   let moods = JSON.parse(localStorage.getItem('moodEntries')) || [];
   
   //add new moodcard data
   moods.unshift({
      mood : mood,
      reason : reason,
      timestamp: timestamp
   });


   //save updated array to local storage

   localStorage.setItem('moodEntries', JSON.stringify(moods));
};
function loadAllMoods(){
   let moods = JSON.parse(localStorage.getItem('moodEntries')) || [];

   //show each mood entries on the page
   moods.forEach(moodcard => {
      let card = document.createElement('div');
      card.classList.add('innerrow');
      card.innerHTML= `
      <div>
        <h3>Mood: ${moodcard.mood}</h3>
        <p>Reason: ${moodcard.reason}</p>
      </div>
      <p>Time: ${moodcard.timestamp}</p>`;

      moodCardsContainer.appendChild(card);
   })

}

//local storage functions end ---------------------------------------

function getTimeStamp(){
   const d = new Date();
   const hour = d.getHours(); 
   const minute = d.getMinutes(); 
   const seconds = d.getSeconds();
   const nowTime = hour + ":" + minute + ':' + seconds;
   return nowTime
}

//create new mood card function. also clears the form data
function createNewMoodCard (){
   const nowTime = getTimeStamp();

   let reason = document.getElementById('reason');
   let reasonValue = reason.value;
   let newMoodCard = document.createElement('div');
   newMoodCard.classList.add('innerrow');
   newMoodCard.innerHTML = `
                <div>
                    <h3>Mood : ${selectedMoodValue}</h3>
                    <p>Reason: ${reasonValue}</p>
                </div>
                <p>Time:${nowTime}</p>`;

   if (moodCardsContainer.childElementCount == 0) {
      moodCardsContainer.appendChild(newMoodCard);
   } else {
      moodCardsContainer.insertBefore(newMoodCard, moodCardsContainer.firstChild);
   }

   //save the new card to local storage
   saveMood(selectedMoodValue, reasonValue, nowTime)

   reason.value = '';
   selectedMood.value = selectedMood.options[0].value;


}



//+++++++++++++ All Event Listeners +++++++++++++++++++++++++++++++++++++++++++
selectedMood.addEventListener('change', function () {
   selectedMoodValue = this.value;
})

submitBtn.addEventListener('click', createNewMoodCard)

document.addEventListener('DOMContentLoaded', loadAllMoods);


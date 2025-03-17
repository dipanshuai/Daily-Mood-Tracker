//all selector elements:

let selectedMood = document.getElementById('mood-selector');
let selectedMoodValue = selectedMood.value;
const submitBtn = document.getElementById('submit-btn');
const moodCardsContainer = document.getElementById('mood-cards-container');
const reason = document.getElementById('reason').value;

//++++++++++++ All Functions ++++++++++++++++++++++++++++++++++++++++++++++++

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

   const reason = document.getElementById('reason');
   const newMoodCard = document.createElement('div');
   newMoodCard.classList.add('innerrow');
   newMoodCard.innerHTML = `
                <div>
                    <h3>Mood : ${selectedMoodValue}</h3>
                    <p>Reason: ${reason.value}</p>
                </div>
                <p>Time:${nowTime}</p>`;

   if (moodCardsContainer.childElementCount == 0) {
      moodCardsContainer.appendChild(newMoodCard);
   } else {
      moodCardsContainer.insertBefore(newMoodCard, moodCardsContainer.firstChild);
   }
   reason.value = '';
   selectedMood = '';

}

console.log(getTimeStamp())

//+++++++++++++ All Event Listeners +++++++++++++++++++++++++++++++++++++++++++
selectedMood.addEventListener('change', function () {
   selectedMoodValue = this.value;
})

submitBtn.addEventListener('click', createNewMoodCard)


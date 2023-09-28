document.addEventListener("DOMContentLoaded", async function() {
    try {
        const userID = await getSessionUID();
        const userData = await getUserData(userID);
        const userName = userData.athleteName;
        const userImageURL = userData.athletePFP;

        const userGreeting = document.getElementById("user-greeting");
        const userProfileImageLink = document.getElementById("user-profile-link"); 

        if (userGreeting && userName) {
            userGreeting.textContent = `Hello, ${userName}`;
        }
        if (userProfileImageLink && userImageURL) {
            userProfileImageLink.href = `https://www.strava.com/athletes/${userID}`;
            const userProfileImage = document.getElementById("user-profile-image");
            userProfileImage.src = userImageURL;
            userProfileImage.style.borderRadius = "50%";
            userProfileImage.style.width = "150px";
            userProfileImage.style.height = "150px";
           
        }

        const enableDescriptionChangesToggle = document.getElementById("enable-description-changes");
        const editRidesCheck = document.getElementById("edit-bike-rides");
        const editRunsCheck = document.getElementById("edit-runs");

        enableDescriptionChangesToggle.checked = userData.enableDescriptionChanges;
        editRidesCheck.checked = userData.enableBikeDescription;
        editRunsCheck.checked = userData.enableRunDescription;
        editRunsCheck.disabled = !enableDescriptionChangesToggle.checked;
        editRidesCheck.disabled = !enableDescriptionChangesToggle.checked;
        
        enableDescriptionChangesToggle.addEventListener("change", async function () {
            editRunsCheck.disabled = !enableDescriptionChangesToggle.checked;
            editRidesCheck.disabled = !enableDescriptionChangesToggle.checked;
            await preferencesSubmit();
        });

        editRidesCheck.addEventListener("change", async function () {
            await preferencesSubmit();
        });

        editRunsCheck.addEventListener("change", async function () {
            await preferencesSubmit();
        });

        const deleteAccountButton = document.getElementById("delete-account");
        
        deleteAccountButton.addEventListener("click", handleDeleteAccountClick);
    } catch (error) {
        console.error('Error:', error);
    }
});


async function preferencesSubmit() {
    const enableRunDescription = document.getElementById("edit-runs").checked;
    const enableBikeDescription = document.getElementById("edit-bike-rides").checked;
    const enableDescriptionChanges = document.getElementById("enable-description-changes").checked;
  
    fetch('/api/save-preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ enableRunDescription, enableBikeDescription, enableDescriptionChanges }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        showConfirmationPopup();
      })
      .catch(error => {
        console.error('Error saving preferences:', error);
      });
  }
  
function showConfirmationPopup() {
    const popup = document.getElementById("confirmation-popup");
      popup.classList.add("slide-in");
      setTimeout(() => {
      popup.classList.remove("slide-in");
    }, 2000);
  }
  

async function handleDeleteAccountClick() {
    const confirmDelete = confirm("Are you sure you want to delete your account?");
    if (confirmDelete) {
        try {
            const response = await fetch('/api/delete-account', {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            console.log("Account deleted");
            window.location.href = '/';
        } catch (error) {
            console.error('Error deleting account:', error);
            throw error;
        }
    }
}



async function getSessionUID() {
    try {
        const response = await fetch('/api/session');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.athleteID;
    } catch (error) {
        console.error('Error fetching athlete data:', error);
        throw error;
    }
}

async function getUserData(athlete_id) {
    try {
        const url = `/api/athlete-data?athlete_id=${athlete_id}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching athlete data:', error);
        throw error;
    }
}

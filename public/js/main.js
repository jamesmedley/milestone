document.addEventListener("DOMContentLoaded", async function() {
    try {
        const userID = await getSessionUID();
        const userData = await getUserData(userID); 
        const userName = userData.athleteName;
        const userImageURL = userData.athletePFP;

        const userGreeting = document.getElementById("user-greeting");
        const userProfileImage = document.getElementById("user-profile-image");

        if (userGreeting && userName) {
            userGreeting.textContent = `Hello, ${userName}`;
        }
        if (userProfileImage && userImageURL) {
            userProfileImage.src = userImageURL;
            userProfileImage.style.borderRadius = "50%";
            userProfileImage.style.width = "150px";
            userProfileImage.style.height = "150px";
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

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

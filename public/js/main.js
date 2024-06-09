document.addEventListener("DOMContentLoaded", async function () {
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

        const activityRules = userData.activityRules;
        const rulesTable = document.getElementById('rules-table');
        const rulesTableBody = rulesTable.querySelector('tbody');
        const addRuleButton = document.getElementById('add-rule');
        if (activityRules != undefined) {
            addExistingRules(activityRules, rulesTable, rulesTableBody);
        }
        rulesTable.addEventListener('input', function (event) {
            const tableData = tableToJSON(rulesTable);
            rulesSubmit(tableData)
        });

        let activityTypes = [];
        // Fetch and load JSON data
        try {
            const response = await fetch('resources/strava_sports.json');
            const data = await response.json();
            activityTypes = data.StravaActivityTypes;
        } catch (error) {
            console.error('Error fetching activity types:', error);
        }

        addRuleButton.addEventListener('click', async () => {
            if (rulesTable.style.display === 'none') {
                rulesTable.style.display = 'table';
            }

            const newRow = document.createElement('tr');
            newRow.innerHTML = `
            <td>
                <select class="activity-type">
                    ${createOptions(activityTypes)}
                </select>
            </td>
            <td>
                <select class="activity-type">
                    ${createOptions(activityTypes)}
                </select>
            </td>
            <td>
                <input type="text" class="default-title" placeholder="Leave blank for default Strava title">
            </td>
            <td>
                <button type="button" class="remove-rule">Remove</button>
            </td>
        `;
            rulesTableBody.appendChild(newRow);
            const tableData = tableToJSON(rulesTable);
            rulesSubmit(tableData);
        });

        rulesTableBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-rule')) {
                const row = event.target.closest('tr');
                row.remove();

                if (rulesTableBody.children.length === 0) {
                    rulesTable.style.display = 'none';
                }
                const tableData = tableToJSON(rulesTable);
                rulesSubmit(tableData)
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
});

function tableToJSON(table) {
    const data = [];
    const headers = [];

    // Iterate through the header row to get column names
    for (let i = 0; i < table.rows[0].cells.length - 1; i++) {
        headers[i] = table.rows[0].cells[i].textContent.trim();
    }

    // Iterate through the rows (starting from the second row) to get data
    for (let i = 1; i < table.rows.length; i++) {
        const tableRow = table.rows[i];
        const rowData = {};

        // Iterate through the cells of the row
        for (let j = 0; j < tableRow.cells.length - 1; j++) {
            const cell = tableRow.cells[j];
            const header = headers[j];

            // Check the type of input element in the cell
            const inputElement = cell.querySelector('input, select');
            if (inputElement) {
                if (inputElement.tagName.toLowerCase() === 'input') {
                    // If input element is an input field
                    rowData[header] = inputElement.value.trim();
                } else if (inputElement.tagName.toLowerCase() === 'select') {
                    // If input element is a select dropdown
                    rowData[header] = inputElement.options[inputElement.selectedIndex].text.trim();
                }
            } else {
                // If no input element found, use the cell's text content
                rowData[header] = cell.textContent.trim();
            }
        }

        // Add the row data to the data array
        data.push(rowData);
    }

    return data;
}

async function addExistingRules(activityRules, rulesTable, rulesTableBody) {
    let activityTypes = [];

    try {
        const response = await fetch('resources/strava_sports.json');
        const data = await response.json();
        activityTypes = data.StravaActivityTypes;

        for (let i = 0; i < activityRules.length; i++) {
            if (rulesTable.style.display === 'none') {
                rulesTable.style.display = 'table';
            }
            const newRow = document.createElement('tr');

            newRow.innerHTML = `
                <td>
                    <select class="activity-type">
                        ${createOptions(activityTypes)}
                    </select>
                </td>
                <td>
                    <select class="activity-type">
                        ${createOptions(activityTypes)}
                    </select>
                </td>
                <td>
                    <input type="text" class="default-title" placeholder="Leave blank for default Strava title" value="${activityRules[i]['New Title'] || ''}">
                </td>
                <td>
                    <button type="button" class="remove-rule">Remove</button>
                </td>
            `;

            rulesTableBody.appendChild(newRow);

            // Select the correct options
            const selectElements = newRow.querySelectorAll('select.activity-type');
            if (selectElements[0] && activityRules[i]['Original Type']) {
                selectElements[0].value = activityRules[i]['Original Type'];
            }
            if (selectElements[1] && activityRules[i]['New Type']) {
                selectElements[1].value = activityRules[i]['New Type'];
            }
        }

        const tableData = tableToJSON(rulesTable);
        rulesSubmit(tableData);
    } catch (error) {
        console.error('Error fetching activity types:', error);
    }
}

function createOptions(optionsArray) {
    return optionsArray.map(option => `<option value="${option}">${option}</option>`).join('');
}

async function rulesSubmit(tableData) {
    fetch('/api/rules-update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tableData),
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

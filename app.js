

const API_URL = "https://etiennedesautels000-pf-potluckm-be.onrender.com";

// Section elements
const potlucksSection = document.getElementById('potlucks-list-section');
const itemsSection = document.getElementById('items-list-section');
const backBtn = document.getElementById('back-btn');
const itemsSectionTitle = document.getElementById('items-section-title');

// List and template elements for tables
const potlucksList = document.getElementById('potlucks-table-list');
const potlucksTemplate = document.getElementById('potlucks-table-template');
const itemsList = document.getElementById('items-table-list');
const itemsTemplate = document.getElementById('items-table-template');

// Form elements
const potluckForm = document.getElementById('potluck-form');
const togglePotluckFormBtn = document.getElementById('toggle-potluck-form-btn');
const cancelPotluckFormBtn = document.getElementById('cancel-potluck-btn');

const subgroupForm = document.getElementById('subgroup-form');
const toggleSubgroupFormBtn = document.getElementById('toggle-subgroup-form-btn');
const cancelSubgroupFormBtn = document.getElementById('cancel-subgroup-btn');
const updateSubgroupBtn = document.getElementById('update-subgroup-btn');
const deleteSubgroupBtn = document.getElementById('delete-subgroup-btn');
let subgroupSelect = null;

const contributionForm = document.getElementById('contribution-form');
const toggleContributionFormBtn = document.getElementById('toggle-contribution-form-btn');
const cancelContributionFormBtn = document.getElementById('cancel-contribution-btn');


// Initialization
let currentPotluckId = null;  // potluck state tracker inside items
initDateTime();

// Memory tables
let potlucks = [];
let subgroups = [];
let contributions = [];


// HELPERS

// 
function initDateTime() {   // set options in time fields
    // Time
    const timeIntervalStep = 30;
    const createListItems = (timeField, timeInterval) => {
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += timeInterval) {
                const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                timeField.add(new Option(time, time));
            }
        }
    }
    const timeField_begin = document.getElementById('potluck-form-begin');
    const timeField_end = document.getElementById('potluck-form-end');
    createListItems(timeField_begin, timeIntervalStep);
    createListItems(timeField_end, timeIntervalStep);
    resetPotluckForm();
}

function setTimeField(timeFieldId, timeValue) {
    const timeField = document.getElementById(timeFieldId);
    timeField.value = timeValue;
}

function resetDateTimeToDefault() {
    const dateString = new Date(Date.now()).toISOString().split('T')[0];
    document.getElementById('potluck-form-date').value = dateString;
    setTimeField('potluck-form-begin', '12:00');
    setTimeField('potluck-form-end', '16:00');
}

// Populate subgroup dropdown dynamically for contributions form
function populateSubgroupSelect(potluck_id) {
    subgroupSelect.innerHTML = '';
    const filteredSubgroups = subgroups.filter(sg => sg.potluck_id == potluck_id);
    if (filteredSubgroups.length === 0) {
        const option = document.createElement('option');
        option.textContent = "Aucun sous-groupe";
        option.disabled = true;
        option.selected = true;
        subgroupSelect.appendChild(option);
        return;
    }
    filteredSubgroups.forEach(sg => {
        const option = document.createElement('option');
        option.value = sg.id;
        option.textContent = sg.name;
        subgroupSelect.appendChild(option);
    });
}

// Clears time string of seconds and milliseconds
function formatTime(timeStr) {
    if (!timeStr) return '';
    // Grabs just the "HH:MM" part from "HH:MM:SS..."
    return timeStr.slice(0, 5); 
}


// UI UTILS

    // Views
function showPotlucksView() {
    currentPotluckId = null;
    itemsSection.classList.add('hidden');
    closeSubgroupForm();
    closeContributionForm();
    potlucksSection.classList.remove('hidden');
}
function showItemsView(potluckTitle) {
    itemsSectionTitle.textContent = `Contributions pour : ${potluckTitle}`;
    potlucksSection.classList.add('hidden');
    closePotluckForm();
    itemsSection.classList.remove('hidden');
}

    // Forms
function openPotluckForm() {
    potluckForm.classList.remove('hidden');
}
function closePotluckForm() {
    potluckForm.classList.add('hidden');
    resetPotluckForm();
}
function resetPotluckForm() {
    document.getElementById('potluck-form-id').value = "";
    document.getElementById('potluck-form-title').value = "";
    resetDateTimeToDefault();
    document.getElementById('potluck-form-location').value = "";
    document.getElementById('potluck-form-organizer').value = "";
}
function openSubgroupForm() {
    subgroupForm.classList.remove('hidden');
}
function closeSubgroupForm() {
    subgroupForm.classList.add('hidden');
    resetSubgroupForm();
}
function resetSubgroupForm() {
    document.getElementById('subgroup-form-id').value = "";
    document.getElementById('subgroup-form-name').value = "";
}
function openContributionForm() {
    contributionForm.classList.remove('hidden');
}
function closeContributionForm() {
    contributionForm.classList.add('hidden');
    resetContributionForm();
}
function resetContributionForm() {
    document.getElementById('contribution-form-id').value = "";
    document.getElementById('contribution-subgroup-select').value = "";
    document.getElementById('contribution-form-name').value = "";
    document.getElementById('contribution-form-category').value = "";
    document.getElementById('contribution-form-notes').value = "";
}

    // Error messages
function sendErrorMsg(section, message) {
    const errorLabel = document.getElementById(section + '-error');
    errorLabel.innerHTML = "ERREUR : " + message;
    errorLabel.classList.remove('hidden');
}
function clearAllErrorMsgs() {
    let errorLabel = document.getElementById('potlucks-error');
    errorLabel.innerHTML = '';
    errorLabel.classList.add('hidden');

    errorLabel = document.getElementById('subgroups-error');
    errorLabel.innerHTML = '';
    errorLabel.classList.add('hidden');

    errorLabel = document.getElementById('contributions-error');
    errorLabel.innerHTML = '';
    errorLabel.classList.add('hidden');
}

    // Renders
// Render main potluck list
function renderPotlucks() {
    
    // 1. Clear out any old content
    potlucksList.innerHTML = '';

    // 2. Loop through each item in the array
    potlucks.forEach(potluck => {
        const clone = potlucksTemplate.content.cloneNode(true);

        const titleCell = clone.querySelector('.potlucks-title');
        titleCell.textContent = potluck.title;
        titleCell.style.cursor = 'pointer';
        titleCell.style.textDecoration = 'underline';
        titleCell.dataset.id = potluck.id;

        clone.querySelector('.potlucks-date').textContent = potluck.event_date;
        clone.querySelector('.potlucks-begin').textContent = potluck.time_begin;
        clone.querySelector('.potlucks-end').textContent = potluck.time_end;
        clone.querySelector('.potlucks-location').textContent = potluck.location;
        clone.querySelector('.potlucks-organizer').textContent = potluck.organizer;

        const modifyBtn = clone.querySelector('.potlucks-modify-btn');
        modifyBtn.dataset.id = potluck.id;
        const deleteBtn = clone.querySelector('.potlucks-delete-btn');
        deleteBtn.dataset.id = potluck.id;

        potlucksList.appendChild(clone);
    });
}
    
// Render inside potluck items
function renderItems(potluck_id) {
    // 1. Clear out any old content
    itemsList.innerHTML = '';

    // 2. Loop through each subgroup in the array
    subgroups.forEach(subgroup => {
        if (subgroup.potluck_id != potluck_id) return;

        contributions.forEach(contribution => {
            if (contribution.subgroup_id != subgroup.id) return;

            const clone = itemsTemplate.content.cloneNode(true);
            clone.querySelector('.items-contribution').textContent = contribution.name;
            clone.querySelector('.items-subgroup').textContent = subgroup.name;
            clone.querySelector('.items-category').textContent = contribution.category;
            clone.querySelector('.items-notes').textContent = contribution.notes;

            const modifyBtn = clone.querySelector('.items-modify-btn');
            modifyBtn.dataset.id = contribution.id;
            const deleteBtn = clone.querySelector('.items-delete-btn');
            deleteBtn.dataset.id = contribution.id;
            
            itemsList.appendChild(clone);
        });
    });
}


// HANDLERS

    // Data handling
async function fetchWithLoading(url, options = {}) {
    const loadingEl = document.getElementById('loading-indicator');
    
    // Set a timeout to notify the user if it takes longer than 2 seconds (Cold Start)
    const coldStartTimer = setTimeout(() => {
        if (loadingEl) {
            loadingEl.textContent = 'Le serveur se réveille (cela peut prendre jusqu\'à 1 minute)...';
            loadingEl.style.display = 'block';
        }
    }, 2000);

    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response;
    } catch (error) {
        // Catch network errors, offline state, or CORS blocks here
        if (loadingEl) {
            loadingEl.textContent = 'Erreur: Impossible de contacter le serveur. Vérifiez votre connexion ou la configuration CORS.';
            loadingEl.style.display = 'block';
        }
        return null; // Return null so the caller gets a clean value instead of an unhandled crash
    } finally {
        clearTimeout(coldStartTimer);
        if (loadingEl) loadingEl.style.display = 'none';
    }
}
async function initDBTables() {
    try {
        let response = await fetchWithLoading(API_URL + '/potlucks');
        let data = await response.json();
        potlucks = data.map(item => ({
            ...item,
            time_begin: formatTime(item.time_begin),
            time_end: formatTime(item.time_end)
        }));

        response = await fetchWithLoading(API_URL + '/subgroups');
        data = await response.json();
        subgroups = data;

        response = await fetchWithLoading(API_URL + '/contributions');
        data = await response.json();
        contributions = data;

    } catch (error) {
        console.error('Failed to initialize tables:', error);
    }
}
async function sendAPIData(url, method, payload = null) {
    const response = await fetchWithLoading(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error(`Server returned ${response.status} for ${method} request to ${url}`);
    }
    return await response.json();
}
async function createPotluck(potluck) {
    try {
        const record = await sendAPIData(API_URL + '/potlucks', 'POST', potluck);
        potlucks.push({
            ...record,
            time_begin: formatTime(record.time_begin),
            time_end: formatTime(record.time_end)
        });
    } catch (error) {
        console.error('Failed to create potluck:', error);
    }
}
async function updatePotluck(potluck) {
    try {
        const record = await sendAPIData(API_URL + `/potlucks/${potluck.id}`, 'PUT', potluck);
        const record_ = {
            ...record,
            time_begin: formatTime(record.time_begin),
            time_end: formatTime(record.time_end)
        };
        const index = potlucks.findIndex(p => p.id === potluck.id);
        if (index !== -1) {
            potlucks[index] = record_;
        }
    } catch (error) {
        console.error('Failed to update potluck:', error);
    }
}
async function deletePotluck(potluck) {
    try {
        const response = await fetchWithLoading(API_URL + `/potlucks/${potluck.id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Failed to delete potluck #${potluck.id}`);
        }
        subgroups = subgroups.filter(s => s.potluck_id !== potluck.id);
        potlucks = potlucks.filter(p => p.id !== potluck.id);
    } catch (error) {
        console.error('Delete potluck failed:', error);
    }
}

async function createSubgroup(subgroup) {
    try {
        const record = await sendAPIData(API_URL + '/subgroups', 'POST', subgroup);
        subgroups.push(record);
    } catch (error) {
        console.error('Failed to create subgroup:', error);
    }
}
async function updateSubgroup(subgroup) {
    try {
        const record = await sendAPIData(API_URL + `/subgroups/${subgroup.id}`, 'PUT', subgroup);
        const index = subgroups.findIndex(s => s.id === subgroup.id);
        if (index !== -1) {
            subgroups[index] = record;
        }
    } catch (error) {
        console.error('Failed to update subgroup:', error);
    }
}
async function deleteSubgroup(subgroup) {
    try {
        const response = await fetchWithLoading(API_URL + `/subgroups/${subgroup.id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Failed to delete potluck #${subgroup.id}`);
        }
        subgroups = subgroups.filter(s => s.id !== subgroup.id);
    } catch (error) {
        console.error('Delete subgroup failed:', error);
    }
}

async function createContribution(contribution) {
    try {
        const record = await sendAPIData(API_URL + '/contributions', 'POST', contribution);
        contributions.push(record);
    } catch (error) {
        console.error('Failed to create contribution:', error);
    }
}
async function updateContribution(contribution) {
    try {
        const record = await sendAPIData(API_URL + `/contributions/${contribution.id}`, 'PUT', contribution);
        const index = contributions.findIndex(c => c.id === contribution.id);
        if (index !== -1) {
            contributions[index] = record;
        }
    } catch (error) {
        console.error('Failed to update contribution:', error);
    }
}
async function deleteContribution(contribution) {
    try {
        const response = await fetchWithLoading(API_URL + `/contributions/${contribution.id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Failed to delete contribution #${contribution.id}`);
        }
        contributions = contributions.filter(s => s.id !== contribution.id);
    } catch (error) {
        console.error('Delete subgroup failed:', error);
    }
}

    // Event listeners

// Potluck
togglePotluckFormBtn.addEventListener('click', () => {
    clearAllErrorMsgs();
    openPotluckForm();
});
cancelPotluckFormBtn.addEventListener('click', () => {
    closePotluckForm();
});
potlucksList.addEventListener('click', async (e) => {
    clearAllErrorMsgs();

    // Check if user clicked a Title
    const titleCell = e.target.closest('.potlucks-title');
    if (titleCell) {
        const potluckId = Number(titleCell.dataset.id);
        const potluck = potlucks.find(p => p.id === potluckId);

        if (potluck) {
            currentPotluckId = potluck.id;
            renderItems(currentPotluckId);
            showItemsView(potluck.title);
        }
        return;
    }

    // Check if user clicked a Modify Button
    const modifyBtn = e.target.closest('.potlucks-modify-btn');
    if (modifyBtn) {
        const potluckId = Number(modifyBtn.dataset.id);
        const potluck = potlucks.find(p => p.id === potluckId);
        if (potluck) {
            document.getElementById('potluck-form-id').value = potluck.id;
            document.getElementById('potluck-form-title').value = potluck.title;
            document.getElementById('potluck-form-date').value = potluck.event_date;
            document.getElementById('potluck-form-begin').value = potluck.time_begin;
            document.getElementById('potluck-form-end').value = potluck.time_end;
            document.getElementById('potluck-form-location').value = potluck.location;
            document.getElementById('potluck-form-organizer').value = potluck.organizer;
            openPotluckForm();
        }
    }

    // Check if user clicked a Delete Button
    const deleteBtn = e.target.closest('.potlucks-delete-btn');
    if (deleteBtn) {
        const potluckId = Number(deleteBtn.dataset.id);
        const potluckToDelete = potlucks.find(p => p.id === potluckId);
        if (potluckToDelete) {
            const potluckSubgroupIDs = subgroups
                .filter(s => s.potluck_id === potluckToDelete.id)
                .map(s => s.id);
            const hasContributions = contributions.some(c => potluckSubgroupIDs.includes(c.subgroup_id));
            if (hasContributions) {
                sendErrorMsg('potlucks', "Des contributions existent encore dans ce potluck. Supprimez d'abord toutes les contributions du potluck.");
                return;
            }
            await deletePotluck(potluckToDelete);
        }
        renderPotlucks();
    }
});
potluckForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formId = document.getElementById('potluck-form-id').value;
    
    if (formId == '') {
        // new potluck
        const newPotluck = {
            title: document.getElementById('potluck-form-title').value,
            event_date: document.getElementById('potluck-form-date').value,
            time_begin: document.getElementById('potluck-form-begin').value,
            time_end: document.getElementById('potluck-form-end').value,
            location: document.getElementById('potluck-form-location').value,
            organizer: document.getElementById('potluck-form-organizer').value
        };
        await createPotluck(newPotluck);
    } else {
        // update potluck
        const potluckToUpdate = potlucks.find(p => p.id == formId);
        potluckToUpdate.title = document.getElementById('potluck-form-title').value;
        potluckToUpdate.event_date = document.getElementById('potluck-form-date').value;
        potluckToUpdate.time_begin = document.getElementById('potluck-form-begin').value;
        potluckToUpdate.time_end = document.getElementById('potluck-form-end').value;
        potluckToUpdate.location = document.getElementById('potluck-form-location').value;
        potluckToUpdate.organizer = document.getElementById('potluck-form-organizer').value;
        await updatePotluck(potluckToUpdate);
    }
    renderPotlucks();
    closePotluckForm();
});

// Subgroup
toggleSubgroupFormBtn.addEventListener('click', () => {
    clearAllErrorMsgs();
    closeSubgroupForm();
    closeContributionForm();
    subgroupSelect = document.getElementById('subgroup-subgroup-select');
    populateSubgroupSelect(currentPotluckId);
    openSubgroupForm();
});
cancelSubgroupFormBtn.addEventListener('click', () => {
    clearAllErrorMsgs();
    closeSubgroupForm();
});
subgroupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrorMsgs();
    const newSubgroup = {
        name: document.getElementById('subgroup-form-name').value,
        potluck_id: currentPotluckId
    };
    await createSubgroup(newSubgroup);
    closeSubgroupForm();
});
updateSubgroupBtn.addEventListener('click', async () => {
    clearAllErrorMsgs();
    const subgroupToUpdate = subgroups.find(s => s.id == subgroupSelect.value);
    if (!subgroupToUpdate) {
        sendErrorMsg('subgroups', "Aucun sous-groupe à modifier.");
        return;
    }
    const subgroupFormName = document.getElementById('subgroup-form-name').value;
    if (subgroupFormName.value == '') {
        sendErrorMsg('subgroups', "Champ 'Nom(s)' vide. Pour modifier un sous-groupe, entrez le nouveau nom dans le champ 'Nom(s)'.");
        return;
    }
    subgroupToUpdate.name = subgroupFormName;
    await updateSubgroup(subgroupToUpdate);
    closeSubgroupForm();
    renderItems(currentPotluckId);
});
deleteSubgroupBtn.addEventListener('click', async () => {
    clearAllErrorMsgs();
    const subgroupToDelete = subgroups.find(s => s.id == subgroupSelect.value);
    if (!subgroupToDelete) {
        sendErrorMsg('subgroups', "Aucun sous-groupe à supprimer.");
        return;
    }
    if (contributions.find(c => c.subgroup_id == subgroupToDelete.id)) {
        sendErrorMsg('subgroups', "Des contributions sont encore associées à ce sous-groupe. Supprimez d'abord toutes les contributions du sous-groupe.");
        return;
    }
    await deleteSubgroup(subgroupToDelete);
    closeSubgroupForm();
});


// Contributions
toggleContributionFormBtn.addEventListener('click', () => {
    clearAllErrorMsgs();
    closeSubgroupForm();
    closeContributionForm();
    const subgroupsSubset = subgroups.filter(s => s.potluck_id === currentPotluckId);
    if (subgroupsSubset.length === 0) {
        sendErrorMsg('contributions', "Aucun sous-groupe enregistré. Pour créer une contribution, il faut au moins 1 sous-groupe. Allez dans 'Gérer les sous-groupes' et ajoutez un sous-groupe.");
        return;
    }
    subgroupSelect = document.getElementById('contribution-subgroup-select');
    populateSubgroupSelect(currentPotluckId);
    openContributionForm();
});
cancelContributionFormBtn.addEventListener('click', () => {
    closeContributionForm();
});
itemsList.addEventListener('click', async (e) => {
    clearAllErrorMsgs();
    closeSubgroupForm();
    closeContributionForm();

    // Check if user clicked a Modify Button
    const modifyBtn = e.target.closest('.items-modify-btn');
    if (modifyBtn) {
        const contributionId = Number(modifyBtn.dataset.id);
        const contribution = contributions.find(c => c.id == contributionId);
        if (contribution) {
            subgroupSelect = document.getElementById('contribution-subgroup-select');
            populateSubgroupSelect(currentPotluckId);
            document.getElementById('contribution-form-id').value = contribution.id;
            document.getElementById('contribution-subgroup-select').value = contribution.subgroup_id;
            document.getElementById('contribution-form-name').value = contribution.name;
            document.getElementById('contribution-form-category').value = contribution.category;
            document.getElementById('contribution-form-notes').value = contribution.notes;
            openContributionForm();
        }
    }

    // Check if user clicked a Delete Button
    const deleteBtn = e.target.closest('.items-delete-btn');
    if (deleteBtn) {
        const contributionId = Number(deleteBtn.dataset.id);
        const contributionToDelete = contributions.find(c => c.id === contributionId);
        if (contributionToDelete) {
            await deleteContribution(contributionToDelete);
        }
        renderItems(currentPotluckId);
    }
});
contributionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formId = document.getElementById('contribution-form-id').value;
    const selectedSubgroupId = Number(subgroupSelect.value);
        if (!selectedSubgroupId) return;
    if (formId == '') {
        // create new contribution
        const newContribution = {
            name: document.getElementById('contribution-form-name').value,
            category: document.getElementById('contribution-form-category').value,
            notes: document.getElementById('contribution-form-notes').value,
            subgroup_id: selectedSubgroupId
        };
        await createContribution(newContribution);
    } else {
        // update existing congribution
        const contributionToUpdate = contributions.find(c => c.id == formId);
        contributionToUpdate.name = document.getElementById('contribution-form-name').value;
        contributionToUpdate.category = document.getElementById('contribution-form-category').value;
        contributionToUpdate.notes = document.getElementById('contribution-form-notes').value;
        contributionToUpdate.subgroup_id = selectedSubgroupId;
        await updateContribution(contributionToUpdate);
    }
    renderItems(currentPotluckId);
    closeContributionForm();
});

// Back button listener
backBtn.addEventListener('click', () => {
    clearAllErrorMsgs();
    showPotlucksView();
});


// START SCRIPT

async function startApp() {
    await initDBTables(); // Pauses here until all 3 fetches finish
    renderPotlucks();          // Runs only AFTER potlucks, subgroups, and contributions are set
    console.log(potlucks);
    console.log(subgroups);
    console.log(contributions);
}
startApp();


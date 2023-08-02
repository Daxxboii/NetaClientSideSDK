

// Function to read the profile picture from a file and convert it to base64
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function uploadUserContacts() {
    const url = 'http://localhost:3000/uploadUserContacts';
    const username = 'user123'; // Replace with the appropriate username

    try {
        const form = new FormData();

        // Add username and contacts without profile pictures to the form data
        form.append('username', username);
        form.append('contactsList', JSON.stringify(contactsList.map(({ pfp, ...rest }) => rest)));

        // Add profile pictures to the form data
        contactsList.forEach((contact, index) => {
            if (contact.pfp) {
                form.append(`profilePicture${index}`, fs.createReadStream(contact.pfp));
            }
        });

        const response = await axios.put(url, form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        console.log('Server response:', response.data);
    } catch (error) {
        console.error('Error sending contact list:', error.message);
    }
}

sendContactsToServer();


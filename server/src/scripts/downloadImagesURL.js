const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const cheerio = require('cheerio'); 


// Define the path to the text file containing image URLs
const inputFilePath = 'images.txt';

// Define the directory where you want to save the downloaded images
const outputDirectory = 'downloaded_images';


// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDirectory)) {
	fs.mkdirSync(outputDirectory);
}

//group
const group = 'group-a12cb36a-3e1f-4edd-8f32-1b0e2de12659'

// Define your authentication parameters
const apiUrl = 'https://SITE.tangerinecentral.org'; // Replace with your API URL
const credentials = {
	// Define your credentials here
	// For example: username and password
	username: 'user1',
	password: 'PASSS'
};




async function getAuthenticationToken(url, credentials) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
	headers.append('Content-Type', 'application/json');

    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(credentials),
    };

    try {
		
        const response = await fetch(url + '/login', requestOptions);
		 
		
        const result = await response.text();
		
        const tokenResult = JSON.parse(result);
		
        const token = tokenResult.data.token;

        return token;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function getAuthorizationToken(url, group, authenticationToken) {
  try {
    console.log('Starting getAuthorizationToken');
    if (!url) {
      throw new Error("'url' cannot be null or empty.");
    }

    if (!group) {
      throw new Error("'group' cannot be null or empty.");
    }

    if (!authenticationToken) {
      throw new Error("'authenticationToken' cannot be null or empty.");
    }

    // Construct the URL for group permissions
    const groupParamsUrl = url + '/users/groupPermissionsByGroupName/' + group;
    console.log('Authorization request URL:', groupParamsUrl);

    // Set up request headers
    const headers = new Headers();
    headers.append('Authorization', authenticationToken);

    // Prepare the request
    console.log('Sending authorization request to:', groupParamsUrl);
    const response = await fetch(groupParamsUrl, {
      method: 'GET',
      headers
    });

    if (response.ok) {
      // Read the response content as text
      const result = await response.text();
      // Deserialize the response JSON
      const tokenResult = JSON.parse(result);

      // Extract the 'token' property
      const token = tokenResult.data.token;
      console.log('Authorization token obtained:');

      return token;
    } else {
      console.error('Authorization request failed with status:', response.status);
      throw new Error(`Authorization request failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error in getAuthorizationToken:', error.message);
    throw error;
  }
}



async function authenticateNow() {
  try {
    const authenticationToken = await getAuthenticationToken(apiUrl, credentials);
    const authorizationToken = await getAuthorizationToken(apiUrl, group, authenticationToken);
     
    return authorizationToken;
  } catch (error) {
    console.error('Error in authenticateNow:', error.message);
    throw error;
  }
}



const imageUrls = fs
	.readFileSync(inputFilePath, 'utf-8')
	.split('\n')
	.map(url => url.trim())
	.filter(url => url && /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(url)); // URL validation regex

let authorizationToken = ''	
	
// Download images and save them in the output directory
imageUrls.forEach(async (url, index) => {
	const parts = url.split('/');
	const imageName = parts[parts.length - 2]; // Extract image name from URL
	
	
	if (imageName) {
		const filename = path.join(outputDirectory, `${imageName}.jpg`);
        
		if (authorizationToken == '' )
				authorizationToken = await authenticateNow();
		
		try {
			
			// Add the authorization header to the request
			const response = await fetch(url, {
				headers: {
					Authorization: ` ${authorizationToken}`
				}
			});

	        if (response.ok) {
	          const buffer = await response.buffer();
	          fs.writeFileSync(filename, buffer);
	          console.log(`Downloaded: ${filename}`);
	        } else {
	          console.error(`Error downloading ${url}: Status ${response.status}`);
	        }
		} catch (err) {
			console.error(`Error downloading ${imageName}: ${err.message}`);
		}
	};
});

const axios = require('axios');
async function run() {
  try {
    const loginRes = await axios.post('http://localhost:3000/api/backoffice/auth/login', {
      email: 'admin@appointly.com',
      password: 'password123'
    });
    const cookies = loginRes.headers['set-cookie'];
    const tokenCookie = cookies.find(c => c.startsWith('appointly_access_token='));
    
    console.log("Logged in");
    
    const socketRes = await axios.get('http://localhost:3000/api/backoffice/socket-token', {
      headers: {
        Cookie: tokenCookie
      }
    });
    console.log("Socket token success:", socketRes.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
run();

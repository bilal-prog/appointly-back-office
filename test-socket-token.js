const axios = require('axios');
axios.get('http://localhost:3000/api/backoffice/socket-token', {
  headers: {
    Cookie: 'appointly_access_token=dummy_token'
  }
}).then(res => console.log(res.data)).catch(err => console.error(err.response ? err.response.data : err.message));

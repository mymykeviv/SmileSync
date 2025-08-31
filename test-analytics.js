const http = require('http');

const testEndpoint = (path, name) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`\n=== ${name} ===`);
        console.log(`Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            console.log('✅ Valid JSON response');
            console.log('Response keys:', Object.keys(parsed));
          } catch (e) {
            console.log('❌ Invalid JSON response');
            console.log('Raw response:', data.substring(0, 200));
          }
        } else {
          console.log('❌ Error response:', data);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`❌ ${name} failed:`, e.message);
      resolve();
    });

    req.end();
  });
};

async function testAllEndpoints() {
  console.log('Testing Analytics System after Sequelize to SQLite migration...');
  
  await testEndpoint('/api/analytics/dashboard', 'Dashboard Overview');
  await testEndpoint('/api/analytics/appointments', 'Appointment Analytics');
  await testEndpoint('/api/analytics/revenue', 'Revenue Analytics');
  await testEndpoint('/api/analytics/patients', 'Patient Analytics');
  
  console.log('\n🎉 Analytics system testing completed!');
}

testAllEndpoints();
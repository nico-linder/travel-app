const axios = require('axios');

async function cleanCamunda() {
  try {
    const res = await axios.get('http://localhost:8080/engine-rest/process-instance?processDefinitionKey=phase1-voting');
    const instances = res.data;
    console.log(`Found ${instances.length} instances to delete.`);
    
    for (const inst of instances) {
      await axios.delete(`http://localhost:8080/engine-rest/process-instance/${inst.id}`);
      console.log(`Deleted ${inst.id}`);
    }
    console.log('Cleanup complete.');
  } catch (e) {
    console.error(e.message);
  }
}

cleanCamunda();

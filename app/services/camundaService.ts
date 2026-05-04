import axios from 'axios';

const CAMUNDA_REST_URL = 'http://localhost:8080/engine-rest';

export const camundaService = {
  async getVibeSuggestions(currentVibe: string): Promise<string[]> {
    try {
      const response = await axios.post(`${CAMUNDA_REST_URL}/process-definition/key/vibes-suggestion/start`, {
        variables: {
          currentVibe: { value: currentVibe, type: 'String' }
        },
        withVariablesInReturn: true
      });

      const variables = response.data.variables;
      if (variables && variables.suggestedVibes) {
        return JSON.parse(variables.suggestedVibes.value);
      }
      return [];
    } catch (error) {
      console.error('Camunda Error:', error);
      return [];
    }
  },

  async ensureProcessStarted(tripId: string) {
    try {
      // Check if process already exists for this trip
      const checkRes = await axios.get(`${CAMUNDA_REST_URL}/process-instance?processDefinitionKey=phase1-voting&businessKey=${tripId}`);
      if (checkRes.data.length === 0) {
        await axios.post(`${CAMUNDA_REST_URL}/process-definition/key/phase1-voting/start`, {
          businessKey: tripId
        });
        console.log('Started new Camunda process for trip:', tripId);
      }
    } catch (error) {
      console.error('Error ensuring Camunda process:', error);
    }
  },

  async sendVote(tripId: string, vote: any) {
    try {
      // Fetch the specific process instance ID to avoid correlation errors if multiple exist
      const piRes = await axios.get(`${CAMUNDA_REST_URL}/process-instance?processDefinitionKey=phase1-voting&businessKey=${tripId}`);
      
      if (piRes.data.length > 0) {
        const processInstanceId = piRes.data[0].id;
        
        await axios.post(`${CAMUNDA_REST_URL}/message`, {
          messageName: 'VoteReceived',
          processInstanceId: processInstanceId,
          processVariables: {
            singleVoteJson: { value: JSON.stringify(vote), type: 'String' }
          }
        });
      }
    } catch (error) {
      console.error('Error sending vote to Camunda:', error);
    }
  },

  async getLiveResults(tripId: string): Promise<any[]> {
    try {
      // Find the running process instance for this trip
      const piRes = await axios.get(`${CAMUNDA_REST_URL}/process-instance?processDefinitionKey=phase1-voting&businessKey=${tripId}`);
      if (piRes.data.length === 0) return [];
      
      const processInstanceId = piRes.data[0].id;
      
      // Get its variables
      const varRes = await axios.get(`${CAMUNDA_REST_URL}/process-instance/${processInstanceId}/variables`);
      
      if (varRes.data.votingResults) {
        return JSON.parse(varRes.data.votingResults.value);
      }
      return [];
    } catch (error) {
      console.error('Camunda Get Results Error:', error);
      return [];
    }
  },

  async getLiveRawVotes(tripId: string): Promise<any[]> {
    try {
      const piRes = await axios.get(`${CAMUNDA_REST_URL}/process-instance?processDefinitionKey=phase1-voting&businessKey=${tripId}`);
      if (piRes.data.length === 0) return [];
      
      const processInstanceId = piRes.data[0].id;
      const varRes = await axios.get(`${CAMUNDA_REST_URL}/process-instance/${processInstanceId}/variables`);
      
      if (varRes.data.votesJson) {
        return JSON.parse(varRes.data.votesJson.value);
      }
      return [];
    } catch (error) {
      console.error('Camunda Get Raw Votes Error:', error);
      return [];
    }
  },

  async deployProcess(xml: string, filename: string) {

    const formData = new FormData();
    // For web/browser environments (like Expo web)
    const blob = new Blob([xml], { type: 'text/xml' });
    formData.append('upload', blob, filename);
    formData.append('deployment-name', 'vibes-discovery');

    try {
      await axios.post(`${CAMUNDA_REST_URL}/deployment/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('BPMN Deployed successfully');
    } catch (error) {
      console.error('Deployment Error:', error);
    }
  }
};

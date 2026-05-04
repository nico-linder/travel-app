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

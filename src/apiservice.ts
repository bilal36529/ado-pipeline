import axios from 'axios';

// Define the type for a pipeline run
interface PipelineRun {
    id: number;
    name: string;
    status: string;
}

// Define the response structure from Azure DevOps
interface AzurePipelineResponse {
    value: PipelineRun[];
}

// Base URL for Azure DevOps API
// const baseURL = 'https://dev.azure.com/{organization}/{project}/_apis/pipelines/{pipelineId}/runs?api-version=6.0-preview.1';
const baseURL = "https://dev.azure.com/{organization}/{project}/_apis/pipelines"

// Fetch pipeline runs with proper TypeScript types
export const fetchPipelineRuns = async (definitionId: number): Promise<PipelineRun[]> => {
    console.log("Definition Id", definitionId.toString());
    try {
        // Replace placeholders in the URL
        const url = baseURL
            .replace('{organization}', process.env.REACT_APP_AZURE_ORGANIZATION as string)
            .replace('{project}', process.env.REACT_APP_AZURE_PROJECT as string)
            .replace('{pipelineId}', definitionId.toString());


        // Make the GET request with Authorization header
        const response = await axios.get<AzurePipelineResponse>(url, {
            headers: {
                'Authorization': `Basic ${btoa(':' + process.env.REACT_APP_AZURE_PAT)}`, // Base64 encode PAT
                'Content-Type': 'application/json',
            },
        });

        // Return the value array (list of pipeline runs)
        console.log("response", response.data)
        return response.data.value;
    } catch (error) {
        console.error('Error fetching pipeline runs:', error);
        throw error;
    }
};

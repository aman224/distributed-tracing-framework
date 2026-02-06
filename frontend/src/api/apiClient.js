import axios from 'axios';
import { getMockTraces, getMockTraceTree } from './mockData';

const getUseMock = () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true') return true;

    const localSetting = localStorage.getItem('useMock');
    if (localSetting !== null) {
        return localSetting === 'true';
    }

    return import.meta.env.VITE_USE_MOCK === 'true';
};

const useMock = getUseMock();

console.log('API Client Initialized. useMock value:', useMock);

const apiClient = {
    getTraces: async () => {
        if (useMock) {
            console.log('Using mock data for getTraces');
            const data = await getMockTraces();
            return { data };
        }
        return axios.get('/api/traces');
    },
    getTraceTree: async (traceId) => {
        if (useMock) {
            console.log(`Using mock data for getTraceTree: ${traceId}`);
            const data = await getMockTraceTree(traceId);
            return { data };
        }
        return axios.get(`/api/traces/${traceId}/tree`);
    }
};

export default apiClient;

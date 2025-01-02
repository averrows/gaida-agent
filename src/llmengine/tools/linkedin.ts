import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import axios from 'axios';

const axiosConfig = {
  headers: {
    'x-rapidapi-host': 'linkedin-data-api.p.rapidapi.com',
    'x-rapidapi-key': '2a67b391bcmsh064cdcc5602eadap1b4ed7jsnb3afcee56f63'
  }
};


const linkedinApi = axios.create(axiosConfig);

const searchLinkedinLink = tool(async (input) => {
  console.log("TOOL CALLED")
  const fetchLinkedinSearch = async (keywords: string) => {
    const response = await linkedinApi.get(`https://linkedin-data-api.p.rapidapi.com/search-people?keywords=${keywords}`);
    return response.data;
  }
  const searchResult = await fetchLinkedinSearch(input.keywords);
  console.log(searchResult);
  if (searchResult.data.length === 0) {
    return "No search result found";
  }
  const firstResult = searchResult.data.items[0];
  return firstResult.profileURL;
}, {
  name: 'search_linkedin',
  description: 'Search for a LinkedIn profile link',
  schema: z.object({
    keywords: z.string().describe("Keywords of a person to search for"),
  })
})

const getFullLinkedinProfileFromUrl = tool(async (input) => {
  const response = await linkedinApi.get(`https://linkedin-data-api.p.rapidapi.com/get-profile-data-by-url?url=${input.profileUrl}`);
  console.log(response.data);
  return response.data;
}, {
  name: 'get_linkedin_profile',
  description: 'Get full LinkedIn profile from a URL. This will return a JSON object with the profile data that contains the person\'s name, title, company, and other information.',
  schema: z.object({
    profileUrl: z.string().describe("URL of a LinkedIn profile"),
  })
})

export const tools = [searchLinkedinLink, getFullLinkedinProfileFromUrl];

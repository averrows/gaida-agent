import { db } from '@/db';
import { targetRecruits } from '@/db/schema';
import { tool } from '@langchain/core/tools';
import axios from 'axios';
import { eq, ilike } from 'drizzle-orm';
import { z } from 'zod';

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

const addTargetRecruit = tool(async (input) => {
  const recruit = await db.insert(targetRecruits).values(input);
  return recruit;
}, {
  name: 'add_target_recruit',
  description: 'Add a target recruit to the database',
  schema: z.object({
    linkedinProfileUrl: z.string().describe("URL of a LinkedIn profile"),
    name: z.string().describe("Name of the person"),
  })
})

const getTargetRecruitByName = tool(async (input) => {
  console.log("TOOL CALLED with input: ", input)
  const recruits = await db.select().from(targetRecruits).where(ilike(targetRecruits.name, '%' + input.keywords + '%'));
  console.log("Recruits: ", recruits)
  return JSON.stringify(recruits);
}, {
  name: 'get_target_recruit_by_name',
  description: 'Get a Target Recruit from the database by name',
  schema: z.object({
    keywords: z.string().describe("Keywords of a person to search for"),
  })
})

const getAllTargetRecruits = tool(async () => {
  const recruits = await db.select().from(targetRecruits);
  return JSON.stringify(recruits);
}, {
  name: 'get_all_target_recruits',
  description: 'Get All Target Recruits from the database. No input is required.',
  schema: z.object({})
})

const removeTargetRecruit = tool(async (input) => {
  const recruit = await db.delete(targetRecruits).where(eq(targetRecruits.id, input.id));
  return "Target recruit with id " + input.id + " removed";
}, {
  name: 'remove_target_recruit',
  description: 'Remove a Target Recruit from the database',
  schema: z.object({
    id: z.number().describe("ID of the Target Recruit to remove"),
  })
})

const updateTargetRecruitStatus = tool(async (input) => {
  const recruit = await db.update(targetRecruits).set({ recruitmentStatus: input.status }).where(eq(targetRecruits.id, input.id));
  return "Target recruit with id " + input.id + " updated to status " + input.status;
}, {
  name: 'update_target_recruit_status',
  description: "Update the status of a Target Recruit. Whether they are TARGETTED, INTERVIEWED, RECRUITED, or REJECTED. Targeted is the default status. It means that the person is still in the target list. Interviewed means that the person has been interviewed. Recruited means that the person has been recruited. Rejected means that the person has been rejected.",
  schema: z.object({
    id: z.number().describe("ID of the Target Recruit to update"),
    status: z.enum(["TARGETTED", "INTERVIEWED", "RECRUITED", "REJECTED"]).describe("Status of the Target Recruit"),
  })
})

export const tools = [
  searchLinkedinLink,
  getFullLinkedinProfileFromUrl,
  addTargetRecruit,
  getTargetRecruitByName,
  getAllTargetRecruits,
  removeTargetRecruit,
  updateTargetRecruitStatus
];

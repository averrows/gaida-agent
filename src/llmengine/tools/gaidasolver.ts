import { db } from '@/db';
import { interviews, targetRecruits } from '@/db/schema';
import { tool } from '@langchain/core/tools';
import axios from 'axios';
import { eq, ilike } from 'drizzle-orm';
import { z } from 'zod';

const axiosConfig = {
	baseURL: "http://localhost:9903",
  headers: {
		'x-api-key': 'secret_key',
    'x-user-data': 'ZQm4meqxbFcGqS5CWUvi8/YF5rMMxTzoZwiSexfqdEE='
  }
};


const genAiSolverAPI = axios.create(axiosConfig);

const getMigrationStatus = tool(async (input) => {
	try {
		const response = await genAiSolverAPI.get(`/api/migration/lookup`, {
			params: {
				migrationType: input.migrationType,
				number: input.number,
			}
		});
		return response.data;
	} catch (error) {
		console.error(error);
		return "Error: " + error;
	}
}, {
  name: 'get_migration_status',
  description: `
	This tool is used to get the migration status of a number.
	There are two types of migration:
	1. IH: Indihome, a product from Telkomsel regarding home wifi
	2. PSTN: Public Switched Telephone Network, a product from Telkom regarding phone

	When a prompt has indication that it is asking about PSTN or IH, but have unclear words like character within number or pstn that has no space with the number, please clarify to the user and give proper correction.

	You can use this tool to get the migration status of a number.
	`,
  schema: z.object({
    migrationType: z.enum(['IH', 'PSTN']).describe("The type of migration to get the status for"),
    number: z.string().describe("The number to get the migration status for"),
  })
})

const dscKnowledge = tool(async (input) => {
	try {
		const response = await genAiSolverAPI.post(`/api/v3/chat`, {
			prompt: input.prompt,
		});
		return response.data;
	} catch (error) {
		console.error(error);
		return "Error: " + error;
	}
}, {
  name: 'dsc_knowledge',
  description: `
	DSC is Digital Smart Care, A software that can help Telkomsel Customer Service to answer customer's question.
	You can use this tool to get the knowledge of a customer's question. Please use this tool for any question.
	`,
	schema: z.object({
		prompt: z.string().describe("The prompt to get the knowledge for"),
	})
})

export const tools = [
	getMigrationStatus,
	dscKnowledge,
]

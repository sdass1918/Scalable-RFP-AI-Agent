import { ai } from '../services/gemini';
import { getRfpWebsiteContent } from '../tools/webAndFileTools';
import { getItemPrice, findProductBySku } from '../tools/dataQueryTools';
import { Chat, FunctionDeclaration } from '@google/genai';

const getRfpWebsiteContents: FunctionDeclaration = {
    name: 'getRfpWebsiteContent',
    description: 'Gets the text content from the tender and RFP website.',
    parametersJsonSchema: {
        type: 'object', 
        properties: {
            url: { type: 'string', description: 'The URL of the RFP or tender website to scrape content from.' },
        },
        required: ['url']
    },
}

const findProductsBySku: FunctionDeclaration = {
    name: 'findProductBySku',
    description: 'Finds a product in the catalog by its SKU.',
    parametersJsonSchema: {
        type: 'object',
        properties: {
            sku: { type: 'string', description: 'The SKU to search for.' },
        },
    }
}

const getItemPrices: FunctionDeclaration = {
    name: 'getItemPrice',
    description: 'Looks up the price for a given SKU or Test name.',
    parametersJsonSchema: {
        type: 'object',
        properties: {
            itemName: { type: 'string', description: 'The SKU or Test name.' },
        },
    }
}

const toolFunctions = {
  getRfpWebsiteContent,
  findProductBySku,
  getItemPrice,
};

export const runRfpProcess = async (url: string) => {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
        tools: [{functionDeclarations: [getRfpWebsiteContents, findProductsBySku, getItemPrices]}]
    }
  })

  // --- 1. SALES AGENT ---
  console.log('--- Running Sales Agent ---');
  const salesAgentPrompt = `
    You are a Sales Agent for a wires and cables company.
    Your task is to identify relevant RFPs from the website URL provided.
    Today's date is ${new Date().toLocaleDateString('en-GB')}.
    Use the getRfpWebsiteContent tool with the URL "${url}" to scan for RFPs due in the next 3 months.
    From the relevant RFPs, select the one with the soonest due date and summarize its key requirements.
    Only provide the summary of the single, most urgent, and relevant RFP.
  `;
  const salesResult = await runAgent(chat, salesAgentPrompt);

  // --- 2. TECHNICAL AGENT ---
  console.log('--- Running Technical Agent ---');
  const technicalAgentPrompt = `
    You are a Technical Agent. Based on the previous RFP summary: "${salesResult}".
    Identify the specific product requirements (Voltage, Material, Insulation).
    Your goal is to recommend the best matching SKU from our product catalog. For this simplified task, let's assume the RFP maps directly to one of our SKUs.
    Propose the best SKU for the requirement. For example, for "1.1kV Copper conductors with XLPE insulation", the best SKU is "W-CU-XLPE-1.1".
    Then, create a "Spec Match" table comparing the RFP requirement to the specs of your recommended product SKU. Use the findProductBySku tool to get the product details.
    Finally, list any required tests mentioned in the RFP, for example, a "High Voltage Test".
  `;
  const technicalResult = await runAgent(chat, technicalAgentPrompt);

  // --- 3. PRICING AGENT ---
  console.log('--- Running Pricing Agent ---');
  const pricingAgentPrompt = `
    You are a Pricing Agent. Based on the technical agent's report: "${technicalResult}".
    Extract the recommended SKU and any mentioned tests.
    Use the getItemPrice tool to find the price for each item (both the SKU and the tests).
    Compile a final pricing table with columns: Item, Type (SKU or Test), and Price.
  `;
  const pricingResult = await runAgent(chat, pricingAgentPrompt);

  // --- 4. FINAL CONSOLIDATION ---
  console.log('--- Consolidating Final Response ---');
  const finalConsolidationPrompt = `
    You are the Main Agent. Consolidate the information from the previous steps into a final, clean RFP response summary.
    The response should be a JSON object with three keys: "rfpSummary", "technicalSolution", and "priceQuote".
    - rfpSummary: ${salesResult}
    - technicalSolution: ${technicalResult}
    - priceQuote: ${pricingResult}
    Format the final output as a single, clean JSON object. Do not include any text before or after the JSON.
  `;
  const finalResult = await runAgent(chat, finalConsolidationPrompt, false); // No tool calls needed for final formatting

  try {
    const jsonResponse = finalResult?.replace(/```json\n|```/g, '').trim();
    if(!jsonResponse) {
        return {};
    }
    return JSON.parse(jsonResponse);
  } catch (e) {
    console.error("Failed to parse final JSON response:", e);
    return { error: "Failed to generate a valid final response.", details: finalResult };
  }
};


const runAgent = async (chat: Chat, prompt: string, useTools: boolean = true) => {
  const result = await chat.sendMessage({message: prompt});
  const call = result.functionCalls?.[0];

  if (call && useTools && call.args) {
    console.log(`[Agent Action] Calling tool: ${call.name} with args:`, call.args);
    
    let apiResult;
    try {
      // Handle different tool functions with their specific parameter requirements
      if (call.name === 'getRfpWebsiteContent') {
        const url = call.args.url as string;
        if (!url) throw new Error('URL parameter is required for getRfpWebsiteContent');
        apiResult = await getRfpWebsiteContent(url);
      } else if (call.name === 'findProductBySku') {
        const sku = call.args.sku as string;
        if (!sku) throw new Error('SKU parameter is required for findProductBySku');
        apiResult = await findProductBySku(sku);
      } else if (call.name === 'getItemPrice') {
        const itemName = call.args.itemName as string;
        if (!itemName) throw new Error('itemName parameter is required for getItemPrice');
        apiResult = await getItemPrice(itemName);
      } else {
        throw new Error(`Unknown tool function: ${call.name}`);
      }
    } catch (error) {
      console.error(`Error calling tool ${call.name}:`, error);
      apiResult = `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
    }
    
    const nextResult = await chat.sendMessage({
        message:[
            { 
                functionResponse: { 
                    name: call.name, 
                    response: { result: apiResult }
                } 
            }
        ]
    });   
    return nextResult.text;
  }
return result.text;
};
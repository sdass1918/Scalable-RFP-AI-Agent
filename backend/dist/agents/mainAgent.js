"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runRfpProcess = void 0;
const gemini_1 = require("../services/gemini");
const webAndFileTools_1 = require("../tools/webAndFileTools");
const dataQueryTools_1 = require("../tools/dataQueryTools");
const getRfpWebsiteContents = {
    name: 'getRfpWebsiteContent',
    description: 'Gets the text content from the tender and RFP website.',
    parametersJsonSchema: {
        type: 'object',
        properties: {}
    },
};
const findProductsBySku = {
    name: 'findProductBySku',
    description: 'Finds a product in the catalog by its SKU.',
    parametersJsonSchema: {
        type: 'object',
        properties: {
            sku: { type: 'string', description: 'The SKU to search for.' },
        },
    }
};
const getItemPrices = {
    name: 'getItemPrice',
    description: 'Looks up the price for a given SKU or Test name.',
    parametersJsonSchema: {
        type: 'object',
        properties: {
            itemName: { type: 'string', description: 'The SKU or Test name.' },
        },
    }
};
const toolFunctions = {
    getRfpWebsiteContent: webAndFileTools_1.getRfpWebsiteContent,
    findProductBySku: dataQueryTools_1.findProductBySku,
    getItemPrice: dataQueryTools_1.getItemPrice,
};
const runRfpProcess = () => __awaiter(void 0, void 0, void 0, function* () {
    const chat = gemini_1.ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
            tools: [{ functionDeclarations: [getRfpWebsiteContents, findProductsBySku, getItemPrices] }]
        }
    });
    // --- 1. SALES AGENT ---
    console.log('--- Running Sales Agent ---');
    const salesAgentPrompt = `
    You are a Sales Agent for a wires and cables company.
    Your task is to identify relevant RFPs.
    Today's date is ${new Date().toLocaleDateString('en-GB')}.
    Use the getRfpWebsiteContent tool to scan for RFPs due in the next 3 months.
    From the relevant RFPs, select the one with the soonest due date and summarize its key requirements.
    Only provide the summary of the single, most urgent, and relevant RFP.
  `;
    const salesResult = yield runAgent(chat, salesAgentPrompt);
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
    const technicalResult = yield runAgent(chat, technicalAgentPrompt);
    // --- 3. PRICING AGENT ---
    console.log('--- Running Pricing Agent ---');
    const pricingAgentPrompt = `
    You are a Pricing Agent. Based on the technical agent's report: "${technicalResult}".
    Extract the recommended SKU and any mentioned tests.
    Use the getItemPrice tool to find the price for each item (both the SKU and the tests).
    Compile a final pricing table with columns: Item, Type (SKU or Test), and Price.
  `;
    const pricingResult = yield runAgent(chat, pricingAgentPrompt);
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
    const finalResult = yield runAgent(chat, finalConsolidationPrompt, false); // No tool calls needed for final formatting
    try {
        const jsonResponse = finalResult === null || finalResult === void 0 ? void 0 : finalResult.replace(/```json\n|```/g, '').trim();
        if (!jsonResponse) {
            return {};
        }
        return JSON.parse(jsonResponse);
    }
    catch (e) {
        console.error("Failed to parse final JSON response:", e);
        return { error: "Failed to generate a valid final response.", details: finalResult };
    }
});
exports.runRfpProcess = runRfpProcess;
const runAgent = (chat_1, prompt_1, ...args_1) => __awaiter(void 0, [chat_1, prompt_1, ...args_1], void 0, function* (chat, prompt, useTools = true) {
    var _a;
    const result = yield chat.sendMessage({ message: prompt });
    const call = (_a = result.functionCalls) === null || _a === void 0 ? void 0 : _a[0];
    if (call && useTools) {
        console.log(`[Agent Action] Calling tool: ${call.name}`);
        // @ts-ignore
        const apiResult = yield toolFunctions[call.name](...Object.values(call.args));
        const nextResult = yield chat.sendMessage({
            message: [
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
});

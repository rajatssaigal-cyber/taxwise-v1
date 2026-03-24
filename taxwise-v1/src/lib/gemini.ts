import { GoogleGenAI } from "@google/genai";
import * as XLSX from 'xlsx';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface TaxAnalysisResult {
  summary: {
    totalIncome: number;
    salaryIncome: number;
    shortTermCapitalGains: number;
    longTermCapitalGains: number;
    dividendIncome: number;
    otherIncome: number;
    deductions80C: number;
    deductionsOther: number;
    totalTaxLiability: number;
    oldRegimeTax: number;
    newRegimeTax: number;
    taxPaid: number;
    balanceTax: number;
  };
  itrGuidance: {
    recommendedForm: string;
    reasoning: string;
    filingSteps: string[];
    keySchedules: string[];
  };
  advanceTaxSchedule: {
    dueDate: string;
    percentage: number;
    cumulativeAmount: number;
    installmentAmount: number;
  }[];
  foreignAssetsSchedule?: {
    assetType: string;
    description: string;
    country: string;
    dateOfAcquisition: string;
    costOfAcquisition: number;
    peakValueDuringYear: number;
    closingBalance: number;
    incomeDerived: number;
    natureOfIncome: string;
  }[];
  detailedBreakdown: string;
  recommendations: string[];
  filingGuide?: {
    title: string;
    steps: {
      title: string;
      description: string;
    }[];
  };
}

export async function analyzeTaxDocuments(files: { name: string; data: string; mimeType: string }[], financialYear: string): Promise<TaxAnalysisResult> {
  const model = "gemini-3.1-pro-preview";
  
  const processedParts = await Promise.all(files.map(async (file) => {
    const base64Data = file.data.split(',')[1];
    
    if (file.mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimeType === 'application/vnd.ms-excel') {
      try {
        const binaryString = atob(base64Data);
        const workbook = XLSX.read(binaryString, { type: 'binary' });
        let combinedCsv = "";
        
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          combinedCsv += `--- Sheet: ${sheetName} ---\n${csv}\n\n`;
        });

        return {
          text: `File: ${file.name}\nContent (CSV):\n${combinedCsv}`
        };
      } catch (e) {
        console.error(`Error parsing Excel file ${file.name}:`, e);
        return { text: `Error parsing Excel file: ${file.name}` };
      }
    }

    return {
      inlineData: {
        data: base64Data,
        mimeType: file.mimeType
      }
    };
  }));

  const prompt = `
    You are a Senior Chartered Accountant and Tax Expert in India. 
    Analyze the provided documents (Form 16, Salary Slips, P&L statements from Zerodha/Groww/Upstox, e-CAS, MF statements, Foreign Asset holdings like RSU/ESPP vesting, buying, selling, etc.) for the Financial Year ${financialYear}.
    
    Your goal is to provide a COMPLETE tax liability calculation for ITR filing and guide the user on which ITR form to use.
    
    Extract & Calculate:
    1. Salary Income (from Form 16 or Salary Slips). If Salary Slips are provided, extrapolate to the full year if necessary.
    2. Short Term Capital Gains (STCG) - Equity (20%), Debt, others.
    3. Long Term Capital Gains (LTCG) - Equity (12.5% above 1.25L), Debt, others.
    4. Dividend Income & Other Income.
    5. Deductions (80C, 80D, 80G, 80TTA/B, etc.) - Extract from Form 16, Salary Slips, or other docs.
    6. Total Tax Liability (Calculate for BOTH New Regime and Old Regime).
    7. Advance Tax Schedule (based on the total estimated tax for the year).
    8. Foreign Assets (Schedule FA) - If any foreign assets like RSUs, ESPPs, or foreign bank accounts are detected, prepare a detailed schedule for ITR-2. Include asset type, description, country, date of acquisition, cost, peak value, closing balance, and income derived.
    
    ITR Guidance:
    - Recommend ITR-1, ITR-2, or ITR-3 based on income sources (e.g., ITR-2 if capital gains or foreign assets are present).
    - List key schedules to fill (e.g., Schedule CG, Schedule OS, Schedule VIA, Schedule FA).
    - Provide 5 clear filing steps.
    
    Filing Guide:
    - Provide a step-by-step guide on how to file this specific return on the Income Tax Department's website (incometax.gov.in).
    
    Return the result strictly in the following JSON format:
    {
      "summary": {
        "totalIncome": number,
        "salaryIncome": number,
        "shortTermCapitalGains": number,
        "longTermCapitalGains": number,
        "dividendIncome": number,
        "otherIncome": number,
        "deductions80C": number,
        "deductionsOther": number,
        "totalTaxLiability": number,
        "oldRegimeTax": number,
        "newRegimeTax": number,
        "taxPaid": number,
        "balanceTax": number
      },
      "itrGuidance": {
        "recommendedForm": "string (e.g. ITR-2)",
        "reasoning": "string",
        "filingSteps": ["step 1", "step 2", "step 3", "step 4", "step 5"],
        "keySchedules": ["Schedule CG", "Schedule OS", "Schedule FA", "..."]
      },
      "advanceTaxSchedule": [
        { "dueDate": "June 15, 2025", "percentage": 15, "cumulativeAmount": number, "installmentAmount": number },
        { "dueDate": "Sept 15, 2025", "percentage": 45, "cumulativeAmount": number, "installmentAmount": number },
        { "dueDate": "Dec 15, 2025", "percentage": 75, "cumulativeAmount": number, "installmentAmount": number },
        { "dueDate": "Mar 15, 2026", "percentage": 100, "cumulativeAmount": number, "installmentAmount": number }
      ],
      "foreignAssetsSchedule": [
        {
          "assetType": "string",
          "description": "string",
          "country": "string",
          "dateOfAcquisition": "string",
          "costOfAcquisition": number,
          "peakValueDuringYear": number,
          "closingBalance": number,
          "incomeDerived": number,
          "natureOfIncome": "string"
        }
      ],
      "detailedBreakdown": "Markdown string explaining the calculations, sections of the law applied, and New vs Old regime comparison",
      "recommendations": ["string", "string"],
      "filingGuide": {
        "title": "Step-by-Step Filing Guide",
        "steps": [
          { "title": "string", "description": "string" }
        ]
      }
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      { parts: [...processedParts, { text: prompt }] }
    ],
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse tax analysis:", e);
    throw new Error("Failed to analyze documents. Please ensure they are clear and relevant.");
  }
}

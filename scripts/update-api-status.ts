import fs from 'fs/promises';

async function updateApiStatusFile() {
  const apiStatusFilePath = 'API_STATUS.md';
  let content: string;

  try {
    content = await fs.readFile(apiStatusFilePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading ${apiStatusFilePath}: ${error}`);
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log(`${apiStatusFilePath} does not exist. Please ensure the file is present.`);
    }
    return;
  }

  const missingApis = [
    { name: 'Inventory Management API', pathSegment: '/api/inventory' },
    { name: 'Comments & Reviews API', pathSegment: '/api/comments' },
    { name: 'Webhook Management API', pathSegment: '/api/webhooks' },
    { name: 'Rate Limiting API', pathSegment: '/api/limited' },
    { name: 'Background Jobs API', pathSegment: '/api/jobs' },
    { name: 'Device Management API', pathSegment: '/api/devices' }
  ];

  const auditDate = new Date().toISOString().split('T')[0];
  const auditNote = `

## 📝 Audit Note (${auditDate})

Recent automated testing (as of ${auditDate}) using \`scripts/test-apis.ts\` has revealed discrepancies between the previously documented status and the actual implementation state of some APIs. The following sections have been updated to reflect these findings. For detailed test results, refer to the output of the test script.
`;

  const auditNoteMark = auditNote.trim().split('\n')[2]; // A unique line from the audit note
  if (!content.includes(auditNoteMark)) {
    content = content.replace(/^# 🚀 Gen-Endpoint API Status Summary/m, `# 🚀 Gen-Endpoint API Status Summary${auditNote}`);
  }

  // Determine original total and new count of fully implemented APIs
  let declaredTotalApis = 23; // Default
  const headerRegex = /### \*\*✅ FULLY IMPLEMENTED \((\d+)\s*APIs?\)\*\*/;
  const headerMatch = content.match(headerRegex);
  if (headerMatch && headerMatch[1]) {
    declaredTotalApis = parseInt(headerMatch[1], 10);
  } else {
    // Fallback: try to count total APIs listed under "FULLY IMPLEMENTED" if main header is off
    // This regex looks for lines starting with "✅" followed by API name and path.
    const apiEntryRegex = /^\s*- ✅ .*? \(`\/api\/.*`\)/gm;
    const listedApis = content.match(apiEntryRegex);
    if (listedApis) {
        // Count existing non-missing APIs + number of APIs we know are missing
        const currentlyListedImplemented = listedApis.filter(line => !line.includes("REQUIRES IMPLEMENTATION")).length;
        // This estimation logic might be tricky if some APIs were already marked missing by a previous script run.
        // For now, assume 'missingApis' list is the ground truth for *newly* found missing ones.
        // A simpler fallback is just to use the default 23 if header parse fails.
        console.warn(`Could not parse total API count from header. Defaulting to previous total of ${declaredTotalApis} and calculating based on newly found missing APIs.`);
    } else {
        console.warn(`Could not parse total API count from header or list, defaulting to ${declaredTotalApis}.`);
    }
  }
  const actuallyImplementedCount = declaredTotalApis - missingApis.length;

  // Mark missing APIs in the main list
  for (const missingApi of missingApis) {
    const regex = new RegExp(`(✅ ${missingApi.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(\\\`${missingApi.pathSegment}.*?\\\`\\))`, 'gm');
    content = content.replace(regex, `❌ **${missingApi.name}** (\`${missingApi.pathSegment}/*\`) - **REQUIRES IMPLEMENTATION** (Identified ${auditDate})`);
  }

  // Update the "FULLY IMPLEMENTED" summary count in the header
  content = content.replace(
    headerRegex, // Use the more specific regex for replacement
    `### **✅ PARTIALLY IMPLEMENTED (Approx. ${actuallyImplementedCount} of ${declaredTotalApis} originally listed APIs functional)**`
  );
  // Update more general text if it exists (from a previous version of the script/doc)
  content = content.replace(/Originally listed as \d+ APIs/, `Originally listed as ${declaredTotalApis} APIs`);
  content = content.replace(/\d+ fully functional APIs|\d+ currently appear functional or partially implemented based on test script results, while \d+ require full server-side implementation./,
    `${actuallyImplementedCount} APIs appear functional or partially implemented; ${missingApis.length} require full server-side implementation as of ${auditDate}.`);


  const requiresImplementationSectionTitle = `## 🛠️ APIs Requiring Server-Side Implementation (${auditDate})`;
  const requiresImplementationDetails =
    missingApis.map(api => `- ❌ **${api.name}** (\`${api.pathSegment}/*\`)`).join('\n') +
    `\n\nThese APIs are defined in \`src/data/apis.ts\` but their core server-side route handlers were not found by the \`scripts/test-apis.ts\` audit. They are currently **NOT FUNCTIONAL**.`;

  const existingRequiresSectionRegex = /## 🛠️ APIs Requiring Server-Side Implementation \(\d{4}-\d{2}-\d{2}\)[\s\S]*?(?=\n##|$)/;
  if (content.match(existingRequiresSectionRegex)) {
    content = content.replace(existingRequiresSectionRegex, `${requiresImplementationSectionTitle}\n\n${requiresImplementationDetails}`);
  } else {
    const testingOptionsHeading = "## 🧪 Testing Options Available"; // More specific
    const testingOptionsHeadingAlt = "## 🛠️ **Testing Options Available**"; // Old version
    if (content.includes(testingOptionsHeading)) {
      content = content.replace(testingOptionsHeading, `${requiresImplementationSectionTitle}\n\n${requiresImplementationDetails}\n\n${testingOptionsHeading}`);
    } else if (content.includes(testingOptionsHeadingAlt)) {
      content = content.replace(testingOptionsHeadingAlt, `${requiresImplementationSectionTitle}\n\n${requiresImplementationDetails}\n\n${testingOptionsHeadingAlt}`);
    } else {
      content += `\n\n${requiresImplementationSectionTitle}\n\n${requiresImplementationDetails}`;
    }
  }

  const knownIssuesTitle = `### ⚠️ Known Issues (as of ${auditDate})`;
  const knownIssuesContent = `
- ⚠️ **Several APIs are missing implementations and will result in module load errors or 404s (see '${requiresImplementationSectionTitle.replace('## ', '')}').**
- ⚠️ **Test script results from \`scripts/test-apis.ts\` show additional HTTP errors for some implemented endpoints (needs detailed review).**
- ✅ Many APIs appear functional or partially implemented, but thorough verification is ongoing.`;

  if (content.includes("### **Zero Known Issues**")) {
    content = content.replace(/### \*\*Zero Known Issues\*\*[\s\S]*?(?=\n##|$)/, `${knownIssuesTitle}\n${knownIssuesContent}`);
  } else if (content.match(/### ⚠️ Known Issues \(as of \d{4}-\d{2}-\d{2}\)/)) {
    content = content.replace(/### ⚠️ Known Issues \(as of \d{4}-\d{2}-\d{2}\)[\s\S]*?(?=\n##|$)/, `${knownIssuesTitle}\n${knownIssuesContent}`);
  } else if (content.includes("### ⚠️ Known Issues")) { // Generic fallback
     content = content.replace(/### ⚠️ Known Issues[\s\S]*?(?=\n##|$)/, `${knownIssuesTitle}\n${knownIssuesContent}`);
  }


   const nextStepsTitle = `## 🚀 Next Steps (Updated ${auditDate})`;
   const nextStepsIntro = `The Gen-Endpoint project aims to be a complete API showcase. Current status (as of ${auditDate}):`;
   const nextStepsBody = `
- **Approximately ${actuallyImplementedCount} APIs appear functional or partially implemented.**
- **${missingApis.length} APIs require server-side implementation (see list under '${requiresImplementationSectionTitle.replace('## ', '')}').**
- Multiple testing interfaces are available.
- Documentation is largely comprehensive but will be updated as APIs are implemented/fixed.
- Real-world business logic examples are present in many implemented APIs.

Many APIs are ready for testing. However, those listed as requiring server-side implementation are not yet functional. This document will be updated as implementations are completed.
`;
   const nextStepsRegex = /## 🚀 \*\*Next Steps\*\*[\s\S]*?(?=\n---|$)/; // Match until horizontal rule or end of file
   if(content.match(nextStepsRegex)) {
       content = content.replace(nextStepsRegex, `${nextStepsTitle}\n\n${nextStepsIntro}\n${nextStepsBody}`);
   } else { // Fallback if the specific structure isn't found
       content = content.replace(/## 🚀 Next Steps(?: \(Updated \d{4}-\d{2}-\d{2}\))?/, nextStepsTitle);
       // Add other replacements if needed, or append the whole new section
   }


  try {
    await fs.writeFile(apiStatusFilePath, content, 'utf-8');
    console.log(`${apiStatusFilePath} updated successfully.`);
    console.log("Summary of changes to API_STATUS.md:");
    console.log("- Added/Updated an audit note with the current date.");
    console.log(`- Marked or confirmed ${missingApis.length} APIs as 'REQUIRES IMPLEMENTATION'.`);
    console.log("- Updated the count of (partially) implemented APIs.");
    console.log("- Added/Updated 'APIs Requiring Server-Side Implementation' section.");
    console.log("- Updated 'Known Issues' section.");
    console.log("- Updated 'Next Steps' section.");

  } catch (error) {
    console.error(`Error writing ${apiStatusFilePath}: ${error}`);
  }
}

updateApiStatusFile().catch(console.error);

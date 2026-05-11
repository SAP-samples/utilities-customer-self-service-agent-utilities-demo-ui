module.exports = {
    executeAction: async function (actionDefinition, actionData, keys, odataRequest) {
        switch (actionDefinition.name) {
            case 'generateTestCase': {
                // Read mock data from testCaseMockData.json and return as export parameters
                const fs = require('fs');
                const path = require('path');
                const mockDataPath = path.join(__dirname, 'testCaseMockData.json');
                let mockData;
                try {
                    mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
                } catch (err) {
                    this.throwError('Mock data not found or invalid', 500, { error: { message: err.message } });
                }
                // simulate delay
                const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
                await wait(3000);
                return {
                    testCase: mockData.testCase,
                    testData: mockData.testData
                };
            }
            default:
                this.throwError('Not implemented', 501, {
                    error: {
                        message: `FunctionImport or Action "${actionDefinition.name}" not mocked`
                    }
                });
        }
    }
}
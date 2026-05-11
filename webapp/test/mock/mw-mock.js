import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default function () {
    return async function (req, res) {
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                // Parse the JSON payload
                try {
                    const payload = JSON.parse(body);
                    readResponse(res, payload.q);
                } catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(e));
                }
            });
        }
    };
}

const readResponse = (res, q) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    let sPath = resolve(__dirname, 'data.json');
    const sData = readFileSync(sPath, 'utf8');
    const oData = JSON.parse(sData);
    let oResponse = oData[q];
    if (!oResponse) {
        // mock data does not have response for the question
        oResponse = {
            message: `No response found for the question: ${q}. Please find available mock data from below card.`,
            card: 'welcome_card.json'
        };
    }
    if (oResponse.message) {
        //return message word by word with delay
        const words = oResponse.message.split(' ');
        let i = 0;
        setTimeout(() => {
            const interval = setInterval(() => {
                if (i < words.length) {
                    res.write(words[i] + ' ');
                    i++;
                } else {
                    delete oResponse.message;
                    // check if need to send card
                    if (oResponse.card) {
                        sPath = resolve(__dirname, 'cards', oResponse.card);
                        const sCard = readFileSync(sPath, 'utf8');
                        res.write('\n|ui5Card|');
                        res.write(`\n---${sCard}\n---`);
                        delete oResponse.card;
                        return;
                    }
                    if (oResponse.buttons) {
                        sPath = resolve(__dirname, 'buttons', oResponse.buttons);
                        const sButtons = readFileSync(sPath, 'utf8');
                        res.write('\n|ui5Buttons|');
                        res.write(`\n---${sButtons}\n---`);
                        delete oResponse.buttons;
                    }
                    if (Object.keys(oResponse).length === 0) {
                        clearInterval(interval);
                        res.end();
                    }
                }
            }, 50);
        }, 2000); // simulate LLM delay
    }
}
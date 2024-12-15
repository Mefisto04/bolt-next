// Next.js API route for stripIndents function

// Exporting the stripIndents function for API use
export default function handler(req:any, res:any) {
    if (req.method === "POST") {
        const { value, template } = req.body;

        if (value) {
            return res.json({ result: stripIndents(value) });
        }

        if (template) {
            const { strings, values } = template;
            return res.json({ result: stripIndents(strings, ...values) });
        }

        return res.status(400).json({ message: "Invalid input data" });
    } else {
        return res.status(405).json({ message: "Method Not Allowed" });
    }
}

// Function to handle string indentation stripping
export function stripIndents(value: string): string;
export function stripIndents(strings: TemplateStringsArray, ...values: any[]): string;
export function stripIndents(arg0: string | TemplateStringsArray, ...values: any[]) {
    if (typeof arg0 !== 'string') {
        const processedString = arg0.reduce((acc, curr, i) => {
            acc += curr + (values[i] ?? '');
            return acc;
        }, '');

        return _stripIndents(processedString);
    }

    return _stripIndents(arg0);
}

// Helper function to strip indents from the value
function _stripIndents(value: string) {
    return value
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
        .trimStart()
        .replace(/[\r\n]$/, '');
}

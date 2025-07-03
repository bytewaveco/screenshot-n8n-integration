import type { INodeType, INodeTypeDescription,IExecuteFunctions } from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import puppeteer from 'puppeteer';

export class Screenshot implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Screenshot',
		name: 'screenshot',
		icon: 'file:trbo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Take a screenshot of a website',
		defaults: {
			name: 'Screenshot',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Url',
				name: 'url',
				type: 'string',
				default: '',
				noDataExpression: true,
				required: true,
			},
			{
				displayName: 'Width',
				name: 'width',
				type: 'number',
				default: 1920,
				description: 'The width of the screenshot',
			},
			{
				displayName: 'Height',
				name: 'height',
				type: 'number',
				default: 1080,
				description: 'The height of the screenshot',
			},
		],
	};
	async execute(this:IExecuteFunctions) {
		const items = this.getInputData();
		const returnData = [];

		for (let i = 0; i < items.length; i++) {
			const url = this.getNodeParameter('url', i) as string;

			if (typeof url !== 'string') {
				returnData.push({ json: { url, title: null, description: null, screenshot: null, html: null } });
				continue;
			}

			const width = this.getNodeParameter('width', i, 1920) as number;
			const height = this.getNodeParameter('height', i, 1080) as number;
			const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
			const page = await browser.newPage();

			await page.setViewport({ width: width, height: height, deviceScaleFactor: 1 });
			await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

			const buffer = await page.screenshot({ type: 'jpeg', quality: 80, fullPage: false });
			const title = await page.title();
			const content = await page.content();
			const description = await page.$$eval(
				'meta[name="description"],meta[property="og:description"]',
				metas => metas.map(m => m.content).find(Boolean) || null
			);

			await browser.close();

			returnData.push({ json: { url, title, description, screenshot: `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`, html: content } });
		}

		return this.prepareOutputData(returnData);
	}
}

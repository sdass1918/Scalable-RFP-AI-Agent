import fs from 'fs/promises';
import path from 'path';

const parseCsv = (csv : string) => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index].trim();
            return obj;
        }, {} as Record<string, string>);
    });
};

export const findProductBySku = async (sku: string) => {
    const Path = path.join(process.cwd(), 'data', 'products.csv');
    const file = await fs.readFile(Path, 'utf-8');
    const products = parseCsv(file);
    return products.find(p => p.SKU === sku) || null;
};

export const getItemPrice = async (itemName: string) => {
    const Path = path.join(process.cwd(), 'data', 'pricing.csv');
    const file = await fs.readFile(Path, 'utf-8');
    const prices = parseCsv(file);
    const item = prices.find(p => p.Item === itemName)
    if(item) {
        return {item: itemName, price: parseFloat(item.Price)};
    }else {
        return {item: itemName, price: null};
    }
};
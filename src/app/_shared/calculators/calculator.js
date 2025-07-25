import { calculate as finnairCalculate } from './finnair/calculator';
import { calculate as malaysiaCalculate } from './malaysia/calculator';
import { calculate as qantasCalculate } from './qantas/calculator';

const _calculators = {
  finnair: finnairCalculate,
  malaysia: malaysiaCalculate,
  qantas: qantasCalculate,
};

export class Calculator {
  async calculate(program, segments, eliteStatus, priceLessTaxes) {
    console.log('calculate', program, segments, eliteStatus, priceLessTaxes);
    const results = await _calculators[program](segments, eliteStatus, priceLessTaxes);
    console.log('results', results);
    return results;
  }
}

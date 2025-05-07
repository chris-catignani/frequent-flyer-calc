import { calculate as qantasCalculate } from './qantas/calculator';

const _calculators = {
  qantas: qantasCalculate,
};

export class Calculator {
  async calculate(program, segments, eliteStatus) {
    console.log('calculate', program, segments, eliteStatus);
    const results = await _calculators[program](segments, eliteStatus);
    console.log('results', results);
    return results;
  }
}

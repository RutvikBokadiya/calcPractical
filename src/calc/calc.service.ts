import { Injectable } from '@nestjs/common';
import { CalcDto } from './calc.dto';
import { BadRequestException } from '@nestjs/common';
import { ENVIRONMENTS, ERROR_MESSAGES } from 'src/constants';
@Injectable()
export class CalcService {
  calculateExpression(calcBody: CalcDto) {
    // Validate the expression before processing
    if (!this.isValidExpression(calcBody.expression)) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_EXPRESSION);
    }

    const tokens = this.isValidExp(calcBody.expression);

    const result =
      process.env.TEST_ENV === ENVIRONMENTS.BASIC
        ? this.evaluateWithoutPrecedence(tokens)
        : this.evaluateWithPrecedence(tokens);
    return result;
    // return 0;
  }

  // Method to tokenize the input expression
  private isValidExp(expression: string): string[] {
    const tokens: string[] = [];
    let currentNumber = '';

    for (const char of expression) {
      if ('0123456789.'.includes(char)) {
        currentNumber += char;
      } else if ('+-*/'.includes(char)) {
        if (currentNumber) {
          tokens.push(currentNumber);
          currentNumber = '';
        }
        tokens.push(char);
      } else if (char.trim() === '') {
        continue;
      } else {
        throw new Error(ERROR_MESSAGES.INVALID_CHAR);
      }
    }

    if (currentNumber) {
      tokens.push(currentNumber);
    }

    return tokens;
  }

  private evaluateWithoutPrecedence(tokens: string[]): number {
    let result = parseFloat(tokens[0]);
    let i = 1;

    while (i < tokens.length) {
      const operator = tokens[i];
      const nextNumber = parseFloat(tokens[i + 1]);

      switch (operator) {
        case '+':
          result += nextNumber;
          break;
        case '-':
          result -= nextNumber;
          break;
        case '*':
          result *= nextNumber;
          break;
        case '/':
          result /= nextNumber;
          break;
        default:
          throw new BadRequestException(ERROR_MESSAGES.INVALID_OPERATOR);
      }

      i += 2;
    }

    return result;
  }

  private evaluateWithPrecedence(tokens: string[]): number {
    const operators = [];
    const values = [];

    let i = 0;

    while (i < tokens.length) {
      const token = tokens[i];

      if (!isNaN(parseFloat(token))) {
        values.push(parseFloat(token));
      } else if (token === '*' || token === '/') {
        // Handle precedence for * and /
        const operator = token;
        i++;
        const nextValue = parseFloat(tokens[i]);
        const lastValue = values.pop();

        if (operator === '*') {
          values.push(lastValue * nextValue);
        } else if (operator === '/') {
          values.push(lastValue / nextValue);
        }
      } else if (token === '+' || token === '-') {
        // For + and -, just push the operator
        operators.push(token);
      } else {
        throw new BadRequestException('Invalid operator');
      }
      i++;
    }

    // Now process any remaining + or - operations
    let result = values[0];
    i = 1;

    while (i < values.length) {
      const operator = operators.shift();
      const nextValue = values[i];

      if (operator === '+') {
        result += nextValue;
      } else if (operator === '-') {
        result -= nextValue;
      }
      i++;
    }

    return result;
  }
  // Method to validate the input expression
  private isValidExpression(expression: string): boolean {
    // Check if the expression contains only valid characters (digits, operators, spaces)
    if (!/^[0-9+\-*/.\s]+$/.test(expression)) {
      return false;
    }

    // Check for invalid patterns, such as ending with an operator
    if (/[\+\-\*/]$/.test(expression)) {
      return false;
    }

    // Check for consecutive operators (e.g., 1++1)
    if (/[\+\-\*/]{2,}/.test(expression)) {
      return false;
    }

    return true;
  }
}

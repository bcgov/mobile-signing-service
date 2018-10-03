/**
 * https://gist.github.com/mweibel/5219403#file-strategy-mock-js
 */
"use strict";
  
import passport from 'passport';

class StrategyMockFn extends passport.Strategy {
  authenticate(req) {
    // auth pass all
  }
}

const StrategyMock = new StrategyMockFn();

StrategyMock.authenticate();

module.exports = StrategyMock;
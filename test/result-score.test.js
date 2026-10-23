import test from 'node:test';
import assert from 'node:assert/strict';
import {resultScore} from '../public/result-score.js';

test('resultado recuperado: diez incorrectas dan cero aunque la nota guardada sea ocho', () => {
  const details = Array.from({length:10}, () => ({isPerfect:false,reviewStatus:'incorrect'}));
  assert.equal(resultScore({score:8,correct:8,details}),0);
});

test('la nota solo cuenta preguntas completamente correctas, sin crédito parcial', () => {
  const details = [
    {isPerfect:true,reviewStatus:'correct'},
    {isPerfect:true,reviewStatus:'correct'},
    {isPerfect:false,reviewStatus:'partial'},
    ...Array.from({length:7}, () => ({isPerfect:false,reviewStatus:'incorrect'}))
  ];
  assert.equal(resultScore({score:80,correct:8,details}),2);
});

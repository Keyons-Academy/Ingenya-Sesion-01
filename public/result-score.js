// Los resultados antiguos pueden conservar una nota de otra escala en la sesión.
// El repaso es la fuente común para la nota y los indicadores de acierto.
export function resultScore(result) {
  if(result.scoringVersion===2) return result.details.reduce((sum,detail)=>sum+detail.points,0)/10;
  return result.details.filter(detail => detail.isPerfect === true).length;
}

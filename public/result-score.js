// Los resultados antiguos pueden conservar una nota de otra escala en la sesión.
// El repaso es la fuente común para la nota y los indicadores de acierto.
export function resultScore(result) {
  return result.details.filter(detail => detail.isPerfect === true).length;
}

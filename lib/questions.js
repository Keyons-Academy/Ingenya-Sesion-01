// Banco canónico de preguntas: SOLO SERVIDOR. Nunca se sirve en /public.
// Las respuestas correctas no se entregan al navegador antes de enviar el intento.
export const QUESTIONS = [
  {
    id: 1, category: 'Flujo de trabajo', type: 'order',
    question: 'Tiene una tarea nueva que desea trabajar con IA. ¿En qué orden debería realizar estas acciones?',
    instruction: 'Ordene los cuatro pasos, del primero al último.',
    steps: [
      'Entender el problema que necesita resolver.',
      'Definir qué debe entregar la IA y quién lo utilizará.',
      'Escribir el prompt.',
      'Revisar el resultado contra las fuentes.'
    ],
    explanation: 'Primero entendemos el problema, luego definimos el resultado, después redactamos el prompt y finalmente verificamos la respuesta.'
  },
  {
    id: 2, category: 'Problema y síntoma', type: 'single',
    question: 'Tiene una tarea relacionada con un proyecto atrasado, pero todavía no conoce las causas. ¿Qué debería hacer antes de solicitar ayuda a la IA?',
    instruction: 'Seleccione una sola opción.',
    options: [
      'Organizar las actividades atrasadas y pedir un nuevo cronograma.',
      'Identificar qué causa el atraso y qué resultado necesita conseguir.',
      'Preparar un informe del estado actual para identificar las prioridades.',
      'Definir el formato de entrega y solicitar recomendaciones.'
    ], correct: 1,
    explanation: 'Antes de pedir una solución, se identifica el problema real, no solamente el síntoma del atraso.'
  },
  {
    id: 3, category: 'Prompt completo', type: 'multi',
    question: 'Necesita mejorar este prompt: «Resuma el informe de avance para el cliente». ¿Qué información agregaría para obtener un resultado más útil?',
    instruction: 'Seleccione todas las opciones que correspondan. Puede haber más de una.',
    options: [
      'Los puntos que debe incluir y para qué utilizará el cliente el resumen.',
      'El formato y la extensión esperada.',
      'El procedimiento que debe seguir si encuentra información contradictoria.',
      'La instrucción de utilizar el modelo con mayor razonamiento disponible.',
      'Los criterios para determinar qué información es relevante.'
    ], correct: [0,1,2,4],
    explanation: 'Un prompt útil precisa propósito, contenido, formato, criterios y cómo tratar contradicciones; un modelo más potente no sustituye esas instrucciones.'
  },
  {
    id: 4, category: 'Prompt V1 y V2', type: 'single',
    question: 'En el caso práctico, el Prompt V1 generó una respuesta bien redactada, pero poco útil para preparar la entrega. ¿Qué explica mejor la diferencia con el Prompt V2?',
    instruction: 'Seleccione una sola opción.',
    options: [
      'El V2 especificó el resultado, las fuentes, los criterios y el formato esperado.',
      'El V2 permitió utilizar documentos más completos que los del V1.',
      'El V2 solicitó mayor detalle sin modificar el alcance de la tarea.',
      'El V2 utilizó un modelo diferente para analizar los documentos.'
    ], correct: 0,
    explanation: 'La mejora vino de la claridad y estructura del prompt, no de cambiar el modelo ni las fuentes.'
  },
  {
    id: 5, category: 'Datos faltantes', type: 'single',
    question: 'Necesita identificar quién confirma la entrega de un proyecto, pero ningún documento proporciona esa información. ¿Qué instrucción debería incluir en el prompt?',
    instruction: 'Seleccione una sola opción.',
    options: [
      '«Identifique al responsable más probable y señale que debe confirmarse».',
      '«Utilice el responsable que figure en documentos similares».',
      '«Si no existe evidencia, escriba “Por definir” y señale el dato faltante».',
      '«Priorice la información del documento más reciente».'
    ], correct: 2,
    explanation: 'Si falta evidencia, debe reconocerse el vacío y no presentar una suposición como dato confirmado.'
  },
  {
    id: 6, category: 'Plantillas del prompt', type: 'single',
    question: 'Una persona utiliza la plantilla de ocho componentes y otra la versión resumida de seis pasos. ¿Qué diferencia existe entre ambas?',
    instruction: 'Seleccione una sola opción.',
    options: [
      'La versión de ocho componentes se utiliza cuando la tarea necesita más razonamiento.',
      'La versión de seis pasos reorganiza los elementos esenciales en una estructura más compacta.',
      'La versión de ocho componentes necesita fuentes externas para funcionar correctamente.',
      'La versión de seis pasos elimina la necesidad de definir criterios de validación.'
    ], correct: 1,
    explanation: 'Ambas versiones permiten construir instrucciones completas; la de seis pasos agrupa los mismos elementos esenciales.'
  },
  {
    id: 7, category: 'Validación de fuentes', type: 'single',
    question: 'La IA entrega una tabla que cumple el formato solicitado, pero indica que el «Gerente técnico» aprueba una entrega. Esa responsabilidad no aparece en las fuentes. ¿Qué debería hacer?',
    instruction: 'Seleccione una sola opción.',
    options: [
      'Utilizar la tabla, aclarando que la responsabilidad podría cambiar.',
      'Pedir un nuevo análisis utilizando el mismo prompt y comparar resultados.',
      'Solicitar mayor razonamiento para comprobar si la responsabilidad es correcta.',
      'Marcar el dato como no confirmado y verificar los demás hallazgos contra las fuentes.'
    ], correct: 3,
    explanation: 'Cumplir el formato no garantiza que los datos sean correctos. Se deben contrastar contra la evidencia.'
  },
  {
    id: 8, category: 'Estado de la evidencia', type: 'single',
    question: 'Una solicitud propone mover la fecha de entrega del 29/05 al 02/06, pero todavía necesita aprobación. ¿Cuál es la conclusión respaldada por la evidencia?',
    instruction: 'Seleccione una sola opción.',
    options: [
      'La nueva fecha debe utilizarse como referencia provisional para todos los informes.',
      'El cambio fue solicitado, pero la fecha aprobada continúa vigente mientras no exista autorización.',
      'Ambas fechas tienen la misma validez hasta que el proyecto finalice.',
      'El cambio puede considerarse aprobado si la solicitud proviene del responsable técnico.'
    ], correct: 1,
    explanation: 'Una propuesta de cambio no equivale a una aprobación; se mantiene la fecha confirmada hasta contar con autorización.'
  },
  {
    id: 9, category: 'Elección de entornos', type: 'match',
    question: 'Seleccione la herramienta más adecuada para cada necesidad de trabajo.',
    instruction: 'Elija una herramienta para cada situación. Use cada herramienta una sola vez.',
    choices: ['Chat', 'Proyecto', 'Gemini Notebook', 'Deep Research'],
    rows: [
      {text:'Corregir el tono de un correo puntual.', answer:0},
      {text:'Trabajar varias semanas con archivos e instrucciones del mismo proyecto.', answer:1},
      {text:'Consultar un reglamento cargado y obtener respuestas con citas de sus documentos.', answer:2},
      {text:'Investigar y contrastar requisitos vigentes en fuentes públicas.', answer:3}
    ],
    explanation: 'Chat resuelve consultas puntuales; Proyecto mantiene contexto; Gemini Notebook trabaja con fuentes elegidas; Deep Research investiga fuentes públicas.'
  },
  {
    id: 10, category: 'Modelo, fuentes y validación', type: 'multi',
    question: 'Necesita comparar cinco documentos técnicos, detectar contradicciones y preparar conclusiones respaldadas. ¿Qué decisiones ayudarían a obtener un resultado confiable?',
    instruction: 'Seleccione todas las opciones que correspondan. Puede haber más de una.',
    options: [
      'Utilizar un modelo capaz, con razonamiento suficiente para analizar relaciones y conflictos.',
      'Definir las fuentes autorizadas y exigir referencias para los hallazgos.',
      'Utilizar Deep Research obligatoriamente, aunque toda la información esté en los documentos disponibles.',
      'Solicitar que identifique contradicciones y datos pendientes de confirmación.',
      'Revisar las conclusiones importantes contra los documentos originales.'
    ], correct: [0,1,3,4],
    explanation: 'Una investigación fiable combina un modelo adecuado, fuentes autorizadas, criterios de validación y revisión humana.'
  }
];

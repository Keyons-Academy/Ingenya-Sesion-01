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
    explanation: 'La secuencia esperada para este ejercicio es: entender el problema, definir qué se necesita entregar y para quién, escribir el prompt y contrastar la respuesta con las fuentes. Así, el prompt responde a una necesidad concreta y la revisión comprueba si el resultado está respaldado. En la práctica puede ser necesario volver a pasos anteriores y ajustar las instrucciones.'
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
    optionFeedback: [
      'Un nuevo cronograma puede ser útil, pero proponerlo sin investigar las causas puede mantener el problema que produjo el atraso.',
      'Identificar las causas y el resultado necesario permite orientar la ayuda de la IA hacia el problema real.',
      'Un informe de estado puede ayudar a investigar, pero identificar prioridades no sustituye aclarar las causas del atraso y el resultado que se busca.',
      'El formato define cómo presentar la respuesta, pero todavía falta precisar qué problema debe resolver.'
    ],
    explanation: 'El atraso es un síntoma: puede deberse a dependencias, falta de recursos o decisiones pendientes. Antes de solicitar una solución, hay que investigar las causas con la información disponible y definir el resultado buscado. Si aún no se conocen, la IA puede ayudar a formular preguntas para investigarlas; no debe inventarlas.'
  },
  {
    id: 3, category: 'Prompt completo', type: 'multi',
    question: 'Necesita mejorar este prompt: «Resuma el informe de avance para el cliente». ¿Qué información agregaría para obtener un resultado más útil?',
    instruction: 'Seleccione las cuatro opciones correctas.',
    options: [
      'Los puntos que debe incluir y para qué utilizará el cliente el resumen.',
      'El formato y la extensión esperada.',
      'El procedimiento que debe seguir si encuentra información contradictoria.',
      'La instrucción de utilizar el modelo con mayor razonamiento disponible.',
      'Los criterios para determinar qué información es relevante.'
    ], correct: [0,1,2,4],
    explanation: 'Las cuatro opciones correctas aclaran qué debe contener el resumen, para qué lo usará el cliente, su formato y extensión, qué información priorizar y cómo señalar contradicciones. Pedir el modelo con mayor razonamiento disponible no aporta esos requisitos: un modelo adecuado puede ayudar, pero no sustituye instrucciones claras ni garantiza por sí solo un resumen útil.'
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
    optionFeedback: [
      'Precisar el resultado, las fuentes, los criterios y el formato orienta la respuesta hacia la entrega que se necesita.',
      'La diferencia que evalúa este caso está en las instrucciones del prompt; cambiar los documentos sería una modificación distinta.',
      'Pedir más detalle puede alargar la respuesta sin aclarar qué debe entregar ni cómo verificarlo.',
      'Cambiar el modelo no describe la mejora de instrucciones que evalúa la comparación entre V1 y V2.'
    ],
    explanation: 'En la comparación del taller, la respuesta esperada atribuye la mejora a explicitar el resultado, las fuentes, los criterios y el formato. Una respuesta bien redactada puede seguir siendo poco útil si no cumple esos requisitos. Pedir más detalle o cambiar de modelo no reemplaza definirlos.'
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
    optionFeedback: [
      'Aunque se marque como pendiente de confirmación, elegir a una persona probable agrega una atribución que los documentos no respaldan. Aquí se pide reconocer el dato faltante.',
      'Un responsable mencionado en otro proyecto no demuestra quién tiene esa función en este proyecto.',
      'Indicar «Por definir» hace visible el dato faltante sin inventar un responsable.',
      'La fecha de un documento no resuelve la ausencia del dato: el enunciado indica que ninguno identifica al responsable.'
    ],
    explanation: 'Si ningún documento identifica quién confirma la entrega, la respuesta respaldada es «Por definir» y debe indicarse qué información falta. Después se consulta a una persona autorizada. Un responsable probable, un proyecto similar o un documento reciente no constituyen evidencia de esa asignación.'
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
    optionFeedback: [
      'El número de componentes de una plantilla no determina la capacidad de razonamiento que necesita la tarea.',
      'La versión resumida agrupa los elementos esenciales para expresarlos de forma más compacta.',
      'Usar una plantilla de ocho componentes no obliga por sí mismo a consultar fuentes externas; eso depende de la tarea.',
      'Resumir la plantilla no elimina la necesidad de definir cómo comprobar que la respuesta cumple lo solicitado.'
    ],
    explanation: 'Según las plantillas comparadas en el taller, la versión de seis pasos agrupa los elementos esenciales de la de ocho componentes. La diferencia es de organización, no de capacidad del modelo ni de obligación de buscar en Internet. En ambas se necesita aclarar la tarea y cómo validar el resultado; contar más componentes no garantiza un mejor prompt.'
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
    optionFeedback: [
      'Decir que la responsabilidad podría cambiar no aclara el problema: actualmente no hay evidencia de que esa persona tenga la función.',
      'Dos respuestas generadas pueden repetir la misma atribución sin respaldo. Compararlas no sustituye consultar las fuentes.',
      'Un razonamiento más extenso puede repetir una suposición. Se necesita evidencia de la responsabilidad asignada.',
      'Marcar el dato como no confirmado y contrastar los demás hallazgos evita presentar una atribución sin evidencia como un hecho.'
    ],
    explanation: 'La tabla puede cumplir el formato y contener un dato sin respaldo. Hay que marcar la responsabilidad como no confirmada, pedir evidencia o confirmación autorizada y comprobar los demás hallazgos. Repetir el análisis o pedir más razonamiento no convierte una suposición en evidencia.'
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
    optionFeedback: [
      'La fecha propuesta puede registrarse como escenario pendiente, pero no debe sustituir la fecha aprobada en todos los informes.',
      'La solicitud documenta una propuesta; mientras no se apruebe, sigue vigente la fecha previamente autorizada.',
      'Las fechas tienen estados distintos: una está aprobada y la otra está propuesta. No son intercambiables.',
      'Que la solicitud provenga del responsable técnico no demuestra su aprobación; el enunciado indica que aún necesita autorización.'
    ],
    explanation: 'El 29/05 sigue siendo la fecha aprobada; el 02/06 es una propuesta pendiente. Se pueden informar ambas con su estado claramente identificado, pero no presentar la fecha propuesta como autorizada. La solicitud y la aprobación son evidencias distintas.'
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
    explanation: 'Para este ejercicio, Chat se asocia con una consulta puntual; Proyecto, con organizar archivos e instrucciones de trabajo continuado; Gemini Notebook, con consultar fuentes cargadas y rastrear citas; y Deep Research, con investigar y contrastar fuentes públicas. Son elecciones según el uso principal, no capacidades exclusivas: otras herramientas también pueden trabajar con archivos o buscar información. Las citas y conclusiones importantes siempre deben verificarse.'
  },
  {
    id: 10, category: 'Modelo, fuentes y validación', type: 'multi',
    question: 'Necesita comparar cinco documentos técnicos, detectar contradicciones y preparar conclusiones respaldadas. ¿Qué decisiones ayudarían a obtener un resultado confiable?',
    instruction: 'Seleccione las cuatro opciones correctas.',
    options: [
      'Utilizar un modelo capaz, con razonamiento suficiente para analizar relaciones y conflictos.',
      'Definir las fuentes autorizadas y exigir referencias para los hallazgos.',
      'Utilizar Deep Research obligatoriamente, aunque toda la información esté en los documentos disponibles.',
      'Solicitar que identifique contradicciones y datos pendientes de confirmación.',
      'Revisar las conclusiones importantes contra los documentos originales.'
    ], correct: [0,1,3,4],
    explanation: 'Las cuatro decisiones correctas combinan un modelo adecuado para la complejidad, fuentes autorizadas con referencias, identificación explícita de contradicciones y revisión de las conclusiones contra los originales. Deep Research puede ser útil, incluso con archivos, pero no es obligatorio si los cinco documentos ya contienen la evidencia necesaria. Ni la herramienta ni un mayor razonamiento garantizan por sí solos conclusiones correctas.'
  }
];

// Clave solo en el servidor.
export const QUESTIONS = [
  {
    "id": 1,
    "category": "Definición del problema",
    "question": "Tiene una tarea que desea resolver con IA, pero todavía no tiene claro qué necesita obtener. ¿Cuál es el mejor punto de partida?",
    "options": [
      "Describir las actividades que normalmente realiza para completar la tarea.",
      "Identificar el problema, para quién se necesita y qué resultado sería útil.",
      "Seleccionar la herramienta de IA según el tipo de documento disponible.",
      "Preparar una primera instrucción y ajustar el objetivo según la respuesta."
    ],
    "correct": 1,
    "explanation": "Antes de formular el prompt, se debe comprender el problema, el destinatario y el resultado esperado."
  },
  {
    "id": 2,
    "category": "Problema vs. síntoma",
    "question": "Un proyecto presenta atrasos y se quiere utilizar IA para ayudar a resolverlos. ¿Qué información permite distinguir el problema de sus síntomas?",
    "options": [
      "La cantidad de actividades atrasadas y sus fechas de entrega.",
      "El tiempo que lleva acumulado el proyecto respecto al cronograma.",
      "Los informes disponibles y el formato en que se presentarán.",
      "Las causas del atraso y los factores que impiden cumplir el objetivo."
    ],
    "correct": 3,
    "explanation": "Un atraso es una manifestación del problema; identificar sus causas permite trabajar sobre lo que realmente debe resolverse."
  },
  {
    "id": 3,
    "category": "Componentes del prompt",
    "question": "Al construir un prompt, ¿qué diferencia existe entre el objetivo y la tarea?",
    "options": [
      "El objetivo define el resultado y su propósito; la tarea indica qué debe hacer la IA.",
      "El objetivo establece las fuentes; la tarea determina las restricciones.",
      "El objetivo describe los pasos; la tarea establece cómo verificar las fuentes.",
      "El objetivo define el formato; la tarea identifica al destinatario."
    ],
    "correct": 0,
    "explanation": "El objetivo explica qué se necesita y para quién; la tarea define acciones concretas como comparar, clasificar o redactar."
  },
  {
    "id": 4,
    "category": "Mejora del prompt",
    "question": "Le pide a la IA analizar varios documentos. La información obtenida es útil, pero el resultado no permite identificar fácilmente los pendientes. ¿Qué mejora sería más apropiada?",
    "options": [
      "Agregar contexto sobre el proyecto y sus antecedentes.",
      "Solicitar un análisis más detallado de cada documento.",
      "Definir una tabla con pendientes, responsables, estado y fuente.",
      "Cambiar el nivel de razonamiento antes de modificar la instrucción."
    ],
    "correct": 2,
    "explanation": "Cuando falta estructura en la entrega, conviene precisar el formato de salida y los campos necesarios."
  },
  {
    "id": 5,
    "category": "Vacíos y conflictos",
    "question": "Dos documentos autorizados muestran fechas distintas para un mismo hito y ninguno aclara cuál está aprobada. ¿Qué debería indicar el prompt?",
    "options": [
      "Utilizar la fecha del documento más reciente como referencia principal.",
      "Reportar la contradicción y dejar la fecha pendiente de confirmación.",
      "Presentar ambas fechas y calcular una fecha intermedia provisional.",
      "Utilizar la fecha del documento más detallado y señalar su origen."
    ],
    "correct": 1,
    "explanation": "Si no existe evidencia suficiente para resolver una contradicción, debe señalarse sin convertir una suposición en un hecho."
  },
  {
    "id": 6,
    "category": "Calidad de la información",
    "question": "La IA indica: «Si la consulta técnica sigue pendiente, podría retrasarse la entrega». ¿Cómo debe clasificarse esta afirmación?",
    "options": [
      "Como una inferencia basada en una posible consecuencia.",
      "Como un hecho respaldado por el estado actual del proyecto.",
      "Como una recomendación de modificar el cronograma.",
      "Como un dato no confirmado sobre una aprobación pendiente."
    ],
    "correct": 0,
    "explanation": "La afirmación plantea una consecuencia posible; no demuestra que el retraso vaya a ocurrir."
  },
  {
    "id": 7,
    "category": "Validación del resultado",
    "question": "La IA entrega un informe con el formato solicitado y conclusiones coherentes. Antes de utilizarlo, ¿qué revisión es fundamental?",
    "options": [
      "Comprobar que el nivel de detalle sea suficiente para el destinatario.",
      "Revisar que las conclusiones estén redactadas con claridad.",
      "Confirmar que todas las secciones mantengan un estilo uniforme.",
      "Contrastar las afirmaciones relevantes con las fuentes utilizadas."
    ],
    "correct": 3,
    "explanation": "Una respuesta puede estar bien redactada y cumplir el formato, pero contener afirmaciones que no coinciden con la evidencia."
  },
  {
    "id": 8,
    "category": "Modelo y razonamiento",
    "question": "¿Cuál es la diferencia principal entre seleccionar un modelo de IA y ajustar su nivel de razonamiento?",
    "options": [
      "El modelo determina el formato; el razonamiento determina las fuentes disponibles.",
      "El modelo determina la velocidad; el razonamiento determina la confidencialidad.",
      "El modelo determina sus capacidades; el razonamiento regula el esfuerzo de análisis.",
      "El modelo determina las instrucciones; el razonamiento establece el objetivo de la tarea."
    ],
    "correct": 2,
    "explanation": "Elegir un modelo y ajustar su esfuerzo son decisiones diferentes; ambas deben responder a la dificultad de la tarea."
  },
  {
    "id": 9,
    "category": "Selección de herramientas",
    "question": "Necesita investigar requisitos regulatorios vigentes, comparar varias fuentes públicas y elaborar un informe con referencias. ¿Qué herramienta resulta más apropiada?",
    "options": [
      "Deep Research, para realizar una investigación multifuente con referencias.",
      "Un proyecto, para conservar las instrucciones durante varias conversaciones.",
      "Un chat convencional, para obtener una síntesis con el conocimiento del modelo.",
      "Un cuaderno de fuentes, limitado a documentos internos previamente cargados."
    ],
    "correct": 0,
    "explanation": "Deep Research está orientado a investigaciones que requieren buscar, contrastar y referenciar múltiples fuentes externas."
  },
  {
    "id": 10,
    "category": "Trabajo continuo con IA",
    "question": "Durante varias semanas trabajará con la IA sobre un mismo proyecto, utilizando archivos e instrucciones que deben mantenerse disponibles. ¿Qué entorno conviene elegir?",
    "options": [
      "Un chat independiente para cada actividad del proyecto.",
      "Un proyecto que reúna las conversaciones, archivos e instrucciones.",
      "Una investigación profunda nueva para cada consulta.",
      "Un chat con razonamiento alto para conservar los antecedentes."
    ],
    "correct": 1,
    "explanation": "Un proyecto permite mantener organizados archivos, instrucciones y conversaciones asociadas a un trabajo continuo."
  }
];
export const publicQuestions = () => QUESTIONS.map(({id,category,question,options})=>({id,category,question,options}));

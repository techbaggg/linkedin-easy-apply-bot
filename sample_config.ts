export default {
  // LOGIN DETAILS
  // Keep credentials local only. Do not commit them.
  LINKEDIN_EMAIL: "",
  LINKEDIN_PASSWORD: "",

  // JOB SEARCH PARAMETERS
  // Broad search covering the user's documented AI, language, transcription,
  // coding/technical, data, QA and research experience.
  KEYWORDS: "AI OR "artificial intelligence" OR "AI evaluator" OR "AI trainer" OR "LLM" OR "AI data" OR "data annotation" OR "AI coding" OR "code evaluator" OR "software QA" OR "search quality" OR "ads quality" OR translation OR translator OR MTPE OR localization OR transcription OR "language specialist" OR "language QA" OR "data analyst" OR "data quality" OR "patent research" OR "technical research" OR "content QA"",
  LOCATION: "India",
  WORKPLACE: {
    REMOTE: true,
    ON_SITE: true,
    HYBRID: true,
  },

  // Match a wide range of roles supported by the resume.
  JOB_TITLE: ".*",
  JOB_DESCRIPTION: "^((?!(senior executive only|commission only|unpaid internship)).*)$",
  JOB_DESCRIPTION_LANGUAGES: ["any"],

  // FORM DATA
  PHONE: "+91-8446411131",
  CV_PATH: "",
  COVER_LETTER_PATH: "",
  HOME_CITY: "Nashik, Maharashtra, India",

  // Only use values that are supported by the resume. These are intended
  // for common Easy Apply questions; unknown questions should remain for review.
  YEARS_OF_EXPERIENCE: {
    "AI": 3,
    "artificial intelligence": 3,
    "LLM": 3,
    "AI evaluation": 3,
    "prompt evaluation": 3,
    "data annotation": 7,
    "data validation": 7,
    "translation": 7,
    "MTPE": 7,
    "localization": 7,
    "transcription": 7,
    "QA": 20,
    "quality assurance": 20,
    "patent research": 3,
    "technical research": 3,
    "Python": 3,
    "JSON": 3,
    "YAML": 3,
    "Docker": 3,
    "GitHub": 3,
    "HTML": 10,
    "CSS": 10,
    "PHP": 10,
    "Java": 10,
    "C++": 10,
    "WordPress": 10
  },

  LANGUAGE_PROFICIENCY: {
    "english": "fluent",
    "hindi": "fluent",
    "marathi": "fluent",
    "punjabi": "conversational"
  },

  REQUIRES_VISA_SPONSORSHIP: false,

  // No salary limitation: do not pre-fill or reject jobs based on salary.
  // Salary questions should be left for human review when required.
  TEXT_FIELDS: {},

  BOOLEANS: {
    "bachelor|bachelors|bachelor's|degree": true,
    "authorized|work authorization|legally authorized": true
  },

  MULTIPLE_CHOICE_FIELDS: {},

  // Search across LinkedIn's Easy Apply results rather than a single page.
  SINGLE_PAGE: false,
}

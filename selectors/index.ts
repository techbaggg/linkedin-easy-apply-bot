export default {
  // Job search
  keywordInput: 'input[id*="jobs-search-box-keyword-id"], input[aria-label*="Search by title"], input[placeholder*="Search by title"]',
  locationInput: 'input[id*="jobs-search-box-location-id"], input[aria-label*="City, state, or zip code"], input[placeholder*="City, state, or zip code"]',
  searchSubmit: 'button.jobs-search-box__submit-button, button[aria-label*="Search"]',

  // Job listing / detail
  searchResultList: ".jobs-search-results-list",
  searchResultListText: "small.jobs-search-results-list__text, .jobs-search-results-list__text",
  searchResultListItem: ".jobs-search-results-list li.jobs-search-results__list-item, li.jobs-search-results__list-item",
  searchResultListItemLink: "a.job-card-list__title, a[href*='/jobs/view/']",
  searchResultListItemCompanyName: "div.job-card-container__company-name, a.job-card-container__company-name, .artdeco-entity-lockup__subtitle",
  jobDescription: "div.jobs-description-content, div.jobs-box__html-content, .jobs-description__content",
  appliedToJobFeedback: ".artdeco-inline-feedback, [data-test-job-details-applied-message]",

  // Easy Apply
  easyApplyButtonEnabled: "button.jobs-apply-button:enabled, button[aria-label*='Easy Apply']:enabled, button[aria-label*='Apply']:enabled",
  modal: ".jobs-easy-apply-modal, div[role='dialog']",
  checkbox: ".jobs-easy-apply-modal input[type='checkbox'], div[role='dialog'] input[type='checkbox']",
  fieldset: ".jobs-easy-apply-modal fieldset, div[role='dialog'] fieldset",
  select: ".jobs-easy-apply-modal select, div[role='dialog'] select",
  nextButton: ".jobs-easy-apply-modal footer button[aria-label*='next'], .jobs-easy-apply-modal footer button[aria-label*='Review'], div[role='dialog'] footer button[aria-label*='next'], div[role='dialog'] footer button[aria-label*='Review']",
  submit: ".jobs-easy-apply-modal footer button[aria-label*='Submit'], div[role='dialog'] footer button[aria-label*='Submit']",
  enabledSubmitOrNextButton: ".jobs-easy-apply-modal footer button:enabled, div[role='dialog'] footer button:enabled",
  textInput: ".jobs-easy-apply-modal input[type='text'], .jobs-easy-apply-modal textarea, div[role='dialog'] input[type='text'], div[role='dialog'] textarea",
  homeCity: ".jobs-easy-apply-modal input[id*='easyApplyFormElement'][id*='city-HOME-CITY'], div[role='dialog'] input[id*='city-HOME-CITY']",
  phone: ".jobs-easy-apply-modal input[id*='easyApplyFormElement'][id*='phoneNumber'], div[role='dialog'] input[id*='phoneNumber']",
  documentUpload: ".jobs-easy-apply-modal div[class*='jobs-document-upload'], div[role='dialog'] div[class*='jobs-document-upload']",
  documentUploadLabel: "label[class*='jobs-document-upload']",
  documentUploadInput: "input[type='file'][id*='jobs-document-upload'], div[role='dialog'] input[type='file']",
  radioInput: "input[type='radio']",
  option: "option",
  followCompanyCheckbox: 'input[type="checkbox"]#follow-company-checkbox',

  // Login / challenge detection
  captcha: "#captcha-internal, iframe[title*='captcha' i], [id*='captcha' i]",
  emailInput: "input#username, input[name='session_key'], input[type='email'][autocomplete='username']",
  passwordInput: "input#password, input[name='session_password'], input[type='password'][autocomplete='current-password']",
  loginSubmit: "button.btn__primary--large.from__button--floating, button[type='submit']",
  skipButton: "button[aria-label='Skip'], button",

  // Challenge / verification indicators
  challenge: "input[name='pin'], input[name='verificationCode'], [id*='challenge' i], [class*='challenge' i], [id*='checkpoint' i], [class*='checkpoint' i]"
};

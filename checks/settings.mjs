// checks/settings.mjs — the shared settings the app may ask to change, and their values: used by checks/validate.js and
// the settings-requests Action. Keep in step with the app's managers/studio/settings.js.
export const SETTINGS = {
  "library.review": { about: "Quick review of Library proposals", options: { off: "Never: proposals go without a review", unsure: "Only when the app is unsure (a possible duplicate, no description, odd limits)", always: "For every proposal" } },
  "models.quick": { about: "Model for quick work", model: true },
  "models.default": { about: "Model for most work", model: true },
  "models.complex": { about: "Model for complex work", model: true },
};
/** What is wrong with this value for this setting, if anything. @param {string} path @param {any} value */
export function settingProblem(path, value) {
  const s = Object.prototype.hasOwnProperty.call(SETTINGS, path) ? SETTINGS[path] : null;
  if (!s) return `${path} is not a setting the app can change (it can change ${Object.keys(SETTINGS).join(", ")})`;
  if (s.options && !Object.prototype.hasOwnProperty.call(s.options, value)) return `${path} must be one of ${Object.keys(s.options).join(", ")}`;
  if (s.model && !/^[a-z0-9][a-z0-9.-]{1,63}$/.test(String(value || ""))) return `${path} must be a model name, like sonnet`;
  return null;
}

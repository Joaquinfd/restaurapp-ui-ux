import { esES } from "@clerk/localizations";

/**
 * Clerk's es-ES strings use "usted"; the app speaks "tú". Overrides cover the
 * sign-in / sign-up forms, plus the sign-up password placeholder that es-ES
 * leaves untranslated (it fell back to English).
 */
export const clerkLocalization = {
  ...esES,
  formFieldInputPlaceholder__emailAddress: "Ingresa tu correo electrónico",
  formFieldInputPlaceholder__password: "Ingresa tu contraseña",
  formFieldInputPlaceholder__signUpPassword: "Crea una contraseña",
  signIn: {
    ...esES.signIn,
    start: {
      ...esES.signIn?.start,
      actionLink: "Regístrate",
    },
  },
};

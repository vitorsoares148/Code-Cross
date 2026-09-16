export const ERROR_FORM = {
  NONE: 0,
  INVALID_NUM: 1,
  INVALID_SPACE: 2,
  INVALID: 3,
  REQUIRED: 4,
  VALID: 5,
  TOO_MANY_LOGIN_ATTEMPTS: 6,
  TOO_MANY_REGISTERS: 7,
  NOTHING: 8,
};

export const nameFormErrorMessages = {
  [ERROR_FORM.INVALID_NUM]:
    "O nome de usuário deve ter entre 4 e 32 caracteres.",

  [ERROR_FORM.INVALID_SPACE]:
    "O nome de usuário não pode conter espaços ou caracteres especiais.",

  [ERROR_FORM.INVALID]: "Este nome de usuário já está em uso.",

  [ERROR_FORM.REQUIRED]: "Campo obrigatório.",

  [ERROR_FORM.NOTHING]: "",
};

export const emailFormErrorMessages = {
  [ERROR_FORM.INVALID_NUM]: "Digite um e-mail válido.",

  [ERROR_FORM.INVALID]: "Já existe uma conta cadastrada com este e-mail.",

  [ERROR_FORM.REQUIRED]: "Campo obrigatório.",

  [ERROR_FORM.NOTHING]: "",
};

export const passwordFormErrorMessages = {
  [ERROR_FORM.INVALID_NUM]: "A senha deve ter entre 8 e 32 caracteres.",

  [ERROR_FORM.INVALID_SPACE]: "A senha não pode conter espaços.",

  [ERROR_FORM.REQUIRED]: "Campo obrigatório.",

  [ERROR_FORM.INVALID]: "Nome de usuário ou senha incorretos.",

  [ERROR_FORM.TOO_MANY_LOGIN_ATTEMPTS]:
    "Muitas tentativas de login. Tente novamente mais tarde.",

  [ERROR_FORM.TOO_MANY_REGISTERS]:
    "Muitas contas foram registradas. Tente novamente mais tarde.",
};

export function validateName(value: string) {
  if (value.length === 0) {
    return ERROR_FORM.NONE;
  }

  if (value.length < 4 || value.length > 32) {
    return ERROR_FORM.INVALID_NUM;
  }

  if (/[^a-zA-Z0-9]/.test(value)) {
    return ERROR_FORM.INVALID_SPACE;
  }

  return ERROR_FORM.VALID;
}

export function validatePassword(value: string) {
  if (value.length === 0) {
    return ERROR_FORM.NONE;
  }

  if (value.length < 8 || value.length > 32) {
    return ERROR_FORM.INVALID_NUM;
  }

  if (value.includes(" ")) {
    return ERROR_FORM.INVALID_SPACE;
  }

  return ERROR_FORM.VALID;
}

export function validateEmail(value: string) {
  if (value.length === 0) {
    return ERROR_FORM.NONE;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(value) ? ERROR_FORM.VALID : ERROR_FORM.INVALID_NUM;
}

export function hasError(error: number) {
  return error !== ERROR_FORM.NONE && error !== ERROR_FORM.VALID;
}

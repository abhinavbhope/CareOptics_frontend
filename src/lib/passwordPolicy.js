// lib/passwordPolicy.js
export const STRONG_PASSWORD =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const PASSWORD_HELP =
  "≥ 8 characters, 1 uppercase, 1 lowercase, 1 number & 1 special (@$!%*?&)";

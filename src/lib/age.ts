/** Completed years. Age moves forward on the birthday, so 20 becomes 21 without asking again. */
export function ageFromBirthday(birthday: string, today = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) return null;
  const [year, month, day] = birthday.split("-").map(Number);
  const born = new Date(year, month - 1, day);
  if (born.getFullYear() !== year || born.getMonth() !== month - 1 || born.getDate() !== day) return null;
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (born > now) return null;
  let age = now.getFullYear() - year;
  const hadBirthday = now.getMonth() > born.getMonth() || (now.getMonth() === born.getMonth() && now.getDate() >= born.getDate());
  if (!hadBirthday) age -= 1;
  if (age < 0 || age > 120) return null;
  return age;
}

export const MIN_SIGNUP_AGE = 16;

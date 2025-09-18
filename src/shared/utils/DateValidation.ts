export function validateDateFormat(date: string): void {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD`);
  }
  
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid date: ${date}`);
  }
}

export function validateISODateTimeFormat(date: string): void {
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  if (!isoRegex.test(date)) {
    throw new Error(`Invalid ISO format: ${date}. Expected format: YYYY-MM-DDTHH:mm:ss.sssZ`);
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid date: ${date}`);
  }
}
import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    return format(date, 'MMMM d, yyyy');
  } catch {
    return dateString;
  }
};

export const formatDateShort = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateString;
  }
};

export const formatTime = (timeString: string): string => {
  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, 'h:mm a');
  } catch {
    return timeString;
  }
};

export const formatDateTime = (dateString: string, timeString: string): string => {
  return `${formatDateShort(dateString)} at ${formatTime(timeString)}`;
};

export const getToday = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const getTomorrow = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return format(tomorrow, 'yyyy-MM-dd');
};

export const getNextWeek = (): string => {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  return format(nextWeek, 'yyyy-MM-dd');
};

export const isFriday = (dateString: string): boolean => {
  try {
    const date = parseISO(dateString);
    return date.getDay() === 5;
  } catch {
    return false;
  }
};

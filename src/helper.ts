export const formatTicketDateTime = (dateString: Date | string) => {
  if (!dateString || dateString === '-') {
    return { date: '-', time: '-' };
  }

  const dateObj = new Date(dateString);

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(dateObj);

  const formattedTime = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(dateObj)
    .replace('.', ':');

  return {
    date: formattedDate,
    time: `${formattedTime}`,
  };
};

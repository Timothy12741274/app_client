export const getDataString = () => {
    const now = new Date();

    const formatter = new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    const formattedDateTime = formatter.format(now);

    return formattedDateTime;
}
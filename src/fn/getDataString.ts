export const getDataString = () => {
/*    const now = new Date();

    console.log(now)

    const formatter = new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    const formattedDateTime = formatter.format(now);

    const [month, day, year, time] = formattedDateTime.split(/\/|,|\s|:/);

    // Собрать строку даты с днем и месяцем, поменятыми местами
    const formattedDateSwapped = `${day}/${month}/${year}, ${time}`;

    console.log(formattedDateTime, formattedDateSwapped)

    return formattedDateSwapped;*/

    const now = new Date();

    // Поменять местами месяц и день
    const day = now.getDate();
    const month = now.getMonth() + 1; // Месяцы в JavaScript считаются с 0, поэтому добавляем 1

    // Форматирование дня и месяца в двузначный вид с добавлением ведущих нулей
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const formattedMonth = month < 10 ? `0${month}` : `${month}`;

    // Получить год, часы, минуты и секунды
    const year = now.getFullYear();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Форматирование времени
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    // Собрать строку даты
    const formattedDateTime = `${year}-${formattedMonth}-${formattedDay} ${hours}:${minutes}:${seconds}`;
    // const formattedDateTime = `${formattedDay}/${formattedMonth}/${year}, ${formattedTime}`;

    return formattedDateTime;
}
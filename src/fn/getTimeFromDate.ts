export const getTimeFromDate = (date) =>  {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Форматирование часов и минут в двузначный вид с ведущими нулями
    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

    return `${formattedHours}:${formattedMinutes}`;
}
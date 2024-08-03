/* eslint-disable no-useless-escape */

export const textFilter = (text: string): string => {
  // Регулярное выражение для удаления некорректных символов
  const invalidCharactersRegex = /[^\w\sа-яА-Я.,:;!?'"()\[\]{}<>-]/iu;

  // Регулярное выражение для замены двойных тире на одиночные тире
  const doubleHyphensRegex = /-+/g;

  // Регулярное выражение для замены двойных пробелов и табуляций на одиночные пробелы
  const doubleSpacesAndTabsRegex = /[\s\t]+/iu;

  // Регулярное выражение для замены двойных переносов строк на один перенос строки
  const doubleLineBreaksRegex = /(\r?\n){2,}/iu;

  // Регулярное выражение для удаления пробелов, переносов строки или табуляций в начале текста
  const startsWithSpaceRegex = /^[\s\t\n]+/iu;

  // Удаление некорректных символов
  const filteredText1 = text.replace(invalidCharactersRegex, '');
  //console.log(filteredText1);

  // Замена двойных тире на одиночные тире
  const filteredText2 = filteredText1.replace(doubleHyphensRegex, '-');

  // Замена двойных пробелов и табуляций на одиночные пробелы
  const filteredText3 = filteredText2.replace(doubleSpacesAndTabsRegex, ' ');

  // Замена двойных переносов строк на один перенос строки
  const filteredText4 = filteredText3.replace(doubleLineBreaksRegex, '\n');

  // Удаление пробелов, переносов строки или табуляций в начале текста
  const filteredText5 = filteredText4.replace(startsWithSpaceRegex, '');

  return filteredText5;
};

import Chance from 'chance';

const chance = new Chance();

const generateRandomChance = (chances => () => {
  const index = chance.integer({ min: 0, max: (chances.length - 1) / 2 });
  return `${chances[index].call(chance)}`;
})([
  chance.word,
  chance.sentence,
  chance.url,
  chance.birthday,
  chance.avatar,
  chance.address,
]);

export const generateRandomHTML = () =>
  `<ul>${Array.from({ length: 5 }).reduce(
    html =>
      html +
      `<li>${Array.from({ length: 5 }).reduce(
        html =>
          (html += `<span style="font-size: ${chance.integer({
            min: 7,
            max: 30,
          })}px;">${generateRandomChance()
            .split('')
            .slice(0, 10)
            .join('')}</span>`),
        '',
      )}</li>`,
    '',
  )}</ul>
  ${Array.from({ length: 1 }).reduce(
    html =>
      html +
      `<p>${Array.from({ length: 15 }).reduce(html => {
        let randomChanceContent = generateRandomChance().split('');
        while (randomChanceContent.length > 10) {
          const offset = chance.integer({
            min: 0,
            max: (randomChanceContent.length - 1) / 2,
          });
          const fontSize = chance.integer({ min: 7, max: 30 });
          html += `<span style="font-size: ${fontSize}px;">${randomChanceContent
            .splice(0, offset)
            .join('')}</span>`;
        }
        return html + randomChanceContent.join('');
      }, '')}</p>`,
    '',
  )}`;

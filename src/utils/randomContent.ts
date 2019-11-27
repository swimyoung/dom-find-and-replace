import Chance from 'chance';

const chance = new Chance();
const chances = [
  chance.word,
  chance.sentence,
  chance.url,
  chance.birthday,
  chance.avatar,
  chance.address,
];

function makeRandomContent(): string {
  const index = chance.integer({ min: 0, max: (chances.length - 1) / 2 });
  return `${chances[index].call(chance)}`;
}

function makeRandomHTML(): string {
  return `<ul>${Array.from({ length: 5 }).reduce(
    html =>
      html +
      `<li>${Array.from({ length: 5 }).reduce(
        html =>
          (html += `<span style="font-size: ${chance.integer({
            min: 7,
            max: 30,
          })}px;">${makeRandomContent()
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
        const randomChanceContent = makeRandomContent().split('');
        while (randomChanceContent.length > 10) {
          const offset = chance.integer({
            min: 0,
            max: (randomChanceContent.length - 1) / 2,
          });
          const fontSize = chance.integer({ min: 7, max: 30 });
          const withAnchor = chance.integer({ min: 0, max: 10 }) === 1;
          let content = `<span style="font-size: ${fontSize}px;">${randomChanceContent
            .splice(0, offset)
            .join('')}</span>`;
          if (withAnchor) {
            content = `<a href="#">${content}</a>`;
          }
          html += content;
        }
        return html + randomChanceContent.join('');
      }, '')}</p>`,
    '',
  )}`;
}

export { makeRandomHTML };

require('normalize.css');
require('./index.scss');

import Chance from 'chance';
import randomColor from 'randomcolor';
import findAndReplace from '../../src/index';

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

const initialContent = `<ul>${Array.from({ length: 5 }).reduce(
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

(async () => {
  await new Promise(resolve => window.addEventListener('load', resolve));

  const [elQuery] = document.getElementsByClassName('query');
  const [elContent] = document.getElementsByClassName('content');

  elContent.innerHTML = initialContent;
  elQuery.addEventListener('keyup', ({ target: { value } }) => {
    let previousRegExpExecArray;
    let color = randomColor();
    let content = initialContent;

    try {
      content = findAndReplace(content, {
        find: value,
        replace: ({ offsetText, regExpExecArray }) => {
          color =
            previousRegExpExecArray !== regExpExecArray ? randomColor() : color;

          previousRegExpExecArray = regExpExecArray;
          return `<span style="background-color: ${color};">${offsetText}</span>`;
        },
      });
    } catch (e) {
      return;
    }

    elContent.innerHTML = content;
  });
})();

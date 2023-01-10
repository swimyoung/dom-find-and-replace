import './index.css';
import Chance from 'chance';
import randomColor from 'randomcolor';
import { findAndReplace, Recover } from '../src/index';

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
    (html) =>
      html +
      `<li>${Array.from({ length: 5 }).reduce(
        (html) =>
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
    (html) =>
      html +
      `<p>${Array.from({ length: 15 }).reduce((html) => {
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

const state = {
  find: 'a',
  replace: '',
  content: makeRandomHTML(),
};
const elements = {
  find: document.getElementById('query-find') as HTMLInputElement,
  replace: document.getElementById('query-replace') as HTMLInputElement,
  content: document.getElementById('content') as HTMLDivElement,
};

const find = ((recover: Recover) => (value: string) => {
  recover?.();

  if (!value) {
    elements.content.innerHTML = state.content;
    return;
  }

  let previousFoundText: string;
  let color = randomColor();
  // find text and add highlight
  recover = findAndReplace(elements.content, {
    find: value,
    replace: (offsetText, foundText) => {
      color = previousFoundText !== foundText ? randomColor() : color;
      previousFoundText = foundText;

      const span = document.createElement('span');
      span.textContent = offsetText;
      span.setAttribute('style', 'background-color: ' + color + ';');
      return span;
    },
  }) as Recover;

  Object.assign(state, { find: value, replace: '' });
})(() => undefined);

const replace = ((recover: Recover) => (value: string) => {
  recover?.();

  if (!value) {
    elements.content.innerHTML = state.content;
    find(state.find);
    return;
  }

  // replace text
  recover = findAndReplace(elements.content, {
    find: state.find,
    replace: value,
  }) as Recover;
  Object.assign(state, { replace: value });
})(() => undefined);

elements.find?.addEventListener('input', (event) => {
  find((event.target as HTMLInputElement).value);
});
elements.replace?.addEventListener('input', (event) => {
  replace((event.target as HTMLInputElement).value);
});
elements.content?.addEventListener('input', () => {
  state.content = elements.content.innerHTML;
});

elements.content.innerHTML = state.content;
elements.find.value = state.find;
find(state.find);

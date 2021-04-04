import './index.css';
import randomColor from 'randomcolor';
import { makeRandomHTML } from './randomContent';
import { findAndReplace, Recover } from 'dom-find-and-replace';

(() => {
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
    if (!value) {
      elements.content.innerHTML = state.content;
      return;
    }

    recover();

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

    state.replace = '';
  })(() => undefined);

  const replace = ((recover: Recover) => (value: string) => {
    if (!value) {
      elements.content.innerHTML = state.content;
      find(state.find);
      return;
    }

    recover();

    // replace text
    recover = findAndReplace(elements.content, {
      find: state.find,
      replace: value,
    }) as Recover;
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
})();

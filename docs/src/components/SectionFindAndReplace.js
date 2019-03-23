import React, { useState } from 'react';
import styled from 'styled-components';
import randomColor from 'randomcolor';
import findAndReplace from '../../../src/index';
import { generateRandomHTML } from '../utils';
import { SectionContent } from './SectionContent';

const INITIAL_CONTENT = generateRandomHTML();

export function SectionFindAndReplace() {
  const [content, setContent] = useState(INITIAL_CONTENT);

  const handleChangeQuery = ({ target: { value } }) => {
    let previousRegExpExecArray;
    let color = randomColor();
    let content = INITIAL_CONTENT;

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

    setContent(content);
  };

  return (
    <>
      <Description>
        <p>Find some text in the dom and replace with what you want</p>
        <input
          placeholder="regular expression"
          className="query"
          onChange={handleChangeQuery}
        />
        <p>
          detail at{' '}
          <a href="https://github.com/swimyoung/dom-find-and-replace/blob/master/README.md">
            README.md
          </a>
        </p>
      </Description>
      <SectionContent content={content} />
    </>
  );
}

const Description = styled.section`
  > h2 {
    margin-top: 0;
  }

  .query {
    border: 1px solid gainsboro;
    width: 100%;
    padding: 0.5em 0.7em;
    box-sizing: border-box;
  }
`;

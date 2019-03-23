import React from 'react';
import styled from 'styled-components';
import { SectionFindAndReplace } from '../components';

export default function Body() {
  return (
    <Container>
      <SectionFindAndReplace />
    </Container>
  );
}

export const Container = styled.div`
  display: grid;
  grid-auto-rows: auto;
  grid-gap: 1em;
  margin: 0 auto;
  max-width: 960px;

  grid-template-columns: 100%;
`;

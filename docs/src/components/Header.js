import React from 'react';
import styled from 'styled-components';

export function Header() {
  return (
    <StyledHeader>
      <h1>DOM find and replace</h1>
    </StyledHeader>
  );
}

const StyledHeader = styled.header`
  text-align: center;

  > h1 {
    margin: 2em 0;
  }
`;

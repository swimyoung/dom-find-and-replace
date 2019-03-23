import React from 'react';
import { createGlobalStyle } from 'styled-components';
import normalizeCSS from 'normalize.css';
import globalCSS from '../index.css';
import { Header, Footer } from '../components';
import Body from './Body';

const GlobalStyle = createGlobalStyle`
  ${normalizeCSS.toString()}
  ${globalCSS.toString()}
`;

export default function App() {
  return (
    <>
      <GlobalStyle />
      <Header />
      <Body />
      <Footer />
    </>
  );
}

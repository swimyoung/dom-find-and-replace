import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

SectionContent.propTypes = {
  content: PropTypes.string,
};

SectionContent.defaultProps = {
  content: '',
};

export function SectionContent({ content }) {
  return (
    <Container>
      <div className="content" dangerouslySetInnerHTML={{ __html: content }} />
    </Container>
  );
}

const Container = styled.section`
  .content {
    border: 1px solid gainsboro;
    padding: 1em;
    height: 100%;
    width: 100%;
    word-break: break-all;
    overflow: auto;
  }
`;

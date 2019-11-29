<template>
  <div id="app">
    <header>
      <h1>DOM find and replace</h1>
    </header>
    <section>
      <p>Find some text in DOM and replace with what you want</p>
      <input
        v-model="find"
        class="query"
        placeholder="find (regular expression)"
      />
      <input v-model="replace" class="query" placeholder="replace" />
      <p>
        detail at
        <a href="https://github.com/swimyoung/dom-find-and-replace"
          >README.md</a
        >
      </p>
      <BaseEditor :value="visibleContent" @input="handleInput" />
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import randomColor from 'randomcolor';
import BaseEditor from './components/BaseEditor.vue';
import { makeRandomHTML } from '@/utils/randomContent';
import findAndReplace from 'dom-find-and-replace';

const initialContent = makeRandomHTML();

export default Vue.extend({
  name: 'App',
  components: {
    BaseEditor,
  },
  data() {
    return {
      targetContent: initialContent,
      visibleContent: initialContent,
      highlightedContent: '',
      find: '',
      replace: '',
    };
  },
  watch: {
    find(value) {
      if (!value) {
        this.visibleContent = this.targetContent;
        return;
      }

      let previousFoundText: string;
      let color = randomColor();

      this.replace = '';
      this.visibleContent = this.highlightedContent = findAndReplace(
        this.targetContent,
        {
          find: value,
          replace: (offsetText, foundText) => {
            color = previousFoundText !== foundText ? randomColor() : color;
            previousFoundText = foundText;

            const span = document.createElement('span');
            span.textContent = offsetText;
            span.setAttribute('style', 'background-color: ' + color + ';');
            return span;
          },
        },
      ) as string;
    },

    replace(value) {
      if (!value) {
        this.visibleContent = this.highlightedContent;
        return;
      }

      this.visibleContent = findAndReplace(this.highlightedContent, {
        find: this.find,
        replace: value,
      }) as string;
    },
  },
  mounted() {
    this.find = 'http';
  },
  methods: {
    handleInput(content: string) {
      this.visibleContent = this.highlightedContent = this.targetContent = content;
    },
  },
});
</script>

<style>
html {
  box-sizing: border-box;
}

body {
  font-family: 'Courier New', Courier, monospace;
  font-size: 1em;
}

*,
*:before,
*:after {
  box-sizing: inherit;
}

#app {
  display: grid;
  grid-auto-rows: auto;
  grid-gap: 1em;
  margin: 0 auto;
  max-width: 960px;
  grid-template-columns: 100%;
}

header {
  text-align: center;
}

.query {
  border: 1px solid #dedede;
  width: 100%;
  padding: 0.5em 0.7em;
  font-family: inherit;
  font-size: inherit;
}

.query + .query {
  margin-top: 0.5em;
}
</style>

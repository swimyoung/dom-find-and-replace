<template>
  <div>
    <div v-once ref="contenteditable" class="content" contenteditable="true" @input="handleInput"></div>
    <div class="invisible" v-html="value[0]"></div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    value: {
      type: String,
      default: '',
      required: false,
    },
  },
  mounted() {
    this.renderContent(this.value);
  },
  updated() {
    const el = this.$refs.contenteditable as Element;
    if (this.value !== el.innerHTML) {
      this.renderContent(this.value);
    }
  },
  methods: {
    handleInput(event: Event) {
      this.$emit('input', (event.target as Element).innerHTML);
    },
    renderContent(content: string) {
      const el = this.$refs.contenteditable as Element;
      el.innerHTML = content;
    },
  },
});
</script>

<style scoped>
.content {
  border: 1px solid #dedede;
  padding: 1em;
  height: 100%;
  width: 100%;
  word-break: break-all;
  overflow: auto;
}

.invisible {
  display: none;
}
</style>

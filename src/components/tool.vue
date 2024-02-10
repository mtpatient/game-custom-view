<script setup>

</script>

<template>
  <div contenteditable="false" class="editor-image-container">
    <img
        src="https://prod-alicdn-community.kurobbs.com/forum/d74ecd2f33fe47f0b8af6c737f46644020240208.jpg" width="5000"
        height="2700" class="editor-img" alt="">
    <div class="btn-handler"><!---->
      <button class="btn"><!----> 设为封面</button>
    </div>
  </div>
</template>

<style scoped>
.editor-image-container {
  font-family: sans-serif;
  word-wrap: break-word;
  -webkit-user-modify: read-only;
  position: relative;
  display: flex;
  justify-content: center;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 12px auto;
  overflow: hidden;
  cursor: default;
}

.editor-img {
  font-family: sans-serif;
  word-wrap: break-word;
  cursor: default;
  width: 5000px;
  aspect-ratio: auto 5000 / 2700;
  display: block;
  max-width: 100%;
  height: auto;
}

.btn-handler .btn {
  word-wrap: break-word;
  align-items: center;
  margin-left: 4px;
  display: flex;
  justify-content: center;
  font-size: 14px;
  line-height: 24px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  user-select: none;
  outline: none;
  color: #fff;
  background: rgba(0, 0, 0, .5);
  border-radius: 4px;
  padding: 2px 12px;
}
</style>
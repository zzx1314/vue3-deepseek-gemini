<template>
  <div class="container-message" id="messageCompBox">
    <template v-if="message.length">
      <div class="box-item" v-for="(item, index) in message" :key="`message_${index}`">
        <div :class="['message-item', item.role === 'assistant' ? 'message-item--assistant' : 'message-item--user']" v-if="item.role === 'assistant' || item.content">
          <el-avatar class="message-item__avatar" v-if="item.role === 'assistant'">
            <img src="../images/ai.png" />
          </el-avatar>
          <div v-else></div>
          <div :class="['message-item__content', item.role === 'assistant' ? 'message-item__content--left' : 'message-item__content--right']">
            <div class="message-item__text">
              <MdPreview :id="id" :modelValue="item.content || '思考中...'" />
            </div>
          </div>
          <el-avatar class="message-item__avatar" v-if="item.role !== 'assistant'">
            <img src="../images/user.png" />
          </el-avatar>
          <div v-else></div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="empty-box">
        <el-empty description="暂无对话信息"></el-empty>
      </div>
    </template>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue';
import { MdPreview, MdCatalog } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';

const id = 'preview-only';
const text = ref('');
const scrollElement = document.documentElement;

const props = defineProps({
  message: {
    type: Array,
    default: () => [],
  },
});

const scrollBottom = () => {
  nextTick(() => {
    const div = document.getElementById("messageCompBox");
    div.scrollTop = div.scrollHeight - div.clientHeight;
  });
};

defineExpose({
  scrollBottom
});
</script>

<style scoped lang="scss">
.container-message {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.empty-box {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.box-item {
  margin-bottom: 12px;
}

.message-item {
  display: grid;
  column-gap: 8px;

  &--user {
    grid-template-columns: 0% auto 40px;
    justify-content: end;
  }

  &--assistant {
    grid-template-columns: 40px auto 1%;
    justify-content: start;
  }

  &__avatar {
    width: 36px;
    height: 36px;
    background-color: #ffffff;
    padding: 4px;
  }

  &__content {
    border: 1px solid #409EFF;
    background-color: #ffffff;
    position: relative;
    border-radius: 8px;

    &--left::before,
    &--right::before {
      content: "";
      width: 0;
      height: 0;
      position: absolute;
      border: 5px solid transparent;
      top: 15px;
    }

    &--left::before {
      border-right-color: #409EFF;
      left: -9px;
    }

    &--right::before {
      border-left-color: #409EFF;
      right: -9px;
    }
  }

  &__text {
    padding: 0rem 12px;
    color: #fff;
    position: relative;
    font-size: 0.875rem;
    line-height: 1.4;

    :deep(p) {
      margin: 0.5rem 0;
    }

    :deep(pre) {
      margin: 0.5rem 0;
      font-size: 0.8125rem;
      max-width: 100%;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    :deep(code) {
      font-size: 0.8125rem;
      max-width: 100%;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }
}
</style>

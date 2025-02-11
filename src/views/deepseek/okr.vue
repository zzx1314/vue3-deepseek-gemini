<template>
  <div class="inner-html-container">
    <div class="page">
      <div class="tips">
        <div class="title">OKR生成助手</div>
        <div class="desc" v-if="!isMobile">
          基于DeepSeek的智能OKR生成工具，帮助您快速制定专业的OKR。
        </div>
        <div @click="handleClearStorage" v-else class="pointer">清空</div>
      </div>
      <div class="grid-space-between" :class="!isMobile ? 'grid-box' : ''">
        <div class="left-container" v-if="!isMobile">
          <el-button type="primary" style="width: 100%;font-size: 15px;font-weight: bold; border: 1px;" :icon="Plus"
            size="large" @click="handleAddSession">新建OKR</el-button>
          <div class="session-area">
            <div class="session-item" :class="activeIndex == index ? 'session-item-active' : ''"
              v-for="(item, index) in sessionList" :key="index" @click="handleChangeSessionIndex(index)">
              <span :class="activeIndex == index ? 'active-node' : 'normal-node'" v-if="editIndex != index">{{
                item.title }}</span>
              <el-input :ref="`renameRef_${index}`" autofocus v-model="item.title" v-else size="small"
                style="width: 120px" @blur="editIndex = -1" @change="editIndex = -1" />
              <div class="icon-box">
                <el-icon class="icon" color="#fff" @click.stop="handleClearSession(index)">
                  <Brush />
                </el-icon>
                <el-icon class="icon" color="#fff" @click.stop="handleFocusInput(index)">
                  <EditPen />
                </el-icon>
                <el-icon class="icon" color="#fff" @click.stop="handleDeleteSession(index)">
                  <Delete />
                </el-icon>
              </div>
            </div>
          </div>
        </div>
        <div class="container">
          <div class="message-area">
            <MessageComp ref="messageRef" :message="queryInfos.messages" :loading="loading"></MessageComp>
          </div>
          <div class="input-area" :class="isMobile ? 'left-space' : ''">
            <el-input style="margin-bottom: 5px;" v-model="projectInfo.name" placeholder="请输入项目名称" class="project-input" />
            <el-input style="margin-bottom: 10px;" v-model="projectInfo.desc" type="textarea" :rows="2" placeholder="请输入项目相关描述（可选）" class="project-desc" />
            <div class="button-group">
              <el-button type="primary" @click="handleGenerateOKR" :disabled="!projectInfo.name" :loading="loading">
                生成OKR
                <el-icon class="el-icon--right">
                  <Promotion />
                </el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import OpenAI from "openai";
import MessageComp from "./components/messageComp.vue";
import { Promotion, Delete, EditPen, Brush, Plus } from "@element-plus/icons-vue";
import { getTokens } from "@/api/modules/deepseek.js";
import { ElMessage, ElMessageBox } from "element-plus";
import MobileDetect from "mobile-detect";
import { API_CONFIG, MODEL_CONFIG } from '@/config/deepseek';

// 响应式数据
const isMobile = ref(false);
const sessionList = ref([]);
const activeIndex = ref(-1);
const editIndex = ref(-1);
const loading = ref(false);
const messageRef = ref(null);
const openai = ref(null);

const projectInfo = ref({
  name: '',
  desc: ''
});

const queryInfos = ref({
  messages: [],
  model: 'deepseek-chat',
  ...MODEL_CONFIG
});

// 监听数据变化
watch(sessionList, (val) => {
  const list = val.map((o, i) => ({
    ...o,
    messages: i === activeIndex.value ? queryInfos.value.messages : o.messages
  }));
  localStorage.setItem("list", JSON.stringify(list));
}, { deep: true });

watch(activeIndex, (val) => {
  localStorage.setItem("index", JSON.stringify(val));
}, { deep: true });

// 方法
const handleClearStorage = () => {
  localStorage.removeItem("list");
  localStorage.removeItem("index");
  queryInfos.value.messages = [];
  sessionList.value = [];
  activeIndex.value = -1;
  projectInfo.value = { name: '', desc: '' };
};

const initSessionList = () => {
  sessionList.value = JSON.parse(localStorage.getItem("list") || "[]");
};

const initIndex = () => {
  const listLen = JSON.parse(localStorage.getItem("list") || "[]").length;
  const lastIndex = JSON.parse(localStorage.getItem("index") || "-1");
  if (listLen) {
    activeIndex.value = lastIndex || 0;
  } else {
    activeIndex.value = -1;
  }
  if (activeIndex.value != -1) {
    queryInfos.value.messages = sessionList.value[activeIndex.value].messages || [];
  }
};

const handleAddSession = () => {
  if (loading.value) {
    ElMessage({ type: "warning", message: "请等待当前OKR生成完成！" });
    return;
  }
  sessionList.value.push({
    title: `OKR-${sessionList.value.length + 1}`,
    crtTime: new Date(),
    messages: [],
  });
  queryInfos.value.messages = [];
  activeIndex.value = sessionList.value.length - 1;
  projectInfo.value = { name: '', desc: '' };
};

const handleDeleteSession = (index = 0) => {
  ElMessageBox.confirm("确认删除当前OKR？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    sessionList.value.splice(index, 1);
    if (index == activeIndex.value) {
      activeIndex.value = sessionList.value[index] ? index : --index;
    } else if (index < activeIndex.value) {
      activeIndex.value = --activeIndex.value;
    }
    queryInfos.value.messages = activeIndex.value > -1 ? sessionList.value[activeIndex.value] : [];
    handleChangeSessionIndex(activeIndex.value);
  }).catch(() => { });
};

const handleClearSession = (index) => {
  sessionList.value[index].messages = [];
  queryInfos.value.messages = sessionList.value[index].messages;
  activeIndex.value = index;
  projectInfo.value = { name: '', desc: '' };
};

const handleFocusInput = (index) => {
  editIndex.value = index;
};

const handleChangeSessionIndex = async (index) => {
  if (loading.value) {
    ElMessage({ type: "warning", message: "请等待当前OKR生成完成！" });
    return;
  }
  activeIndex.value = index;
  queryInfos.value.messages = sessionList.value[activeIndex.value]?.messages || [];
  await nextTick()
  messageRef.value.scrollBottom();
};

const initOpenAI = () => {
  openai.value = new OpenAI({
    ...API_CONFIG
  });
};

const generateOKRPrompt = (projectName, projectDesc) => {
  return `作为一名专业的OKR顾问，请根据以下项目信息，生成一个月合理的OKR（Objectives and Key Results）：

项目名称：${projectName}
${projectDesc ? `项目描述：${projectDesc}\n` : ''}
请按照以下要求生成OKR：
1. 生成1-2个主要的O（目标），确保目标具有挑战性、可衡量且有时间限制
2. 为每个O生成3-4个具体的KR（关键结果），确保KR是可量化的、有明确的指标
3. 使用SMART原则（具体、可衡量、可实现、相关性、时限性）
4. 输出格式要清晰易读，使用Markdown格式

请开始生成OKR：`;
};

const handleGenerateOKR = async () => {
  if (!projectInfo.value.name) return;
  if (!openai.value) initOpenAI();
  if (!sessionList.value.length) {
    await handleAddSession();
  }

  const prompt = generateOKRPrompt(projectInfo.value.name, projectInfo.value.desc);
  queryInfos.value.messages.push({
    role: "user",
    content: prompt
  });
  messageRef.value.scrollBottom();

  try {
    loading.value = true;
    queryInfos.value.messages.push({ role: "assistant", content: "" });
    const response = await openai.value.chat.completions.create(queryInfos.value);
    for await (const part of response) {
      queryInfos.value.messages[queryInfos.value.messages.length - 1].content += part.choices[0].delta.content;
    }
    messageRef.value.scrollBottom();
    sessionList.value[activeIndex.value].messages = queryInfos.value.messages;
    loading.value = false;
  } catch (error) {
    loading.value = false;
    queryInfos.value.messages[queryInfos.value.messages.length - 1].content = error.message;
  }
};

// 生命周期钩子
onMounted(async () => {
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  document.head.appendChild(meta);

  initSessionList();
  initIndex();
  initOpenAI();

  const md = new MobileDetect(window.navigator.userAgent);
  isMobile.value = md.mobile();
  await nextTick()
  messageRef.value.scrollBottom();
});
</script>

<style scoped lang="scss">
.pointer {
  cursor: pointer;
}

.inner-html-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;

  .page {
    width: 94vw;
    height: 94vh;
    background: #1f1f1f;
    box-shadow: 0 0 20px rgba(254, 44, 85, 0.15);
    box-sizing: border-box;
    border-radius: 12px;
    overflow: hidden;

    :deep(.el-button) {
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 0 12px rgba(254, 44, 85, 0.5);
      }

      &:active {
        transform: translateY(1px);
      }

      .el-icon {
        font-size: 18px;
        margin-right: 4px;
      }

      &.is-disabled {
        background-color: rgba(254, 44, 85, 0.6);
        border-color: rgba(254, 44, 85, 0.6);
      }
    }

    .tips {
      width: 100%;
      height: 40px;
      background: linear-gradient(90deg, #fe2c55, #ff4d4d);
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      box-sizing: border-box;

      .title {
        font-size: 18px;
        font-weight: bold;
      }

      .desc {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.9);
      }
    }

    .grid-box {
      display: grid;
      grid-template-columns: 280px auto;
      gap: 16px;
      padding: 16px;
    }

    .grid-space-between {
      width: 100%;
      height: calc(100% - 40px);

      .left-container {
        background-color: #2f2f2f;
        padding: 16px;
        border-radius: 8px;
        height: calc(94vh - 40px - 32px);

        .session-area {
          margin-top: 16px;
          height: calc(94vh - 40px - 32px - 16px - 40px);
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #fe2c55 #2f2f2f;
      
          &::-webkit-scrollbar {
            width: 6px;
          }
      
          &::-webkit-scrollbar-track {
            background: #2f2f2f;
            border-radius: 3px;
          }
      
          &::-webkit-scrollbar-thumb {
            background-color: #fe2c55;
            border-radius: 3px;
          }
      
          .session-item {
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.05);
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            justify-content: space-between;
            align-items: center;
      
            &:hover {
              background: rgba(254, 44, 85, 0.1);
              transform: translateX(4px);
            }
      
            &-active {
              background: rgba(254, 44, 85, 0.2);
              border-left: 3px solid #fe2c55;
            }
      
            .active-node {
              color: #fe2c55;
              font-weight: bold;
            }
      
            .normal-node {
              color: #fff;
            }
      
            .icon-box {
              display: flex;
              gap: 8px;
              opacity: 0;
              transition: opacity 0.3s ease;
      
              .icon {
                font-size: 16px;
                cursor: pointer;
                transition: transform 0.3s ease;
      
                &:hover {
                  transform: scale(1.2);
                }
              }
            }
      
            &:hover .icon-box {
              opacity: 1;
            }
          }
        }
      }

      .container {
        width: 100%;
        height: calc(94vh - 40px);
        background: #1f1f1f;
        border-radius: 8px;
        padding: 16px;
        box-sizing: border-box;

        .message-area {
          height: calc(100% - 160px);
          width: 100%;
          margin-bottom: 16px;
        }
      }
    }
  }
}
</style>

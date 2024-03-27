<script>
import {debounce} from "@/js/util";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "notices",
  components: {},
  data() {
    return {
      notices: [],
      params: {
        page_index: 1,
        page_size: 10,
      },
      loading: false,
      end: false,
      scroller: null,
    }
  },
  created() {
    // this.$EventBus.$emit('read')
    this.$axios.get("/message/read/0").then(res => {
      if (res.data.code === 0) {
        this.$EventBus.$emit('read')
      }
    }).catch(err => {
      console.log(err)
    })
    this.getNotice()
  },
  mounted() {
    this.$nextTick(() => {
      this.scroller = debounce(() => {
        this.loading = !this.end;
        // console.log(this.loading, this.end)
      }, this.handleScroll, 200)
      window.addEventListener('scroll', this.scroller)
    })
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.scroller)
  },
  methods: {
    handleScroll() {
      console.log('scroll', this.loading, this.end)
      // 获取页面的滚动位置
      const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

      // 获取页面高度
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 检查是否滚动到页面底部
      if (scrollPosition + windowHeight >= documentHeight / 2 && !this.end) {
        // 触发函数
        this.params.page_index++
        this.getNotice()
        this.loading = false
      }
    },
    getNotice() {
      this.$axios.post("/message/notice", this.params).then(res => {
        if (res.data.code === 0) {
          const notices = res.data.data.notice
          if (notices !== null) {
            this.notices.push(...notices)
            if (notices.length < this.params.page_size) {
              this.end = true
            }
          } else {
            this.end = true
          }
        }
      })
    },
    handlePost(id) {
      this.$router.push({
        path: '/edit',
        query: {
          id: id
        }
      })

      // window.open(page.href, '_blank')
    }
  }
}
</script>

<template>
  <div>
    <div class="content-item-title">
      <h2 class="title">通知</h2>
    </div>
    <div class="content">
      <ul class="list">
        <li v-for="notice in notices" :key="notice.id" class="item">
          <div class="item-content" v-if="notice.post_id === 0">
            <div style="color: #292b2f">你的评论涉嫌违规，已被管理员删除！评论内容为：</div>
            <div v-html="notice.content"></div>
          </div>
          <div v-else class="item-content pointer post-content">
            <div v-html="notice.content" @click="handlePost(notice.post_id)"></div>
          </div>
        </li>
      </ul>
      <p class="end" v-if="notices.length && loading">- 加载中 -</p>
      <p class="end" v-if="notices.length && end">- 暂无更多内容 -</p>
      <div v-if="!notices.length" class="no-content">
        <el-image style="margin-bottom: 24px;height: 168px;width: 195px"
                  :src="require('@/assets/no-content.png')"></el-image>
        <span style="font-weight: 400;
              color: #aeb6c2;font-size: 14px;
              line-height: 22px;">暂无内容</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pointer {
  cursor: pointer;
}

.post-content:hover {
  color: #1db5b8;
}

.item-content {
  height: 100%;
  max-height: 100px;
  color: #8c95a3;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 16px;
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
}

.end {
  text-align: center;
  font-weight: 400;
  color: #8c95a3;
  font-size: 14px;
  line-height: 22px;
  padding-top: 12px;
  padding-bottom: 12px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item {
  padding: 20px 0;
}

.item:not(last-child) {
  border-bottom: 1px solid #ebebeb;
}

.content-item-title {
  border-bottom: 1px solid #EDEFF5;
  padding-bottom: 20px;
}

.content-item-title .title {
  display: inline;
  width: 100%;
  font-size: 18px;
  line-height: 26px;
  font-weight: 700;
  color: #393f4d;
  margin: 0;
}

.content {

}

.no-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  word-break: break-word;
}
</style>
<script>
import {debounce} from "@/js/util";
import Post from "@/components/post.vue";

export default {
  name: "collectList",
  components: {Post},
  data() {
    return {
      posts: [],
      params: {
        id: this.$route.query.id,
        page_index: 1,
        page_size: 10,
        show_type: 2, // 1: 我的帖子， 2：收藏的帖子
      },
      loading: false,
      end: false,
      scroller: null,
    }
  },
  created() {
    this.getMinePost()
  },
  mounted() {
    this.$nextTick(() => {
      this.scroller = debounce(() => {
        this.loading = !this.end;
      }, this.handleScroll, 200)
      window.addEventListener('scroll', this.scroller)
    })
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.scroller)
  },
  methods: {
    handleScroll() {
      // 获取页面的滚动位置
      const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

      // 获取页面高度
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 检查是否滚动到页面底部
      if (scrollPosition + windowHeight >= documentHeight && !this.end) {
        // 触发函数
        this.params.page_index++
        this.getMinePost()
        this.loading = false
      }
    },
    postLike(v) {
      // console.log(v)
      this.$emit('change', 'like', v)
    },
    getMinePost() {
      this.$axios.post("/post/getMine", this.params).then(res => {
        if (res.data.code === 0) {
          const posts = res.data.data.posts
          if (posts !== null) {
            this.posts.push(...posts)
            if (posts.length < this.params.page_size) {
              this.end = true
            }
          } else {
            this.end = true
          }
        }
      }).catch(err => {
        console.log(err)
      })
    },
  },
}
</script>

<template>
  <div>
    <div class="content-item-title">
      <h2 class="title">收藏</h2>
    </div>
    <div class="content">
      <ul class="post-list">
        <li v-for="post in posts" :key="post.id" class="item">
          <Post @like="postLike" :on-post="false"
                :isUser="true" :post="post"></Post>
        </li>
      </ul>
      <p class="end" v-if="posts.length && loading">- 加载中 -</p>
      <p class="end" v-if="posts.length && end">- 暂无更多内容 -</p>
      <div v-if="!posts.length" class="no-content">
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
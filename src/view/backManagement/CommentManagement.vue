<script>
export default {
  name: "CommentManagement",
  data() {
    return {
      params: {
        keyword: "",
        page_index: 1,
        page_size: 10,
        show_type: 1
      },
      comments: [],
      total: 0,
    }
  },
  created() {
    this.getComments()
  },
  methods: {
    getComments() {
      this.$axios.post("/comment/list", this.params).then(res => {
        if (res.data.code === 0) {
          this.comments = res.data.data.comments
          this.total = res.data.data.total
        } else {
          this.$message.error(res.data.msg)
        }
      }).catch(err => {
        console.log(err)
      })
    },
    ToUserDetail(id) {
      let page = this.$router.resolve({
        path: '/person-center/post',
        query: {id: id}
      })
      window.open(page.href, '_blank')
    },
    NextPage() {
      this.params.page_index += 1
      this.getComments()
    },
    PrevPage() {
      this.params.page_index -= 1
      this.getComments()
    },
    handleSizeChange(val) {
      this.params.page_index = 1
      this.params.page_size = val
      this.getComments()
    },
    handleDelete(comment) {
      this.$confirm('此操作将永久删除该评论, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(() => {
        this.$axios.del(`/comment/${comment.id}`).then(res => {
          if (res.data.code === 0) {
            this.$message.success("删除成功！")
            this.getComments()
          } else {
            this.$message.error(res.data.msg)
          }
        }).catch(err => {
          console.log(err)
        })
      }).catch(err => {
        console.log(err)
      })
    },
    ToPostDetail(id) {
      const page = this.$router.resolve({
        path: '/post-detail/' + id,
      })
      window.open(page.href, '_blank')
    },
  }
}
</script>

<template>
  <div class="container">
    <div class="table-container">
      <el-table
          :data="comments"
          stripe border
          height="700"
          max-width="100%"
          style="width: 100%"
      >
        <!--        <el-table-column label="ID" prop="id" width="100">-->
        <!--        </el-table-column>-->
        <el-table-column label="发送者">
          <template slot-scope="scope">
            <el-button @click="ToUserDetail(scope.row.user_id)" size="mini" type="text">
              {{ scope.row.username }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="接收者">
          <template slot-scope="scope">
            <el-button @click="ToUserDetail(scope.row.reply_id)" size="mini" type="text">
              {{ scope.row.reply_name }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="帖子">
          <template slot-scope="scope">
            <el-button @click="ToPostDetail(scope.row.post_id)" size="mini" type="text">
              {{ scope.row.post_title }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="评论内容" width="400">
          <template slot-scope="scope">
            <div v-html="scope.row.content"></div>
          </template>
        </el-table-column>
        <el-table-column sortable label="发布时间" prop="create_time">
        </el-table-column>
        <el-table-column sortable label="获赞数" prop="like_count" >
        </el-table-column>
        <el-table-column
            align="right">
          <template slot="header" slot-scope="scope">
            <el-input
                v-model="params.keyword"
                size="mini"
                @keyup.enter.native="getComments"
                maxlength="20"
                placeholder="输入关键字搜索"/>
          </template>
          <template slot-scope="scope">
            <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination :total="total"
                   layout="sizes,prev,pager,next,jumper,total"
                   background
                   :page-sizes="[10, 20, 50]"
                   @size-change="handleSizeChange"
                   @current-change="getComments"
                   :current-page.sync="params.page_index"
                   @prev-click="PrevPage"
                   @next-click="NextPage"></el-pagination>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  padding: 10px;
  width: 100%;
}

.table-container {
  position: relative;
  width: 99.5%;
  height: 700px;
  overflow: auto;
  margin-bottom: 10px;
}
</style>
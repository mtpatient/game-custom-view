<script>
export default {
  name: "FeedbackManagement",
  data() {
    return {
      params: {
        keyword: "",
        page_index: 1,
        page_size: 10,
        show_type: 1
      },
      list: [],
      total: 0,
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.$axios.post("/adm-log/list", this.params).then(res => {
        if (res.data.code === 0) {
          this.list = res.data.data.list
          this.total = res.data.data.total
        } else {
          this.$message.error(res.data.msg)
        }
      }).catch(err => {
        console.log(err)
      })
    },
    NextPage() {
      this.params.page_index += 1
      this.getList()
    },
    PrevPage() {
      this.params.page_index -= 1
      this.getList()
    },
    handleSizeChange(val) {
      this.params.page_index = 1
      this.params.page_size = val
      this.getList()
    },
    ToUserDetail(id) {
      const page = this.$router.resolve({
        path: '/person-center/post',
        query: {
          id: id
        }
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
          :data="list"
          stripe border
          height="700"
          max-width="100%"
          style="width: 100%"
      >
        <el-table-column label="管理员" width="200" align="center">
          <template slot-scope="scope">
            <el-button
                size="mini"
                type="text"
                @click="ToUserDetail(scope.row.user_id)"
            >{{ scope.row.username }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="类型"
                         width="140"
                         prop="type" align="center">
        </el-table-column>
        <el-table-column sortable label="操作时间" prop="create_time"
        width="200">
        </el-table-column>
        <el-table-column
            align="center" >
          <template slot="header" slot-scope="scope">
<!--            <span>操作内容</span>-->
            <el-input
                v-model="params.keyword"
                size="mini"
                @keyup.enter.native="getList"
                maxlength="20"
                placeholder="输入关键字搜索">
              <span slot="prepend">操作内容</span>
            </el-input>
          </template>
          <template slot-scope="scope">
            <p style="font-size: 12px; color: #8c95a3">{{scope.row.content}}</p>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination :total="total"
                   layout="sizes,prev,pager,next,jumper,total"
                   background
                   :page-sizes="[10, 20, 50]"
                   @size-change="handleSizeChange"
                   @current-change="getList"
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
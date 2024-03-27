<script>
import storage from "@/js/storage";

export default {
  name: "UserManagement",
  computed: {
    storage() {
      return storage
    }
  },
  data() {
    return {
      params: {
        keyword: "",
        page_index: 1,
        page_size: 10,
        show_type: 1
      },
      users: [],
      total: 0,
    }
  },
  created() {
    this.getUsers()
  },
  methods: {
    getUsers() {
      this.$axios.post("/user/list", this.params).then(res => {
        if (res.data.code === 0) {
          this.users = res.data.data.users
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
      this.getUsers()
    },
    PrevPage() {
      this.params.page_index -= 1
      this.getUsers()
    },
    handleBan(user) {
      if (user.status === 0) {
        this.$axios.post("/user/ban",
            {
              id: user.id,
              operate: 1,
            }).then(res => {
          if (res.data.code === 0) {
            user.status = 1
          } else {
            this.$message.error(res.data.msg)
          }
        })
      } else if (user.status === 1) {
        this.$axios.post("/user/ban", {
          id: user.id,
          operate: 2,
        }).then(res => {
          if (res.data.code === 0) {
            user.status = 0
          } else {
            this.$message.error(res.data.msg)
          }
        })
      }
    },
    handleSizeChange(val){
      this.params.page_index = 1
      this.params.page_size = val
      this.getUsers()
    }
  }
}
</script>

<template>
  <div class="container">
    <div class="table-container">
      <el-table
          :data="users"
          stripe border
          height="700"
          max-width="100%"
          style="width: 100%"
      >
        <el-table-column label="ID" prop="id" width="100">
        </el-table-column>
        <el-table-column label="用户名">
          <template slot-scope="scope">
            <el-button @click="ToUserDetail(scope.row.id)" size="mini" type="text">{{ scope.row.username }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="邮箱" prop="email">
        </el-table-column>
        <el-table-column label="性别" width="80">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.sex === 1" type="success">男</el-tag>
            <el-tag v-else-if="scope.row.sex === 2" type="danger">女</el-tag>
            <el-tag v-else type="info">保密</el-tag>
          </template>
        </el-table-column>
        <el-table-column sortable label="注册时间" prop="create_time">
        </el-table-column>
        <el-table-column sortable label="粉丝数" prop="fans_count">
        </el-table-column>
        <el-table-column sortable label="获赞数" prop="like_count">
        </el-table-column>
        <el-table-column label="状态" width="68">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 0" type="success">正常</el-tag>
            <el-tag v-else type="danger">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column
            align="right">
          <template slot="header" slot-scope="scope">
            <el-input
                v-model="params.keyword"
                size="mini"
                @keyup.enter.native="getUsers"
                maxlength="20"
                placeholder="输入关键字搜索"/>
          </template>
          <template slot-scope="scope">
            <el-button
                size="mini"
                type="danger"
                :disabled="storage.get('user').id === scope.row.id"
                v-if="scope.row.status === 0"
                @click="handleBan(scope.row)">封禁
            </el-button>
            <el-button
                size="mini"
                :disabled="storage.get('user').id === scope.row.id"
                v-else
                @click="handleBan(scope.row)">解禁
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
                   @current-change="getUsers"
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
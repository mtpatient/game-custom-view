<script>
import {handleImgCompress} from "@/js/util";

export default {
  name: "AvatarManagement",
  data() {
    return {
      avatars: [],
      dialogFormVisible: false,
      form: {
        id: '',
        name: '',
        url: '',
      },
      dialog_title: '修改头像',
      loading: false,
    }
  },
  created() {
    this.getAvatars()
  },
  methods: {
    handleAdd() {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.setAttribute('multiple', 'true')
      input.click();
      input.onchange = async () => {
        this.loading = true
        const files = input.files

        if (files.length > 0) {
          await handleImgCompress(files).then((files) => {
            this.$axios.getCOSSignature(files.length).then(res => {
              if (res.data.code === 0) {
                const signatures = res.data.data.signatures
                if (signatures !== null && signatures.length !== files.length) {
                  this.$message.error("请求错误")
                  return
                }
                let avatars = []
                for (let i = 0; i < signatures.length; i++) {
                  let url = signatures[i].split('?') // 处理签名为url
                  avatars.push({
                    name: files[i].name,
                    url: url[0],
                    type: 0,
                  })
                  if (i === signatures.length - 1) {
                    this.$axios.putImg(signatures[i], files[i], () => {
                      this.$axios.post("/img", avatars).then(res => {
                        if (res.data.code === 0) {
                          this.getAvatars()
                          this.loading = false
                        } else {
                          this.$message.error('添加头像失败!')
                        }
                      })
                    })
                  } else {
                    this.$axios.putImg(signatures[i], files[i])
                  }
                }
              } else {
                this.$message.error('服务错误!')
              }
            })
          })
        }
      }
    },
    handleEdit(index, row) {
      this.dialogFormVisible = true
      this.form.id = row.id
      this.form.name = row.name
      this.form.url = row.url
    },
    getAvatars() {
      this.$axios.get('/img/avatars').then(res => {
        if (res.data.code === 0) {
          this.avatars = res.data.data.avatars
        } else {
          this.$message.error('获取头像列表错误！')
        }
      })
    },
    handleDelete(index, row) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$axios.del(`/img/avatar/${row.id}`).then(res => {
          if (res.data.code === 0) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getAvatars()
          } else {
            this.$message.error('服务错误')
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    handleImgUpload() {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.setAttribute('multiple', 'false')
      input.click();
      input.onchange = async () => {
        const files = input.files

        if (files.length > 0) {
          await handleImgCompress(files).then((files) => {
            this.$axios.getCOSSignature(files.length).then(res => {
              if (res.data.code === 0) {
                const signatures = res.data.data.signatures
                if (signatures !== null && signatures.length !== files.length) {
                  this.$message.error("请求错误")
                  return
                }
                this.$axios.putImg(signatures[0], files[0], () => {
                  let url = signatures[0].split('?')
                  this.form.url = url[0]
                })
              } else {
                this.$message.error('服务错误！')
              }
            })
          })
        }
      }
    },
    handleSubmit() {
      if (this.form.name === '') {
        this.$message.error('头像名不能为空！')
      }
      this.$axios.put('/img', this.form).then(res => {
        if (res.data.code === 0) {
          this.getAvatars()
          this.dialogFormVisible = false
          this.$message.success('更新头像成功')
        } else {
          this.$message.error('更新头像失败')
        }
      })
    }
  }
}
</script>

<template>
  <div class="container">
    <el-table :data="avatars" style="width: 100%" v-loading="loading">
      <el-table-column type="index" width="150">

      </el-table-column>
      <el-table-column
          label="头像"
      >
        <template slot-scope="scope">
          <el-image style="height: 100px; width: 100px; border-radius: 50%"
                    :src="scope.row.url" fit="contain" lazy></el-image>
        </template>
      </el-table-column>
      <el-table-column
          label="头像名"
          prop="name">
      </el-table-column>
      <el-table-column label="添加日期">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">{{ scope.row.create_time }}</span>
        </template>
      </el-table-column>
      <el-table-column
          label="更新日期">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">{{ scope.row.update_time }}</span>
        </template>
      </el-table-column>
      <el-table-column align="right">
        <template slot="header">
          <el-button type="primary"
                     icon="el-icon-circle-plus-outline"
                     @click="handleAdd"
          >添加
          </el-button>
        </template>
        <template slot-scope="scope">
          <el-button
              size="mini"
              type="success"
              @click="handleEdit(scope.$index, scope.row)">Edit
          </el-button>
          <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)">Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="dialog_title"
               :visible.sync="dialogFormVisible">
      <el-form>
        <el-form-item label="头像名">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="头像">
          <el-image @click="handleImgUpload" class="form-img" :src="form.url" fit="contain">
          </el-image>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="success" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.container {
  overflow-y: auto;
  //padding-bottom: 10px;
  padding: 10px;
  width: 100%;
  height: 100%;
}

.form-img {
  border-radius: 50%;
  height: 300px;
  width: 300px;
}
</style>
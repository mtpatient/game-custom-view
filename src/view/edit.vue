<script>
import {quillEditor} from 'vue-quill-editor'
import "quill/dist/quill.core.css"; // import styles
import "quill/dist/quill.snow.css"; // for snow theme
import {addQuillTitle} from "@/js/quill-titlle";
import Quill from 'quill'
import QuillCustomTag from "@/js/quill-custom-tag";
import Compressor from 'compressorjs'
import {generateRandomStrings} from "@/js/util";
import * as qiniu from 'qiniu-js'

// import Spinner from 'vue-simple-spinner' // 加载
// import ImageResize from 'quill-image-resize-module' // 调整图片大小组件。
// import {ImageExtend} from 'quill-image-paste-module' // 粘贴图片
// import {ImageExtend, QuillWatch} from 'quill-image-extend-module'
// Quill.register('modules/imageDrop', ImageDrop)
// Quill.register('modules/imageResize', ImageResize)
// Quill.register('modules/imageExtend', ImageExtend)

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "edit",
  components: {
    quillEditor,
    // Spinner
  },
  data() {
    return {
      title: '',
      content: '',
      text: '',
      img_nums: 0,
      err: '',
      editorOption: {
        theme: 'snow',
        placeholder: '请输入内容.....',
        modules: {
          toolbar: {
            container: [
              // 加粗 斜体 下划线 删除线 -----['bold', 'italic', 'underline', 'strike']
              ['bold', 'italic', 'underline', 'strike'],
              //自定义：设置字体大小按钮
              // ['small', false, 'large'],
              // 引用  代码块-----['blockquote', 'code-block']
              ['blockquote', 'code-block'],
              // 1、2 级标题-----[{ header: 1 }, { header: 2 }]
              [{header: 1}, {header: 2}],
              // 有序、无序列表-----[{ list: 'ordered' }, { list: 'bullet' }]
              [{list: 'ordered'}, {list: 'bullet'}],
              // 上标/下标-----[{ script: 'sub' }, { script: 'super' }]
              [{script: 'sub'}, {script: 'super'}],
              // 缩进-----[{ indent: '-1' }, { indent: '+1' }]
              [{indent: '-1'}, {indent: '+1'}],
              // 文本方向-----[{'direction': 'rtl'}]
              [{direction: 'rtl'}],
              // 字体大小-----[{ size: ['small', false, 'large', 'huge'] }]
              // [{size: ['small', false, 'large', 'huge']}],
              // [{size: ['small']}],
              // 标题-----[{ header: [1, 2, 3, 4, 5, 6, false] }]
              // [{header: [1, 2, 3, 4, 5, 6, false]}],
              // 字体颜色、字体背景颜色-----[{ color: [] }, { background: [] }]
              [{color: []}, {background: []}],
              // 字体种类-----[{ font: [] }]
              // [{font: []}],
              // 对齐方式-----[{ align: [] }]
              [{align: []}],
              // 清除文本格式-----['clean']
              ['clean'],
              // 链接、图片、视频-----['link', 'image', 'video']
              ['link', 'image'],
            ],
            handlers: {
              'image': () => {
                this.handleImage()
              }
            }
          },
          // imageResize: {
          // displayStyles: {
          //   backgroundColor: 'black',
          //   border: 'none',
          //   color: 'white',
          // },
          // modules: ['Resize', 'DisplaySize', 'Toolbar']
          // modules: ['Toolbar']
          // },
          // imageExtend: {
          //   // loading: false,
          //   maxHeight: 300,
          //   maxImage: 1,
          //   allowedTypes: ['image/jpeg', 'image/png'],
          //   // 最大文件大小限制，单位为MB
          //   size: 1,
          //   sizeError: () => {
          //     this.$message({
          //       message: '图片大小超过限制:1MB',
          //       type: 'error'
          //     })
          //   },
          //
          // },
        },
        // formats: [
        //   'header', 'font', 'size',
        //   'bold', 'italic', 'underline', 'strike', 'blockquote',
        //   'list', 'bullet', 'indent',
        //   'link', 'image', 'video'
        // ],
      },
      section: [
        {id: 0, label: '闲聊'},
        {id: 1, label: '同人'}
      ],
      cur_section: 0,
      isPrivate: false,
      // isLoading: false,
      imgList: [],
    }
  },
  mounted() {
    addQuillTitle()
    QuillCustomTag(Quill)
  },
  computed: {
    // eslint-disable-next-line vue/return-in-computed-property
    textLength() {
      return this.text.length + this.img_nums * 100
    }
  },
  methods: {
    handleTitle() {
      if (this.title === '') {
        this.$message({
          message: '标题不能为空!',
          type: 'error'
        })
      }
    },
    handlePublish() {

    },
    handleImage() {
      // this.isLoading = true
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.setAttribute('multiple', 'true')
      input.click();
      input.onchange = async () => {
        const files = input.files;
        if (files.length + this.img_nums > 9) {
          this.$message.error('你上传的图片太多了！限9张！')
          return
        }
        if (files.length > 0) {
          const ids = generateRandomStrings(8, files.length)
          // console.log(ids)
          this.handleImgUpload(files, ids)
          for (let i = 0; i < files.length; i++) {
            const quill = this.$refs.quill_editor.quill
            const selection = quill.getSelection()
            try {
              quill.insertEmbed(selection.index || 0, 'AppPanelEmbed',
                  `<div contenteditable="true" class="editor-image-container">
                <img id="${ids[i]}" src="${this.Editor_Img_Uploading}"
                 class="editor-img">
<!--                <button class="editor-img-btn">设为封面</button>-->
             </div>`)
            } catch (err) {
              console.log(err)
            }
          }
        }
        // this.isLoading = false
      };
    },
    handleEditorChange(e) {
      this.text = this.removeHtmlTag(e)
      this.img_nums = document.querySelectorAll('.ql-editor img').length
    },
    removeHtmlTag(html) {
      let doc = new DOMParser().parseFromString(html, 'text/html')
      return doc.body.textContent || '';
    },
    handleImgCompress(files) {
      return new Promise((resolve, reject) => {
        const resFiles = [];
        let compressCount = 0;

        for (let i = 0; i < files.length; i++) {
          new Compressor(files[i], {
            quality: 0.2,
            success(result) {
              console.log('compress success', result.size)
              const compressedFile = new File([result], files[i].name, {type: files[i].type});
              resFiles.push(compressedFile);
              compressCount++;

              // 如果所有文件都已压缩完成，则resolve Promise
              if (compressCount === files.length) {
                resolve(resFiles);
              }
            },
            error(err) {
              console.log('压缩失败:', err);
              compressCount++;
              // 如果所有文件都已压缩完成（即使有错误），则resolve Promise
              if (compressCount === files.length) {
                resolve(resFiles);
              }
            }
          });
        }

        // 如果没有文件需要压缩，则直接resolve空数组
        if (files.length === 0) {
          resolve(resFiles);
        }
      });
    },
    handleImgUpload(pendFiles, ids) {
      if (pendFiles.length === 0) {
        return;
      }
      // 图片压缩
      this.handleImgCompress(pendFiles).then((files) => {
        if (files.length > 0) {
          // TODO 判断七牛云是否已满
          if (this.QINIUOS) {
            // 上传图片： 七牛云
            this.$axios.get(`/img/getUploadToken/${files.length}`).then((res) => {
              if (res.data.code === 0) {
                const names = res.data.data.names
                const token = res.data.data.token
                const domain = this.QINIUDomain
                for (let i = 0; i < ids.length; i++) {
                  const observable = qiniu.upload(files[i], names[i], token)
                  const observer = {
                    // eslint-disable-next-line no-unused-vars
                    next() {
                      // 处理上传过程
                    },
                    // eslint-disable-next-line no-unused-vars
                    error() {
                      // 上传错误
                    },
                    complete() {
                      // 上传完成后的信息
                      // console.log(names[i])
                      document.querySelector('#' + ids[i]).src = domain + '/' + names[i]
                    }
                  }
                  observable.subscribe(observer) // 上传开始
                }
              } else {
                this.$message.error('服务错误!')
              }
            }).catch((error) => {
              console.log(error)
              this.$message.error('服务错误')
            })
          } else {
            // 上传图片: COS
            this.$axios.get(`/img/getSignature/${files.length}`).then((res) => {
              if (res.data.code === 0) {
                const signatures = res.data.data.signatures
                // console.log(signatures)
                if (signatures !== null && signatures.length !== files.length) {
                  this.$message.error("请求错误")
                  return
                }
                for (let i = 0; i < files.length; i++) {
                  this.$axios.putImg(signatures[i], files[i], function () {
                    let url = signatures[i].split('?') // 处理签名为url
                    // console.log(url[0])
                    document.querySelector('#' + ids[i]).src = url[0]
                  })
                }
              } else {
                this.$message.error('服务错误!')
              }
            }).catch((error) => {
              console.log(error)
              this.$message.error('服务错误')
            })
          }
        }
      })
    }
  },
}
</script>

<template>
  <div id="edit">
    <div id="editor_container">
      <div id="editor_container_text">
        <div id="title-box">
          <b class="mustSelect">标题</b> ： <input v-model="title"
                                                  id="title" placeholder="标题(必填)"
                                                  @blur="handleTitle" maxlength="30"/>
          <span style="color: #c0c4cc">{{ title.length + ' / 30' }}</span>
        </div>
        <div id="editor-box">
          <!--          <Spinner-->
          <!--              id="editor-spinner" size="60"-->
          <!--              font-size="20" message="uploading ..."-->
          <!--              font-color=""-->
          <!--              v-if="isLoading"-->
          <!--          ></Spinner>-->
          <quill-editor ref="quill_editor" :options="editorOption"
                        id="editor" v-model="content"
                        @input="handleEditorChange($event)"
          >
          </quill-editor>
          <div style="color: #c0c4cc;
                text-align: right;
                ">
            {{ textLength + ' / 20000' }}
          </div>
        </div>
        <div class="postOption_box">
          <span class="mustSelect" style="font-size: 18px">所属板块 : </span>
          <el-radio-group v-model="cur_section">
            <el-radio-button v-for="s in section" :key="s.value" :label="s.label"></el-radio-button>
          </el-radio-group>
        </div>
        <div class="postOption_box" style="font-size: 18px">
          <el-switch v-model="isPrivate" active-text="仅自己可见"></el-switch>
        </div>
        <div class="postOption_box">
          <el-button @click="handlePublish" icon="el-icon-edit" type="primary">
            发布
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
#edit {
  width: 100%;
  min-width: 1200px;
  background-color: #f6f7f8;
  height: auto;
  min-height: 950px;
  overflow-y: auto;
}

#editor_container {
  width: 900px;
  background-color: white;
  margin: 10px auto;
  height: 100%;
  min-height: 700px;
  display: flex;
  //align-items: center;
  justify-content: center;
  border-radius: 10px;
  position: relative;
  border: 1px;
}

#editor_container_text {
  width: 800px;
  height: 940px;
  margin-top: 20px;
}


#title-box {
}

#title {
  border: 1px solid #c0c4cc;
  border-radius: 5px;
  width: 680px;
  height: 100%;
  padding: 10px 15px;
  box-sizing: border-box;
  font-family: "Microsoft soft", serif;
  margin-right: 6px;
}

#editor {
  height: 680px;
}

#editor-box {
  //min-height: 430px;
  height: auto;
  position: relative;
}

.postOption_box {
  position: relative;
  font-size: 20px;
  height: 40px;
  width: 100%;
  margin-bottom: 20px;
}

.mustSelect:before {
  content: "*";
  color: red;
  //margin-right: 4px;
}

.ql-editor {
  margin-top: 10px;
  min-height: 400px;
  //border-radius: 10px;
  border-top: 1px solid;
  box-sizing: border-box;
  line-height: 1.42;
  height: 100%;
  outline: none;
  overflow-y: auto;
  padding: 12px 15px;
  -o-tab-size: 4;
  tab-size: 10;
  -moz-tab-size: 4;
  text-align: left;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 15px;
}

.ql-toolbar {
  position: absolute;
  right: -44px;
  fill: white;
  height: 680px;
  //z-index: 100;
  margin: 0 auto;
  //left: 50%;
  //transform: translateX(-50%);
  //width: auto;
  background-color: white;
  border-radius: 10px;
  //max-width: 900px;
  //min-width: 900px;
  width: 40px;
  transition-property: top;
  transition-duration: 0.5s;
}

.editor-image-container {
  font-family: sans-serif;
  word-wrap: break-word;
  -webkit-user-modify: read-only;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
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
  //aspect-ratio: auto 5000 / 2700;
  display: block;
  max-width: 100%;
  max-height: 400px;
  border-radius: 10px;
  border: 3px solid transparent;
}

.editor-img:hover {
  border: 3px solid #409EFF;
  cursor: not-allowed;
}

.editor-img-btn {
  word-wrap: break-word;
  align-items: center;
  margin-left: 4px;
  display: flex;
  justify-content: center;
  font-size: 14px;
  line-height: 24px;
  font-weight: 500;
  color: #fff;
  background: rgba(0, 0, 0, .5);
  position: absolute;
  right: 28px;
  bottom: 5px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.ql-editor > p > img {
  background-color: gray !important;
  //text-align: center;
}

/*

//#editor-spinner{
//  //z-index: 100;
//  position: absolute;
//  top: 20%;
//  left: 50%;
//  transform: translate(-50%, -50%);
//}


.ql-toolbar .ql-small:before {
  content: 'S';
  font-size: 18px;
  font-weight: bold;
  color: #444444;
}

.ql-toolbar .ql-undefined:before {
  content: 'N';
  font-size: 18px;
  font-weight: bold;
  color: #444444;
}

.ql-toolbar .ql-large:before {
  content: 'L';
  font-size: 18px;
  font-weight: bold;
  color: #444444;
}
 */
</style>
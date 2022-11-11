import {Button, Card, Input, List, notification, Progress, Row, Space, Spin} from "antd";
import axios from "axios";
import React, {useEffect, useState} from "react";

export default function IndexPage() {
  const [files, setFiles] = useState<string[]>();
  const [uploading, setUploading] = useState(false);
  const [percent, setPercent] = useState<number>(0)

  async function updateData() {
    const data = await axios.post('/files').catch(() => {
      notification.open({
        message: '错误 无法连接到服务器',
        description: '无法更新文件列表',
        placement: 'bottom',
        style: {background: 'indianred'},
        duration: 1
      })
      return null;
    });
    if (data != null && data.data != '') {
      const strings = data.data.split(" ");
      setFiles(strings);
    } else {
      setFiles([]);
    }
  }

  useEffect(() => {
    if (!uploading) {
      updateData().then();
    }
  }, [uploading]);

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);

    if (e.target.files !== null) {
      const file = e.target.files[0];
      let data = new FormData();

      notification.open({
        message: '上传' + file.name + '中...', placement: 'bottom', style: {background: 'burlywood'}, duration: 1
      })

      const canConnectToServer = () => {
        notification.open({
          message: '错误 无法连接到服务器',
          description: '无法上传文件',
          placement: 'bottom',
          style: {background: 'indianred'},
          duration: 1
        })
      }

      const fileIsExists = () => {
        notification.open({
          message: '文件已存在 请删除后重新上传!',
          placement: 'bottom',
          style: {background: 'indianred'},
          duration: 1
        })
      }

      const isExists = await axios
        .post('/isExists/' + file.name)
        .catch(() => {
          canConnectToServer();
          return null;
        });

      if (isExists != null) {
        console.log(isExists.data);
        if (isExists.data == true) {
          fileIsExists();
        } else {
          data.append('file', file);

          const uploadResp = await axios
            .post('/upload', data, {
              headers: {'Content-Type': 'multipart/form-data'}, onUploadProgress: (e) => {
                if (e.total != undefined) {
                  setPercent(e.loaded / e.total * 100 | 0)
                }
              }
            })
            .catch(() => {
              canConnectToServer()
              return null;
            });

          if (uploadResp != null && uploadResp.data == 'file exists') {
            fileIsExists();
          } else {
            notification.open({
              message: '上传成功', placement: 'bottom', style: {background: 'burlywood'}, duration: 1
            })
            await updateData();
          }
        }
      }
    }

    setUploading(false);
  }

  const downloadFile = (name: string) => {
    notification.open({
      message: '下载' + name + '中...', placement: 'bottom', style: {background: 'burlywood'}, duration: 1
    })
    window.open(axios.defaults.baseURL + '/download/' + name)
  }

  const deleteFile = async (name: string) => {
    const resp = await axios.post('/delete/' + name);
    if (resp.data == 'done') {
      notification.open({
        message: name + '删除成功', placement: 'bottom', style: {background: 'burlywood'}, duration: 1
      })
      await updateData()
    } else if (resp.data == "file not found") {
      notification.open({
        message: name + '不存在', placement: 'bottom', style: {background: 'indianred'}, duration: 1
      })
    }
  }

  return (<>
    <Row justify='center'>
      <Space direction='vertical' size='middle' style={{display: 'flex'}} align='center'>
        <Progress percent={percent} style={{width: '50%'}}/>
        {/*上传 刷新 按钮*/}
        <Space direction='horizontal'>
          <Spin tip='上传中' spinning={uploading}>
            <div>
              <Button>点我上传或拖拽上传</Button>
              <Input type='file' style={{maxWidth: 500, position: 'absolute', left: 0, top: 0, opacity: 0}}
                     disabled={uploading} onChange={uploadFile}/>
            </div>
          </Spin>
        </Space>
        <Button onClick={updateData} type='ghost'>刷新</Button>

        {/*文件列表*/}
        <List dataSource={files} renderItem={name => <List.Item>
          <Card style={{width: '100%', margin: '2%'}}>
            <h2>{name}</h2>
            <Row justify='end'>
              <Space direction='horizontal'>
                <Button type='dashed' danger onClick={() => deleteFile(name)}>删除</Button>
                <Button type='primary' onClick={() => downloadFile(name)}>点击下载</Button>
              </Space>
            </Row>
          </Card>
        </List.Item>}/>
      </Space>
    </Row>
  </>);
}

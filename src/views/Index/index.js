import React, { useState, useEffect } from "react";
import {
  Typography,
  Tabs,
  List,
  Avatar,
  Button,
  Upload,
  message,
  Input,
} from "antd";
import JSZip from "jszip";
import FileSaver from "file-saver";
import "./index.scss";
import Huffman from "../Huffman";
import UploadIcon from "../../assets/upload.png";
import TextFileIcon from "../../assets/textFile.png";
import DownloadIcon from "../../assets/download.png";

const { Dragger } = Upload;
const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const encodeText = (text) => {
  const huffman = new Huffman(text);
  const encodedText = huffman.encode(text);
  const decodedText = huffman.decode();
  return {
    encodedText,
    decodedText,
    rate: huffman.rate,
    huffman,
  };
};

function Index() {
  const [fileList, setFileList] = useState([]);
  const [pastingBoxText, setPastingBoxText] = useState("");

  const updateFileList = (obj) => {
    setFileList([...fileList, obj]);
  };

  const downloadSource = (item) => {
    const zip = new JSZip();
    const json = JSON.stringify(item.huffman, null, 2);
    zip.file("source.json", json);
    zip.file("encode.txt", item.encodedText);
    zip.file("decode.txt", item.decodedText);
    zip.generateAsync({ type: "blob" }).then(function (content) {
      // see FileSaver.js
      FileSaver.saveAs(content, "source.zip");
    });
  };

  const downloadEncodedText = (item) => {
    const zip = new JSZip();
    zip.file("encode.txt", item.encodedText);
  };

  return (
    <div className="App">
      <Title level={3}>Online Huffman Encryption & Decryption</Title>
      <Tabs className="tab-container" defaultActiveKey="1">
        <TabPane tab="Upload Files" key="1">
          <div>
            <FilesDroppingBox setFileList={updateFileList} />
            <List
              dataSource={fileList}
              renderItem={(item, index) => (
                <List.Item key={index} className="fileList-item">
                  <List.Item.Meta
                    avatar={<Avatar src={TextFileIcon} />}
                    title={<div>{item.name}</div>}
                    description={item.size}
                    className="fileList-item-info"
                  />
                  <div className="fileList-item-buttons">
                    <div>{`Compression Ratio: ${item.rate * 100}%`}</div>
                    <Button
                      type="primary"
                      shape="round"
                      icon={
                        <img
                          className="icon"
                          src={DownloadIcon}
                          alt="download"
                        />
                      }
                      onClick={() => {
                        downloadEncodedText(item);
                      }}
                    >
                      Encoded Text
                    </Button>
                    <Button
                      type="primary"
                      shape="round"
                      icon={
                        <img
                          className="icon"
                          src={DownloadIcon}
                          alt="download"
                        />
                      }
                      onClick={() => {
                        downloadSource(item);
                      }}
                    >
                      Source Package
                    </Button>
                  </div>
                </List.Item>
              )}
            />
          </div>
        </TabPane>
        <TabPane tab="Paste Text" key="2">
          <TextPastingBox text={pastingBoxText} />
          <Title level={4} className="title">
            Files List
          </Title>
          <List
            dataSource={fileList}
            renderItem={(item, index) => (
              <List.Item key={index} className="fileList-item">
                <List.Item.Meta
                  avatar={<Avatar src={TextFileIcon} />}
                  title={<div>{item.name}</div>}
                  description={item.size}
                  className="fileList-item-info"
                />
                <Button
                  type="primary"
                  shape="round"
                  onClick={() => {
                    setPastingBoxText(item.originText);
                  }}
                >
                  Upload Text
                </Button>
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>
    </div>
  );
}

function FilesDroppingBox(props) {
  const draggerProps = {
    name: "file",
    onChange: (info) => {
      if (info.file.type !== "text/plain") {
        message.error(`${info.file.name} is not a text file`);
      } else {
        const reader = new FileReader();
        reader.readAsText(info.file.originFileObj);
        reader.onload = function (e) {
          let str = e.target.result;
          let obj = {
            originText: str,
            name: info.file.name,
            size: `${info.file.size / 1000}KB`,
          };
          props.setFileList({
            ...obj,
            ...encodeText(str),
          });
        };
      }
    },
    itemRender: () => {
      return null;
    },
  };

  return (
    <>
      <Dragger className="workbench files-workbench" {...draggerProps}>
        <img className="icon" src={UploadIcon} alt="upload" />
        <Title className="text" level={4}>
          Drop your .text files here!
        </Title>
        <p className="ant-upload-hint">
          Support for a single or bulk upload. And only support for English
          character input.
        </p>
      </Dragger>
    </>
  );
}

function TextPastingBox(props) {
  const [text, setText] = useState("");
  const [encodedText, setEncodedText] = useState("");
  const [rate, setRate] = useState(0);

  useEffect(() => {
    setText(props.text);
  }, [props]);

  return (
    <>
      <div className="workbench">
        <TextArea
          rows={8}
          placeholder="Paste your text here!"
          showCount
          allowClear
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
        />
        <Button
          type="primary"
          shape="round"
          size="large"
          onClick={() => {
            const { encodedText, rate } = encodeText(text);
            setEncodedText(encodedText);
            setRate(rate);
          }}
        >
          Encode Text
        </Button>
        {encodedText ? (
          <>
            {" "}
            <Paragraph
              className="encodeText-box"
              copyable={{ text: encodedText }}
              ellipsis={{ rows: 5, expandable: true, symbol: "more" }}
            >
              {encodedText}
            </Paragraph>
            <Typography style={{ textAlign: "right" }}>{`Compression Ratio: ${
              rate * 100
            }%`}</Typography>
          </>
        ) : null}
      </div>
    </>
  );
}

export default Index;
